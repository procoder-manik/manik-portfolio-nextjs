import { NextResponse } from 'next/server';
import { adminRoute } from '@/lib/server-auth';
import { dbConnect, hasDB } from '@/lib/db';
import { Project, Post, Order, Message, Package } from '@/lib/models';
import { serialize } from '@/lib/utils';

export const GET = adminRoute(async () => {
  if (!hasDB()) return NextResponse.json({ noDB: true });
  await dbConnect();
  const [projects, posts, packages, unread, openOrders, paid, recentOrders, recentMessages] = await Promise.all([
    Project.countDocuments(), Post.countDocuments(), Package.countDocuments({ active: true }),
    Message.countDocuments({ read: false }), Order.countDocuments({ status: { $in: ['pending_payment', 'verifying', 'paid', 'in_progress'] } }),
    Order.aggregate([{ $match: { status: { $in: ['paid', 'in_progress', 'completed'] } } }, { $group: { _id: '$currency', total: { $sum: '$amount' } } }]),
    Order.find().sort({ createdAt: -1 }).limit(6).lean(), Message.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);
  return NextResponse.json(serialize({ projects, posts, packages, unread, openOrders, revenue: paid, recentOrders, recentMessages }));
});
