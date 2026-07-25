import { auth } from '@/lib/auth';
import { getRequestById, getAllRequests } from '@/lib/db';

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const request = getRequestById(id);
  if (!request) {
    return Response.json({ error: 'Request not found' }, { status: 404 });
  }

  if (request.user_id !== session.user.id && session.user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  return Response.json({ request });
}
