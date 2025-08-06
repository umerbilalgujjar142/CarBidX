const { Client } = require('pg');

async function resetAuction() {
  const client = new Client({
    connectionString:
      'postgresql://postgres:password@localhost:5432/auction_db',
  });

  try {
    await client.connect();

    const deleteResult = await client.query(
      'DELETE FROM "Bid" WHERE "auctionId" = 1',
    );

    const updateResult = await client.query(`
      UPDATE "Auction" 
      SET "status" = 'active', "currentBid" = 6000, "winnerId" = NULL 
      WHERE "id" = 1
    `);

    const auctionResult = await client.query(
      'SELECT * FROM "Auction" WHERE "id" = 1',
    );

    const bidCount = await client.query(
      'SELECT COUNT(*) FROM "Bid" WHERE "auctionId" = 1',
    );
  } catch (error) {
    console.error('Error resetting auction:', error);
  } finally {
    await client.end();
  }
}

resetAuction();
