import { hashEscrowAgreement } from "../frontend/lib/terms";
import { ethers } from "hardhat";

//OPBNB TESTNET ADDRESS SimpleTerms
const simpleTermsAddress = "0x766c30d0725bC93cC0d7F9B7c3C6E03c039e0981";

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
