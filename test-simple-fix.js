const { io } = require('socket.io-client');

async function testSimpleFix() {
  console.log('Testing simple bid processing...');

  const socket = io('http://localhost:4000/auction', {
    transports: ['websocket'],
  });

  let results = [];

  socket.on('connect', () => {
    console.log('Connected to auction server');
    socket.emit('joinAuction', { auctionId: 1, userId: 999 });
  });

  socket.on('joinedAuction', () => {
    console.log('Joined auction, testing bids...');

    // Test 1: Place a bid that should succeed
    setTimeout(() => {
      console.log('Placing bid 1: 6500');
      socket.emit('placeBid', {
        auctionId: 1,
        userId: 999,
        amount: 6500,
      });
    }, 1000);

    // Test 2: Place a bid that should fail (too low)
    setTimeout(() => {
      console.log('Placing bid 2: 6400 (should fail - too low)');
      socket.emit('placeBid', {
        auctionId: 1,
        userId: 999,
        amount: 6400,
      });
    }, 3000);

    // End test
    setTimeout(() => {
      console.log('\n=== Test Results ===');
      console.log('Results:', results);
      socket.disconnect();
      process.exit(0);
    }, 6000);
  });

  socket.on('bidPending', (data) => {
    console.log('Bid pending:', data);
  });

  socket.on('bidUpdate', (data) => {
    console.log('Bid update:', data);
    results.push({ type: 'success', data });
  });

  socket.on('bidError', (data) => {
    console.log('Bid error:', data);
    results.push({ type: 'error', data });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from auction server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}

testSimpleFix();
