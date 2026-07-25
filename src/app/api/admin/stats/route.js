import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = getDb();
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const totalRequests = db.prepare('SELECT COUNT(*) as count FROM requests').get();
  const queued = db.prepare("SELECT COUNT(*) as count FROM requests WHERE status = 'queued'").get();
  const completed = db.prepare("SELECT COUNT(*) as count FROM requests WHERE status = 'completed'").get();
  const failed = db.prepare("SELECT COUNT(*) as count FROM requests WHERE status = 'failed'").get();
  const processing = db.prepare("SELECT COUNT(*) as count FROM requests WHERE status = 'processing'").get();

  return Response.json({
    users: totalUsers.count,
    requests: totalRequests.count,
    queued: queued.count,
    completed: completed.count,
    failed: failed.count,
    processing: processing.count,
  });
}
