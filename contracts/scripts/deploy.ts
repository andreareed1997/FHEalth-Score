import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.deployContract("FHEalthScore");
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`FHEalthScore deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

