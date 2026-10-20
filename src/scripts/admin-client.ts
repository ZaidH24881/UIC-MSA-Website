import { validate } from '../lib/admin-schema.mjs';
import { boardEmails } from '../data/board-access';
export type RecordData = {
  kind: string;
  id: string;
  data: Record<string, any>;
  revision: number;
  schemaVersion: number;
  archived: boolean;
  updatedAt: string;
  publishedAt: string;
  updatedBy: string;
};
export const configured = Boolean(
  import.meta.env.PUBLIC_FIREBASE_API_KEY && import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
);
let demoPromise: Promise<boolean>;
export function demoMode() {
  return (demoPromise ||= ['127.0.0.1', 'localhost'].includes(location.hostname)
    ? fetch('/__admin/session', { cache: 'no-store' })
        .then((r) => r.ok)
        .catch(() => false)
    : Promise.resolve(false));
}
async function api(path: string, body?: unknown) {
  const response = await fetch('/__admin/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || 'Request failed.');
  return value;
}
async function firebase() {
  if (!configured) throw new Error('Board sign-in needs the Firebase environment configuration.');
  return import('../lib/firebase-client');
}
function normalize(data: Record<string, any>): RecordData {
  return {
    ...data,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt || '',
    publishedAt: data.publishedAt?.toDate?.().toISOString() || data.publishedAt || '',
  } as RecordData;
}
export async function session() {
  if (await demoMode()) return api('session');
  if (!configured) return { user: null, demo: false, configured: false };
  const { auth } = await firebase();
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) return { user: null, demo: false, configured: true };
  const token = await user.getIdTokenResult();
  return {
    user: user.email,
    editor: user.emailVerified && boardEmails.includes(user.email || ''),
    treasurer: token.claims.msaRole === 'treasurer' || token.claims.msaRole === 'admin',
    demo: false,
    configured: true,
  };
}
export async function login(password: string) {
  if (await demoMode()) return api('login', { password });
  const { auth } = await firebase();
  const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
  await signInWithPopup(auth, new GoogleAuthProvider());
  return session();
}
export async function logout() {
  if (await demoMode()) return api('logout', {});
  const { auth } = await firebase();
  const { signOut } = await import('firebase/auth');
  await signOut(auth);
}
export async function published(): Promise<RecordData[]> {
  if (await demoMode()) return api('published');
  if (!configured) return [];
  const { db } = await firebase();
  const { getDocs, collection } = await import('firebase/firestore/lite');
  const result = await getDocs(collection(db, 'cmsPublic'));
  return result.docs.map((d) => normalize(d.data()));
}
export async function privateRecords(type: 'drafts' | 'history'): Promise<RecordData[]> {
  if (await demoMode()) return api(type);
  const { db } = await firebase();
  const { getDocs, collection } = await import('firebase/firestore/lite');
  return (await getDocs(collection(db, type === 'drafts' ? 'cmsDrafts' : 'cmsHistory'))).docs.map(
    (d) => normalize(d.data()),
  );
}
export async function save(record: RecordData, action: 'draft' | 'publish') {
  validate(record.kind, record.data);
  if (await demoMode()) return api('save', { record, action });
  const { db, auth } = await firebase();
  const { doc, runTransaction, serverTimestamp } = await import('firebase/firestore/lite');
  const key = `${record.kind}--${record.id}`;
  return runTransaction(db, async (transaction) => {
    const target = doc(db, 'cmsPublic', key);
    const snapshot = await transaction.get(target);
    const revision = snapshot.exists() ? snapshot.data().revision : 0;
    if (revision !== record.revision)
      throw new Error(
        'Someone published a newer revision. Reload before publishing; your form still contains your edits.',
      );
    const next = {
      ...record,
      revision: action === 'publish' ? revision + 1 : revision,
      schemaVersion: 1,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.email || '',
      publishedAt:
        action === 'publish'
          ? serverTimestamp()
          : snapshot.exists()
            ? snapshot.data().publishedAt
            : null,
    };
    const draftRef = doc(db, 'cmsDrafts', key);
    const draft = await transaction.get(draftRef);
    if (draft.exists() && normalize(draft.data()).updatedAt !== record.updatedAt)
      throw new Error('A newer draft exists. Reload before saving or publishing your edits.');
    if (action === 'draft') {
      transaction.set(draftRef, next);
    } else {
      transaction.set(target, next);
      transaction.set(doc(db, 'cmsHistory', `${key}--${next.revision}`), next);
      if (draft.exists()) transaction.delete(draftRef);
    }
    return { ...record, revision: next.revision };
  });
}
