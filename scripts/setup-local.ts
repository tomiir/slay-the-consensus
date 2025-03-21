import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

async function setupLocal() {
  try {
    // Start local blockchain
    console.log('Starting local blockchain...');
    const nodeProcess = exec('npx hardhat node');
    nodeProcess.stdout?.pipe(process.stdout);

    // Wait for blockchain to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Deploy contract
    console.log('Deploying contract...');
    const { stdout } = await execAsync('npx hardhat run scripts/deploy.ts --network localhost');
    console.log(stdout);

    // Extract contract address
    const match = stdout.match(/FusionCardNFT deployed to: (0x[a-fA-F0-9]{40})/);
    if (match) {
      const contractAddress = match[1];
      console.log('Contract deployed to:', contractAddress);

      // Update .env file
      const envPath = path.join(process.cwd(), '.env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const updatedContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
      fs.writeFileSync(envPath, updatedContent);
      console.log('Updated .env file with contract address');
    }

    // Keep the node process running
    process.on('SIGINT', () => {
      nodeProcess.kill();
      process.exit();
    });
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupLocal(); 