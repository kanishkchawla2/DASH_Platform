import fs from 'fs';
import path from 'path';

const RESEARCH_PACKS_DIR = path.resolve(process.cwd(), '..', 'site', 'public', 'research-packs');

export async function GET(req, { params }) {
  const { symbol } = await params;

  const packDir = path.join(RESEARCH_PACKS_DIR, symbol);
  const packJson = path.join(packDir, 'pack.json');

  if (!fs.existsSync(packJson)) {
    return Response.json({ error: 'Report not found', pack: null }, { status: 404 });
  }

  try {
    const pack = JSON.parse(fs.readFileSync(packJson, 'utf-8'));
    return Response.json({ pack });
  } catch (err) {
    return Response.json({ error: 'Failed to load report', pack: null }, { status: 500 });
  }
}
