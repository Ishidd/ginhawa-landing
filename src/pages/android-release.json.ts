import { androidRelease } from '../data/showcase';

export function GET() {
  return Response.json(androidRelease, { headers: { 'Cache-Control': 'no-store' } });
}
