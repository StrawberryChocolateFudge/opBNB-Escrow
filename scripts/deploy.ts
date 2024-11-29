import { ethers } from "hardhat";

async function main() {
  // const SimpleTerms = await ethers.getContractFactory("SimpleTerms");

  // const simpleTerms = await SimpleTerms.deploy();

  // console.log("SimpleTerms deployed to:", simpleTerms.address);

  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");

  const registry = await AgentRegistry.deploy("0x766c30d0725bC93cC0d7F9B7c3C6E03c039e0981");

  console.log("Registry deployed to:", registry.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
