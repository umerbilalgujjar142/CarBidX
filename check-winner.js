const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function checkWinner() {
  try {
    console.log('Checking auction winner...');

    // Direct query to check auction
    const auction = await prisma.auction.findUnique({
      where: { id: 1 },
      select: {
        id: true,
        status: true,
        currentBid: true,
        startingBid: true,
        winnerId: true,
      },
    });

    if (auction) {
      console.log('Auction details:', auction);

      if (auction.winnerId) {
        console.log(
          `Winner: User ${auction.winnerId} with bid $${auction.currentBid}`,
        );
      } else {
        console.log('No winner set yet');
      }
    } else {
      console.log('Auction not found');
    }

    // Also check the highest bid
    const highestBid = await prisma.bid.findFirst({
      where: { auctionId: 1 },
      orderBy: { amount: 'desc' },
    });

    if (highestBid) {
      console.log('Highest bid:', {
        userId: highestBid.userId,
        amount: highestBid.amount,
        timestamp: highestBid.timestamp,
      });
    }
  } catch (error) {
    console.error('Error checking winner:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWinner();
