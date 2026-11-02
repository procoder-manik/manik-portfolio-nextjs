import { NextResponse } from 'next/server';
import { adminRoute } from '@/lib/server-auth';
import { dbConnect, hasDB } from '@/lib/db';
import { Project, Post, Order, Message, Package } from '@/lib/models';
import { serialize } from '@/lib/utils';
import { can } from '@/lib/roles';

export const GET = adminRoute(async (req, ctx, admin) => {
  if (!hasDB()) return NextResponse.json({ noDB: true });
  await dbConnect();
  const [projects, posts, packages] = await Promise.all([Project.countDocuments(), Post.countDocuments(), Package.countDocuments({ active: true })]);
  // Orders and messages hold customer details, so only roles with the shop area get them.
  if (!can(admin.role, 'shop')) return NextResponse.json({ projects, posts, packages, shop: false, recentOrders: [], recentMessages: [] });
  const [unread, openOrders, paid, recentOrders, recentMessages] = await Promise.all([
    Message.countDocuments({ read: false }), Order.countDocuments({ status: { $in: ['pending_payment', 'verifying', 'paid', 'in_progress'] } }),
    Order.aggregate([{ $match: { status: { $in: ['paid', 'in_progress', 'completed'] } } }, { $group: { _id: '$currency', total: { $sum: '$amount' } } }]),
    Order.find().select('status createdAt package.name customer.name').sort({ createdAt: -1 }).limit(6).lean(), Message.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);
  return NextResponse.json(serialize({ shop: true, projects, posts, packages, unread, openOrders, revenue: paid, recentOrders, recentMessages }));
});
