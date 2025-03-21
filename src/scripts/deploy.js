const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const FusionCardNFT = await ethers.getContractFactory("FusionCardNFT");
  const fusionCardNFT = await FusionCardNFT.deploy();
  await fusionCardNFT.waitForDeployment();

  console.log("FusionCardNFT deployed to:", await fusionCardNFT.getAddress());

  // Set the game server address (this should be your backend server's wallet address)
  // const gameServerAddress = "YOUR_GAME_SERVER_ADDRESS";
  // await fusionCardNFT.setGameServerAddress(gameServerAddress);
  // console.log("Game server address set to:", gameServerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 