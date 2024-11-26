/* eslint-disable node/no-missing-import */
import Web3 from "web3";
import escrow from "../../artifacts/contracts/Escrow.sol/Escrow.json";
import { renderError } from "./views";

export const OPBNBTESTNETID = "0x15EB"; //5611

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    ethereum: any;
    Module: any;
  }
}

// Testnet address
const contractAddress = () => {
  const body = document.getElementsByTagName("body");

  const contract = body[0].dataset.contract;
  if (contract === undefined || contract.length === 0) {
    renderError("Invalid contract address");
  } else {
    return contract;
  }
};

export const getCurrentChainCurrency = () => "BNB";
const web3 = getWeb3();
const contract = getContract();

export async function getMyDetails(myaddress) {
  return await contract.methods
    .getMyDetails(myaddress)
    .call({ from: myaddress });
}

export async function getAcceptedTerms(address) {
  return await contract.methods.acceptedTerms(address).call({ from: address });
}

export async function getArbiter() {
  return await contract.methods.getArbiter().call();
}

export async function getFee(amount) {
  return await contract.methods.calculateFee(amount).call({});
}

export async function getDeprecated() {
  return await contract.methods.isDeprecated().call({});
}

export async function depositPay(to, amount, from, onError, onReceipt) {
  await contract.methods
    .depositPay(to)
    .send({ from, value: Web3.utils.toWei(amount) })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function deprecateEscrow(from, onError, onReceipt) {
  await contract.methods
    .deprecateEscrow()
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function confirmDelivery(jobNr, from, onError, onReceipt) {
  await contract.methods
    .confirmDelivery(jobNr)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function confirmRefund(jobNr, from, onError, onReceipt) {
  await contract.methods
    .confirmRefund(jobNr)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function refund(jobNr, address, onError, onReceipt) {
  await contract.methods
    .refund(jobNr)
    .send({ from: address })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function withdrawPay(jobNr, from, onError, onReceipt) {
  await contract.methods
    .withdrawPay(jobNr)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function createEscrow(buyer, seller, from, onError, onReceipt) {
  await contract.methods
    .createEscrow(buyer, seller)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function acceptTerms(termsHash, from, onError, onReceipt) {
  
  await contract.methods
    .accept(termsHash)
    .send({ from})
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function getDetailByIndex(index: string) {
  return await contract.methods.getDetailByIndex(index).call({});
}

export function getContract() {
  const web3 = getWeb3() as Web3;
  const abi = JSON.parse(JSON.stringify(escrow)).abi;
  const address = contractAddress();
  return new web3.eth.Contract(abi, address);
}

export function web3Injected(): boolean {
  if (window.ethereum.send) {
    return true;
  } else {
    return false;
  }
}

export function getWeb3() {
  if (window.ethereum === undefined) {
    window.open("https://metamask.io/", "_blank");
    return;
  }
  return new Web3(window.ethereum);
}

export async function requestAccounts() {
  await window.ethereum.request({ method: "eth_requestAccounts" });
}

export async function getAddress() {
  const web3 = getWeb3() as Web3;
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

async function ethereumRequestAddChain(
  hexchainId: string,
  chainName: string,
  name: string,
  symbol: string,
  decimals: number,
  rpcUrls: string[],
  blockExplorerUrls: string[],
) {
  //@ts-ignore
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: hexchainId,
        chainName,
        nativeCurrency: {
          name,
          symbol,
          decimals,
        },
        rpcUrls,
        blockExplorerUrls,
      },
    ],
  });
}

export async function switchToBSCTestnet() {
  const hexChainId = OPBNBTESTNETID;
  const chainName = "opBNB Testnet";
  const rpcUrls = ["https://opbnb-testnet-rpc.bnbchain.org"];
  const blockExplorerUrls = ["https://opbnb-testnet.bscscan.com/"];
  const switched = await switch_to_Chain(hexChainId);
  if (!switched) {
    await ethereumRequestAddChain(
      hexChainId,
      chainName,
      "tBNB",
      "tBNB",
      18,
      rpcUrls,
      blockExplorerUrls,
    );
  }
}

// eslint-disable-next-line camelcase
async function switch_to_Chain(chainId) {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
    return true;
  } catch (err) {
    return false;
  }
}
