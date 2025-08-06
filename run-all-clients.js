const { spawn } = require('child_process');

// Start User 1
const user1 = spawn('node', ['test-client.js', '1'], { stdio: 'inherit' });

setTimeout(() => {
  const user2 = spawn('node', ['test-client.js', '2'], { stdio: 'inherit' });
}, 1000);

setTimeout(() => {
  const user3 = spawn('node', ['test-client.js', '3'], { stdio: 'inherit' });
}, 2000);

process.on('SIGINT', () => {
  process.exit(0);
});
