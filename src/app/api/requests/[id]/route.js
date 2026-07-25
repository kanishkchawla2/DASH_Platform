import { getUserId } from '@/lib/auth';
import { getRequestById } from '@/lib/db';

export async function GET(req, { params }) {
  const { id } = await params;
  const { userId } = await getUserId();

  const request = getRequestById(id);
  if (!request) {
    return Response.json({ error: 'Request not found' }, { status: 404 });
  }

  if (request.user_id !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  return Response.json({ request });
}
