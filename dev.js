const { exec, spawn } = require('child_process');
const readline = require('readline');

console.log('==================================');
console.log('    CLAUDE DESKTOP FOR CODERS    ');
console.log('==================================');
console.log('A desktop client for Claude AI with special features for developers');
console.log('');

// Start React server
console.log('Starting React development server...');
const reactProcess = spawn('npm', ['run', 'start-react'], { 
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});

// Log React output
reactProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Compiled successfully')) {
    console.log('React server started successfully!');
    console.log('Starting Electron app...');
    
    // Start Electron app after React server is ready
    console.log('React is ready, starting Electron with NODE_ENV=development...');
    const electronProcess = spawn('npm', ['run', 'start-electron'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' }
    });

    // Handle Electron process exit
    electronProcess.on('close', (code) => {
      console.log(`Electron app exited with code ${code}`);
      // Kill React server when Electron exits
      reactProcess.kill();
      process.exit(0);
    });
  } else {
    console.log(output.trim());
  }
});

reactProcess.stderr.on('data', (data) => {
  console.error(data.toString().trim());
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  reactProcess.kill();
  process.exit(0);
});

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
    console.log('Shutting down...');
    reactProcess.kill();
    process.exit(0);
  }
});