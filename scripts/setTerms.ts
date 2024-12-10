import { hashEscrowAgreement } from "../frontend/lib/terms";
import { ethers } from "hardhat";

//OPBNB TESTNET ADDRESS SimpleTerms
const simpleTermsAddress = "0xCEC9445f1beA5e10D4cA38d6f66A4BdD57a9420E";

async function main() {
  //Connect to the escrow contract and set the terms

  const SimpleTerms = await ethers.getContractFactory("SimpleTerms");

  const terms = await SimpleTerms.attach(simpleTermsAddress);

  const termsHash = await hashEscrowAgreement();

  await terms.setTerms(termsHash);

  console.log("Terms set to ", termsHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
