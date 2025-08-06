const { spawn } = require('child_process');

// Function to run a single client
function runClient(userId) {
  return new Promise((resolve) => {
    const client = spawn('node', ['test-client.js', userId.toString()], {
      stdio: 'inherit',
    });

    client.on('close', (code) => {
      resolve();
    });
  });
}

// Run clients sequentially with delays
async function runSequentialTest() {
  try {
    // Start User 1 (resetter)
    await runClient(1);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await runClient(2);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await runClient(3);
  } catch (error) {
    console.error('Error in sequential test:', error);
  }
}

runSequentialTest();
