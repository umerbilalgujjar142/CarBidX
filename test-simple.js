const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function resetAuction() {
  try {
    const deletedBids = await prisma.bid.deleteMany({
      where: { auctionId: 1 },
    });

    const updatedAuction = await prisma.auction.update({
      where: { id: 1 },
      data: {
        status: 'active',
        currentBid: 6000,
        winnerId: null,
      },
    });
  } catch (error) {
    console.error('Error resetting auction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAuction();
