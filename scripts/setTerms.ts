import {hashEscrowAgreement} from "../frontend/lib/terms";
import { ethers } from "hardhat";

const escrowAddress = "";

async function main() {
 
 //Connect to the escrow contract and set the terms

  const Escrow = await ethers.getContractFactory("Escrow");

  const escrow = await Escrow.attach(escrowAddress);

  const termsHash = await hashEscrowAgreement()

  await escrow.setTerms(termsHash);

  console.log("Escrow deployed to:", escrow.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
