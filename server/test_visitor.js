import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const societies = await prisma.society.findMany({ take: 1 });
    const users = await prisma.user.findMany({ where: { role: 'GUARD' }, take: 1 });
    
    if(!societies.length || !users.length) {
      console.log('MISSING SEED DATA');
      return;
    }
    
    console.log('Testing creation...');
    const res = await prisma.visitor.create({
      data: {
        name: 'Test Visitor',
        purpose: 'Guest',
        wing: 'A',
        flatNumber: '101',
        contact: null,
        visitorType: 'Guest',
        vehicleNumber: null,
        status: 'ENTERED',
        documentImage: null,
        isWalkIn: true,
        creator: { connect: { id: users[0].id } },
        society: { connect: { id: societies[0].id } },
      }
    });
    console.log('SUCCESS:', res.id);
  } catch (err) {
    console.error('PRISMA ERR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
