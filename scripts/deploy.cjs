const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const FusionCardNFT = await hre.ethers.getContractFactory("FusionCardNFT");
  const fusionCardNFT = await FusionCardNFT.deploy();
  await fusionCardNFT.waitForDeployment();

  const address = await fusionCardNFT.getAddress();
  console.log("FusionCardNFT deployed to:", address);

  // Set the game server address (for testing, we'll use the deployer)
  await fusionCardNFT.setGameServerAddress(deployer.address);
  console.log("Game server address set to:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 