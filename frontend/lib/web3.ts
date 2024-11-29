/* eslint-disable node/no-missing-import */
import Web3 from "web3";
import escrow from "../../artifacts/contracts/Escrow.sol/Escrow.json";
import agentRegistry from "../../artifacts/contracts/AgentRegistry.sol/AgentRegistry.json";
import simpleTerms from "../../artifacts/contracts/SimpleTerms.sol/SimpleTerms.json";

import { renderError } from "./views";

// WE ARE ON onBNB Testnet
export const AgentRegistryAddress =
  "0x35CEa074145Ae2E79eDF7260296103f9eD5D9110";
export const SimpleTermsAddress = "0x766c30d0725bC93cC0d7F9B7c3C6E03c039e0981";

const RPC = "https://opbnb-testnet-rpc.bnbchain.org";

export const OPBNBTESTNETID = "0x15EB"; //5611

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    ethereum: any;
    Module: any;
  }
}

export function isAddress(address) {
  return Web3.utils.isAddress(address);
}

//The escrow contract address is in the url, validated when the page loads
export const escrowContractAddress = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const cparam = urlSearchParams.get("c");
  return cparam as string;
};

export function getEscrowContract(address) {
  const web3 = getWeb3() as Web3;
  const abi = JSON.parse(JSON.stringify(escrow)).abi;
  return new web3.eth.Contract(abi, address);
}

export function getEscrowContractJSONRPC(address) {
  const web3 = new Web3(RPC);
  const abi = JSON.parse(JSON.stringify(escrow)).abi;
  return new web3.eth.Contract(abi, address);
}

export const getCurrentChainCurrency = () => "BNB";

export async function getMyDetails(escrow, myaddress) {
  return await escrow.methods
    .getMyDetails(myaddress)
    .call({ from: myaddress });
}

export async function getArbiter(escrow) {
  return await escrow.methods.getArbiter().call();
}

export async function getFee(escrow, amount) {
  return await escrow.methods.calculateFee(amount).call({});
}

export async function getDeprecated(escrow) {
  return await escrow.methods.isDeprecated().call({});
}

export async function depositPay(escrow, to, amount, from, onError, onReceipt) {
  await escrow.methods
    .depositPay(to)
    .send({ from, value: Web3.utils.toWei(amount) })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function deprecateEscrow(escrow, from, onError, onReceipt) {
  await escrow.methods
    .deprecateEscrow()
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function confirmDelivery(escrow, jobNr, from, onError, onReceipt) {
  await escrow.methods
    .confirmDelivery(jobNr)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function confirmRefund(escrow, jobNr, from, onError, onReceipt) {
  await escrow.methods
    .confirmRefund(jobNr)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function refund(escrow, jobNr, address, onError, onReceipt) {
  await escrow.methods
    .refund(jobNr)
    .send({ from: address })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function withdrawPay(escrow, jobNr, from, onError, onReceipt) {
  await escrow.methods
    .withdrawPay(jobNr)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function createEscrow(
  escrow,
  buyer,
  seller,
  from,
  onError,
  onReceipt,
) {
  await escrow.methods
    .createEscrow(buyer, seller)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function getDetailByIndex(escrow, index: string) {
  return await escrow.methods.getDetailByIndex(index).call({});
}

export function getAgentRegistryContractJSONRpcProvider() {
  const web3 = new Web3(RPC);
  const abi = JSON.parse(JSON.stringify(agentRegistry)).abi;
  return new web3.eth.Contract(abi, AgentRegistryAddress);
}

export function getAgentRegistry() {
  const web3 = getWeb3() as Web3;
  const abi = JSON.parse(JSON.stringify(agentRegistry)).abi;
  return new web3.eth.Contract(abi, AgentRegistryAddress);
}

export async function getAllEscrowContracts(agentRegistry) {
  return await agentRegistry.methods.getAllEscrowContracts().call();
}

export async function getRegistryIndex(agentRegistry) {
  return await agentRegistry.methods.index().call();
}

export async function getAgentAddressByIndex(agentRegistry, index) {
  return await agentRegistry.methods.agentAddress(index).call();
}
export async function getAgentNameByAddress(agentRegistry, agentAddress) {
  return await agentRegistry.methods.agentName(agentAddress).call();
}

export async function getEscrowByAddress(agentRegistry, agentAddress) {
  return await agentRegistry.methods.agentEscrowContracts(agentAddress).call();
}

export async function getContractAndNameByIndex(agentRegistry, index) {
  return await agentRegistry.methods.getContractAndNameByIndex(index).call();
}

export async function registerAgent(
  agentRegistry,
  agentName,
  from,
  onError,
  onReceipt,
) {
  await agentRegistry.methods
    .registerAgent(agentName)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function updateAgentName(
  agentRegistry,
  newAgentname,
  from,
  onError,
  onReceipt,
) {
  await agentRegistry.methods
    .updateAgentName(newAgentname)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export function getSimpleTermsContract() {
  const web3 = getWeb3() as Web3;
  const abi = JSON.parse(JSON.stringify(simpleTerms)).abi;
  return new web3.eth.Contract(abi, SimpleTermsAddress);
}

export async function acceptTerms(
  simpleTerms,
  termsHash,
  from,
  onError,
  onReceipt,
) {
  await simpleTerms.methods
    .accept(termsHash)
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
}

export async function getAcceptedTerms(simpleTerms, address) {
  return await simpleTerms.methods.acceptedTerms(address).call({
    from: address,
  });
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
