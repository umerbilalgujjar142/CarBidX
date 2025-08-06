const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function manualTest() {
  try {
    // Step 1: Reset auction
    await prisma.bid.deleteMany({ where: { auctionId: 1 } });
    await prisma.auction.update({
      where: { id: 1 },
      data: { status: 'active', currentBid: 6000, winnerId: null },
    });

    // Step 2: Simulate User 1 bid
    const bid1 = await prisma.bid.create({
      data: {
        userId: 1,
        auctionId: 1,
        amount: 6200,
        timestamp: new Date().toISOString(),
      },
    });
    await prisma.auction.update({
      where: { id: 1 },
      data: { currentBid: 6200 },
    });

    // Step 3: Simulate User 2 bid
    const bid2 = await prisma.bid.create({
      data: {
        userId: 2,
        auctionId: 1,
        amount: 6300,
        timestamp: new Date().toISOString(),
      },
    });
    await prisma.auction.update({
      where: { id: 1 },
      data: { currentBid: 6300 },
    });

    // Step 4: Simulate User 3 bid
    const bid3 = await prisma.bid.create({
      data: {
        userId: 3,
        auctionId: 1,
        amount: 6400,
        timestamp: new Date().toISOString(),
      },
    });
    await prisma.auction.update({
      where: { id: 1 },
      data: { currentBid: 6400 },
    });

    // Step 5: End auction and set winner
    const updatedAuction = await prisma.auction.update({
      where: { id: 1 },
      data: {
        status: 'ended',
        winnerId: 3, // User 3 should win with 6400
        currentBid: 6400,
      },
    });

    // Step 6: Verify results
    const finalAuction = await prisma.auction.findUnique({ where: { id: 1 } });
    const allBids = await prisma.bid.findMany({
      where: { auctionId: 1 },
      orderBy: { amount: 'desc' },
    });
  } catch (error) {
    console.error('Error in manual test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualTest();
