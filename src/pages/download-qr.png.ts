import { createRequire } from 'node:module';
import { apkUrl } from '../data/showcase';

const QRCode = createRequire(import.meta.url)('qrcode');

export async function GET() {
  if (!apkUrl) return new Response(null, { status: 404 });
  const png = await QRCode.toBuffer(apkUrl, {
    width: 768, margin: 4, errorCorrectionLevel: 'M',
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}
