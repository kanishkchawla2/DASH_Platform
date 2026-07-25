import { auth } from '@/lib/auth';
import { getAllRequests, updateRequestStatus } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const requests = getAllRequests(200);
  return Response.json({ requests });
}

export async function PATCH(req) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, status, error } = await req.json();
  if (!id || !status) {
    return Response.json({ error: 'id and status are required' }, { status: 400 });
  }

  updateRequestStatus(id, status, error || null);
  return Response.json({ success: true });
}
