import { auth } from '@/lib/auth';
import { createRequest, getRequestsByUser, getUsage, incrementUsage } from '@/lib/db';
import { nanoid } from 'nanoid';

const FREE_REPORT_LIMIT = 5;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const requests = getRequestsByUser(session.user.id);
  return Response.json({ requests });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { symbol, notes = '' } = await req.json();
  if (!symbol || typeof symbol !== 'string') {
    return Response.json({ error: 'Symbol is required' }, { status: 400 });
  }

  const cleanSymbol = symbol.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!cleanSymbol) {
    return Response.json({ error: 'Invalid symbol' }, { status: 400 });
  }

  const used = getUsage(session.user.id);
  if (used >= FREE_REPORT_LIMIT) {
    return Response.json({
      error: `You've used all ${FREE_REPORT_LIMIT} free reports. Please subscribe to generate more.`,
      code: 'limit_reached',
    }, { status: 403 });
  }

  const id = nanoid(12);
  createRequest({
    id,
    userId: session.user.id,
    symbol: cleanSymbol,
    companyName: '',
    notes,
  });

  incrementUsage(session.user.id);

  return Response.json({
    success: true,
    requestId: id,
    symbol: cleanSymbol,
    remaining: FREE_REPORT_LIMIT - used - 1,
    message: `Report queued for ${cleanSymbol}`,
  });
}
