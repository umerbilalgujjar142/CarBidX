const { io } = require('socket.io-client');

async function testAllClients() {
  console.log('Testing all clients simultaneously...');

  const clients = [];
  const results = [];

  // Create 3 clients
  for (let i = 1; i <= 3; i++) {
    const socket = io('http://localhost:4000/auction', {
      transports: ['websocket'],
    });

    const clientId = i;
    const clientResults = [];

    socket.on('connect', () => {
      console.log(`Client ${clientId} connected`);
      socket.emit('joinAuction', { auctionId: 1, userId: clientId });
    });

    socket.on('joinedAuction', () => {
      console.log(`Client ${clientId} joined auction`);

      // Place bid after a delay based on client ID
      setTimeout(
        () => {
          const amount = 6100 + clientId * 100;
          console.log(`Client ${clientId} placing bid: ${amount}`);
          socket.emit('placeBid', {
            auctionId: 1,
            userId: clientId,
            amount: amount,
          });
        },
        1000 + clientId * 500,
      );
    });

    socket.on('bidPending', (data) => {
      console.log(`Client ${clientId} bid pending:`, data);
    });

    socket.on('bidUpdate', (data) => {
      console.log(`Client ${clientId} bid update:`, data);
      clientResults.push({ type: 'success', data });
    });

    socket.on('bidError', (data) => {
      console.log(`Client ${clientId} bid error:`, data);
      clientResults.push({ type: 'error', data });
    });

    socket.on('disconnect', () => {
      console.log(`Client ${clientId} disconnected`);
    });

    clients.push(socket);
    results.push(clientResults);
  }

  // Wait for all bids to be processed
  setTimeout(() => {
    console.log('\n=== Test Results ===');
    results.forEach((clientResults, index) => {
      console.log(`Client ${index + 1} results:`, clientResults);
    });

    // Disconnect all clients
    clients.forEach((socket) => socket.disconnect());
    process.exit(0);
  }, 10000);
}

testAllClients();
