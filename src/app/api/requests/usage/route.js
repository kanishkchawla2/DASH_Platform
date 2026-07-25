import { getUserId } from '@/lib/auth';
import { getUsage } from '@/lib/db';

const FREE_LIMIT = 5;

export async function GET() {
  const { userId } = await getUserId();
  const count = getUsage(userId);
  return Response.json({ count, limit: FREE_LIMIT, remaining: Math.max(0, FREE_LIMIT - count) });
}
