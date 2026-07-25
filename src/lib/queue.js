import { getDb, updateRequestStatus } from './db';
import { execSync } from 'child_process';
import path from 'path';

const PROJECT_ROOT = path.resolve(process.cwd(), '..');

export function getNextQueuedRequest() {
  return getDb().prepare(
    "SELECT * FROM requests WHERE status = 'queued' ORDER BY created_at ASC LIMIT 1"
  ).get() || null;
}

export function processRequest(request) {
  if (!request) return;

  try {
    updateRequestStatus(request.id, 'processing');

    const scriptPath = path.join(PROJECT_ROOT, 'scripts', 'generate_stock_pack.py');

    const result = execSync(
      `python3 "${scriptPath}" "${request.symbol}"`,
      { cwd: PROJECT_ROOT, timeout: 300000, encoding: 'utf-8' }
    );

    updateRequestStatus(request.id, 'completed');
    return { success: true, output: result };
  } catch (error) {
    updateRequestStatus(request.id, 'failed', error.message);
    return { success: false, error: error.message };
  }
}

export function pollAndProcess() {
  const request = getNextQueuedRequest();
  if (request) {
    console.log(`[Queue] Processing request ${request.id} for ${request.symbol}`);
    return processRequest(request);
  }
  return null;
}
