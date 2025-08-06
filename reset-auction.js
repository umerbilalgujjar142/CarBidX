const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function resetAuction() {
  try {
    console.log('Resetting auction...');

    // Delete all bids for auction 1
    const deletedBids = await prisma.bid.deleteMany({
      where: { auctionId: 1 },
    });
    console.log(`Deleted ${deletedBids.count} bids`);

    // Reset auction to initial state
    const updatedAuction = await prisma.auction.update({
      where: { id: 1 },
      data: {
        status: 'active',
        currentBid: 6000,
        winnerId: null,
      },
    });

    console.log('Auction reset successfully:', {
      id: updatedAuction.id,
      status: updatedAuction.status,
      currentBid: updatedAuction.currentBid,
    });
  } catch (error) {
    console.error('Error resetting auction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAuction();
