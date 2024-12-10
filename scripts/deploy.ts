import { ethers } from "hardhat";

async function main() {
  const SimpleTerms = await ethers.getContractFactory("SimpleTerms");

  const simpleTerms = await SimpleTerms.deploy();

  console.log("SimpleTerms deployed to:", simpleTerms.address);

  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");

  const registry = await AgentRegistry.deploy(simpleTerms.address);

  console.log("Registry deployed to:", registry.address);
  //opbnb testnet latest
  //   SimpleTerms deployed to: 0xCEC9445f1beA5e10D4cA38d6f66A4BdD57a9420E
  // Registry deployed to: 0xE08D5a45611fCbe8f91b7E4b47156213f592E8C1
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
