import { auth } from '@/lib/auth';
import { getUsage } from '@/lib/db';

const FREE_LIMIT = 5;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const count = getUsage(session.user.id);
  return Response.json({ count, limit: FREE_LIMIT, remaining: Math.max(0, FREE_LIMIT - count) });
}
