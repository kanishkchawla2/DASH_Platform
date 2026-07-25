import fs from 'fs';
import path from 'path';

const RESEARCH_PACKS_DIR = path.resolve(process.cwd(), '..', 'site', 'public', 'research-packs');

export async function GET(req, { params }) {
  const segments = await params;
  const filePath = segments.path.join('/');

  const resolvedPath = path.resolve(RESEARCH_PACKS_DIR, filePath);

  if (!resolvedPath.startsWith(RESEARCH_PACKS_DIR)) {
    return new Response('Forbidden', { status: 403 });
  }

  if (!fs.existsSync(resolvedPath)) {
    // Fall back to looking inside the symbol directory
    const parts = segments.path;
    if (parts.length >= 2) {
      const [symbol, ...rest] = parts;
      const altPath = path.resolve(RESEARCH_PACKS_DIR, symbol, rest.join('/'));
      if (altPath.startsWith(RESEARCH_PACKS_DIR) && fs.existsSync(altPath)) {
        return serveFile(altPath);
      }
    }
    return new Response('Not found', { status: 404 });
  }

  return serveFile(resolvedPath);
}

function serveFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.md': 'text/markdown',
    '.css': 'text/css',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

export const dynamic = 'force-dynamic';
