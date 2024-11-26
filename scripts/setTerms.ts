import { hashEscrowAgreement } from "../frontend/lib/terms";
import { ethers } from "hardhat";

//OPBNB TESTNET ADDRESS FOR MY ESCROW
const escrowAddress = "0x30A31f1A6bD5e2b95FaAD4C6b8899886754d9B75";

async function main() {
  //Connect to the escrow contract and set the terms

  const Escrow = await ethers.getContractFactory("Escrow");

  const escrow = await Escrow.attach(escrowAddress);

  const termsHash = await hashEscrowAgreement();

  await escrow.setTerms(termsHash);

  console.log("Terms set to ", termsHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
