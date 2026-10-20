import { seedRecords } from '../lib/admin-seed';
export function GET() {
  return new Response(JSON.stringify(seedRecords), {
    headers: { 'Content-Type': 'application/json' },
  });
}
