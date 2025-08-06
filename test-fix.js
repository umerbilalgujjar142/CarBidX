const { io } = require('socket.io-client');

async function testBidProcessing() {
  console.log('Testing bid processing fix...');

  const socket = io('http://localhost:4000/auction', {
    transports: ['websocket'],
  });

  let bidResults = [];

  socket.on('connect', () => {
    console.log('Connected to auction server');
    socket.emit('joinAuction', { auctionId: 1, userId: 999 });
  });

  socket.on('joinedAuction', () => {
    console.log('Joined auction, testing bids...');

    // Test bid 1: Should succeed
    setTimeout(() => {
      console.log('Placing bid 1: 6200');
      socket.emit('placeBid', { auctionId: 1, userId: 999, amount: 6200 });
    }, 1000);

    // Test bid 2: Should succeed
    setTimeout(() => {
      console.log('Placing bid 2: 6300');
      socket.emit('placeBid', { auctionId: 1, userId: 999, amount: 6300 });
    }, 2000);

    // Test bid 3: Should succeed
    setTimeout(() => {
      console.log('Placing bid 3: 6400');
      socket.emit('placeBid', { auctionId: 1, userId: 999, amount: 6400 });
    }, 3000);

    // Test bid 4: Should fail (too low)
    setTimeout(() => {
      console.log('Placing bid 4: 6300 (should fail - too low)');
      socket.emit('placeBid', { auctionId: 1, userId: 999, amount: 6300 });
    }, 4000);

    // End test
    setTimeout(() => {
      console.log('Test completed. Results:', bidResults);
      socket.disconnect();
      process.exit(0);
    }, 6000);
  });

  socket.on('bidPending', (data) => {
    console.log('Bid pending:', data);
  });

  socket.on('bidUpdate', (data) => {
    console.log('Bid update:', data);
    bidResults.push({ type: 'success', data });
  });

  socket.on('bidError', (data) => {
    console.log('Bid error:', data);
    bidResults.push({ type: 'error', data });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from auction server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}

testBidProcessing();
