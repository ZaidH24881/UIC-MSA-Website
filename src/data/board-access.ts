// UI-only allowlist: decides whether to reveal the add-event form after Google
// sign-in. This is NOT the security boundary — Firestore's security rules are
// what actually reject unauthorized writes, so keeping this list in sync with
// the rules matters for a good experience, not for security.
export const boardEmails: string[] = ['msaatuic@gmail.com', 'zhaid3@uic.edu'];
