const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function endAuction() {
  try {
    console.log('Ending auction...');

    // Find the highest bid for auction 1
    const highestBid = await prisma.bid.findFirst({
      where: { auctionId: 1 },
      orderBy: { amount: 'desc' },
    });

    if (!highestBid) {
      console.log('No bids found for auction 1');
      return;
    }

    console.log('Highest bid:', {
      userId: highestBid.userId,
      amount: highestBid.amount,
      timestamp: highestBid.timestamp,
    });

    // End the auction and set the winner
    const updatedAuction = await prisma.auction.update({
      where: { id: 1 },
      data: {
        status: 'ended',
        winnerId: highestBid.userId,
        currentBid: highestBid.amount,
      },
    });

    console.log('Auction ended successfully:', {
      id: updatedAuction.id,
      status: updatedAuction.status,
      currentBid: updatedAuction.currentBid,
      winnerId: updatedAuction.winnerId,
    });

    // Get all bids for auction 1
    const allBids = await prisma.bid.findMany({
      where: { auctionId: 1 },
      orderBy: { amount: 'desc' },
    });

    console.log('\nAll bids for auction 1:');
    allBids.forEach((bid, index) => {
      console.log(
        `${index + 1}. User ${bid.userId} - $${bid.amount} at ${bid.timestamp}`,
      );
    });
  } catch (error) {
    console.error('Error ending auction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

endAuction();
