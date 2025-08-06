const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function debugDatabase() {
  try {
    // Check if auction exists
    const auction = await prisma.auction.findUnique({
      where: { id: 1 },
    });

    if (auction) {
      // Check all bids for this auction
      const bids = await prisma.bid.findMany({
        where: { auctionId: 1 },
        orderBy: { amount: 'desc' },
      });

      // Check if there are any users
      const users = await prisma.user.findMany();

      // Find the highest bid
      const highestBid = await prisma.bid.findFirst({
        where: { auctionId: 1 },
        orderBy: { amount: 'desc' },
      });

      if (highestBid) {
        console.log(
          `\nExpected winner: User ${highestBid.userId} with amount ${highestBid.amount}`,
        );
      }
    } else {
      console.log('No auction found with ID 1');
    }
  } catch (error) {
    console.error('Error debugging database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();
