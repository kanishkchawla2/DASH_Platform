import { getUserId } from '@/lib/auth';
import { createRequest, getRequestsByUser, getUsage, incrementUsage, getUserById } from '@/lib/db';
import { nanoid } from 'nanoid';
import { sendNotification } from '@/lib/mail';

const FREE_REPORT_LIMIT = 5;

export async function GET() {
  const { userId } = await getUserId();
  const requests = getRequestsByUser(userId);
  return Response.json({ requests });
}

export async function POST(req) {
  const { userId, email, name } = await getUserId();

  const { symbol, notes = '' } = await req.json();
  if (!symbol || typeof symbol !== 'string') {
    return Response.json({ error: 'Symbol is required' }, { status: 400 });
  }

  const cleanSymbol = symbol.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!cleanSymbol) {
    return Response.json({ error: 'Invalid symbol' }, { status: 400 });
  }

  const used = getUsage(userId);
  if (used >= FREE_REPORT_LIMIT) {
    return Response.json({
      error: `You've used all ${FREE_REPORT_LIMIT} free reports. Please subscribe to generate more.`,
      code: 'limit_reached',
    }, { status: 403 });
  }

  const id = nanoid(12);
  createRequest({
    id,
    userId,
    symbol: cleanSymbol,
    companyName: '',
    notes,
  });

  incrementUsage(userId);

  sendNotification({
    symbol: cleanSymbol,
    userEmail: email,
    userName: name,
    notes,
    requestId: id,
  }).catch(err => console.error('[Mail] Failed:', err.message));

  return Response.json({
    success: true,
    requestId: id,
    symbol: cleanSymbol,
    remaining: FREE_REPORT_LIMIT - used - 1,
    message: `Report queued for ${cleanSymbol}`,
  });
}
