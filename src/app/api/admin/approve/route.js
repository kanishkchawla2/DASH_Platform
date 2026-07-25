import { auth } from '@/lib/auth';
import { getRequestById, updateRequestStatus } from '@/lib/db';
import { isMacReachable, runGenerationOnMac, rebuildIndexOnMac } from '@/lib/ssh';

export async function POST(req) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { requestId } = await req.json();
  if (!requestId) {
    return Response.json({ error: 'requestId required' }, { status: 400 });
  }

  const request = getRequestById(requestId);
  if (!request) {
    return Response.json({ error: 'Request not found' }, { status: 404 });
  }

  if (!process.env.TAILSCALE_MAC_IP) {
    updateRequestStatus(requestId, 'failed', 'Tailscale Mac IP not configured');
    return Response.json({ error: 'TAILSCALE_MAC_IP not set in env' }, { status: 500 });
  }

  const reachable = isMacReachable();
  if (!reachable) {
    updateRequestStatus(requestId, 'failed', 'Mac not reachable via Tailscale');
    return Response.json({ error: 'Mac not reachable via Tailscale' }, { status: 502 });
  }

  updateRequestStatus(requestId, 'processing');

  try {
    const result = runGenerationOnMac(request.symbol);
    rebuildIndexOnMac();
    updateRequestStatus(requestId, 'completed');
    return Response.json({ success: true, symbol: request.symbol, output: result.output?.slice(-500) });
  } catch (err) {
    updateRequestStatus(requestId, 'failed', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
