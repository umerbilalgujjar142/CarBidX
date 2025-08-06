const { io } = require('socket.io-client');

const socket = io('http://localhost:4000/auction', {
  transports: ['websocket'],
});

const userId = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
const totalUsers = process.argv[3] ? parseInt(process.argv[3], 10) : 3;

const enderId = 3;
const shouldEndAuction = userId === enderId;
const shouldResetAuction = userId === 1;

let state = {
  connected: false,
  joined: false,
  resetReceived: false,
  bidPlaced: false,
  bidConfirmed: false,
  receivedBids: new Set(),
  auctionEnded: false,
  allBidsPlaced: false,
  resetCount: 0,
};

// Listen for connection
socket.on('connect', () => {
  state.connected = true;

  if (shouldResetAuction && state.resetCount === 0) {
    socket.emit('resetAuction', { auctionId: 1 });
    state.resetCount++;
  }

  socket.emit('joinAuction', { auctionId: 1, userId });
});

socket.on('auctionReset', (data) => {
  state.resetReceived = true;

  // Only place bid if we haven't already and this is the first reset
  if (!state.bidPlaced && state.resetCount === 1) {
    setTimeout(() => {
      const amount = 6100 + userId * 100;
      socket.emit('placeBid', {
        auctionId: 1,
        userId,
        amount,
      });
      state.bidPlaced = true;
    }, 1000);
  }
});

socket.on('joinedAuction', (data) => {
  state.joined = true;

  // If not the resetter, place bid after a delay
  if (!shouldResetAuction && !state.bidPlaced) {
    setTimeout(
      () => {
        const amount = 6100 + userId * 100;
        socket.emit('placeBid', {
          auctionId: 1,
          userId,
          amount,
        });
        state.bidPlaced = true;
      },
      2000 + userId * 500,
    );
  }
});

socket.on('bidSubmitted', (data) => {});

socket.on('bidError', (data) => {
  console.log(`User ${userId} bid error:`, data);
  // If bid failed, try again with a higher amount
  if (!state.bidConfirmed) {
    const newAmount = 6100 + userId * 100 + 200;
    console.log(`User ${userId} retrying with amount:`, newAmount);
    setTimeout(() => {
      socket.emit('placeBid', {
        auctionId: 1,
        userId,
        amount: newAmount,
      });
    }, 1000);
  }
});

socket.on('bidPending', (data) => {
  console.log(`User ${userId} bid pending:`, data);
});

socket.on('bidUpdate', (data) => {
  // Track if this is our own bid confirmation
  if (data.userId === userId && !state.bidConfirmed) {
    state.bidConfirmed = true;
  }

  // Track unique bids received
  if (!state.receivedBids.has(data.userId)) {
    state.receivedBids.add(data.userId);
  }

  // Check if all users have placed bids
  if (state.receivedBids.size >= totalUsers && !state.allBidsPlaced) {
    state.allBidsPlaced = true;

    // End auction after a delay to ensure all bids are processed
    if (shouldEndAuction && !state.auctionEnded) {
      setTimeout(() => {
        socket.emit('auctionEnd', { auctionId: 1 });
        state.auctionEnded = true;
      }, 2000);
    }
  }
});

socket.on('auctionEnded', (data) => {
  if (data.winnerId) {
    console.log(`Winner is user ${data.winnerId} with amount ${data.amount}`);
  } else {
    console.log('No winner - no bids were placed');
  }

  // Exit after auction ends
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});

socket.on('disconnect', () => {
  state.connected = false;
});

socket.on('error', (error) => {
  console.error(`User ${userId} socket error:`, error);
});

// Handle process termination
process.on('SIGINT', () => {
  socket.disconnect();
  process.exit(0);
});
