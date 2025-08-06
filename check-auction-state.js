const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function checkAuctionState() {
  try {
    console.log('Checking auction state...');

    const auction = await prisma.auction.findUnique({
      where: { id: 1 },
    });

    if (!auction) {
      console.log('Auction not found, creating default auction...');
      await prisma.auction.create({
        data: {
          id: 1,
          carId: 1,
          startTime: new Date(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          startingBid: 5000,
          currentBid: 6000,
          status: 'active',
        },
      });
      console.log('Default auction created');
    } else {
      console.log('Current auction state:', {
        id: auction.id,
        status: auction.status,
        currentBid: auction.currentBid,
        startingBid: auction.startingBid,
        winnerId: auction.winnerId,
      });
    }

    const bids = await prisma.bid.findMany({
      where: { auctionId: 1 },
      orderBy: { timestamp: 'desc' },
    });

    console.log(`Found ${bids.length} bids for auction 1`);
    bids.forEach((bid, index) => {
      console.log(
        `Bid ${index + 1}: User ${bid.userId} - $${bid.amount} at ${bid.timestamp}`,
      );
    });
  } catch (error) {
    console.error('Error checking auction state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuctionState();
