import { execSync } from 'child_process';

const TAILSCALE_USER = process.env.TAILSCALE_MAC_USER || 'kanishk';
const TAILSCALE_IP = process.env.TAILSCALE_MAC_IP;
const PROJECT_DIR = process.env.MAC_PROJECT_DIR || '/Users/kanishk/DASH_Platform';

export function getTailscaleIp() {
  if (TAILSCALE_IP) return TAILSCALE_IP;
  try {
    const ip = execSync('tailscale ip -4', { encoding: 'utf-8' }).trim();
    return ip || null;
  } catch {
    return null;
  }
}

export function isMacReachable() {
  const ip = TAILSCALE_IP;
  if (!ip) return false;
  try {
    execSync(`ping -c 1 -W 3 ${ip}`, { encoding: 'utf-8', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export function runGenerationOnMac(symbol) {
  const ip = TAILSCALE_IP;
  if (!ip) {
    throw new Error('TAILSCALE_MAC_IP not configured');
  }

  const cmd = `ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${TAILSCALE_USER}@${ip} "cd ${PROJECT_DIR} && bash generate_pack.sh '${symbol}'"`;

  try {
    const output = execSync(cmd, {
      encoding: 'utf-8',
      timeout: 600000,
      maxBuffer: 50 * 1024 * 1024,
    });
    return { success: true, output };
  } catch (err) {
    const message = err.stderr || err.message || 'SSH failed';
    throw new Error(message);
  }
}

export function syncPackFromMac(symbol) {
  const ip = TAILSCALE_IP;
  if (!ip) {
    throw new Error('TAILSCALE_MAC_IP not configured');
  }

  const remotePath = `${PROJECT_DIR}/site/public/research-packs/${symbol}`;
  const localPath = `/app/site/public/research-packs/${symbol}`;

  const cmd = `scp -o StrictHostKeyChecking=no -o ConnectTimeout=10 -r ${TAILSCALE_USER}@${ip}:"${remotePath}" "${localPath}"`;

  try {
    execSync(cmd, { encoding: 'utf-8', timeout: 120000 });
    return { success: true };
  } catch (err) {
    throw new Error(`Sync failed: ${err.message}`);
  }
}

export function rebuildIndexOnMac() {
  const ip = TAILSCALE_IP;
  if (!ip) {
    throw new Error('TAILSCALE_MAC_IP not configured');
  }

  const cmd = `ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${TAILSCALE_USER}@${ip} "cd ${PROJECT_DIR} && python3 scripts/build_dashboard_data.py"`;

  try {
    execSync(cmd, { encoding: 'utf-8', timeout: 30000 });
    return { success: true };
  } catch (err) {
    throw new Error(`Index rebuild failed: ${err.message}`);
  }
}
