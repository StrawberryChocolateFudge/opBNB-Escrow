/* eslint-disable node/no-missing-import */
import Web3 from "web3";
import escrow from "../../artifacts/contracts/Escrow.sol/Escrow.json";
import agentRegistry from "../../artifacts/contracts/AgentRegistry.sol/AgentRegistry.json";
import simpleTerms from "../../artifacts/contracts/SimpleTerms.sol/SimpleTerms.json";
import erc20 from "../../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json";

import { renderError } from "./views";

// WE ARE ON onBNB Testnet
export const AgentRegistryAddress =
  "0xE08D5a45611fCbe8f91b7E4b47156213f592E8C1";
export const SimpleTermsAddress = "0xCEC9445f1beA5e10D4cA38d6f66A4BdD57a9420E";

const RPC = "https://opbnb-testnet-rpc.bnbchain.org";

export const OPBNBTESTNETID = "0x15EB"; //5611

const DAOFEE = 50;
export const ZEROADDRESS = "0x0000000000000000000000000000000000000000";
//TESTNET!
export const SupportedTokenAddresses = [
  { name: "BNB", address: ZEROADDRESS, logo: "" },
  {
    name: "USDT",
    address: "0xCF712f20c85421d00EAa1B6F6545AaEEb4492B75",
    logo: "",
  },
];

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

export function getERC20ContractJSONRPC(tokenaddress) {
  const web3 = new Web3(RPC);
  const abi = JSON.parse(JSON.stringify(erc20)).abi;
  return new web3.eth.Contract(abi, tokenaddress);
}

export function getERC20Contract(tokenaddress) {
  const web3 = getWeb3() as Web3;
  const abi = JSON.parse(JSON.stringify(erc20)).abi;
  return new web3.eth.Contract(abi, tokenaddress);
}

export async function getSymbol(erc20contract) {
  return await erc20contract.methods.symbol().call();
}

export async function getAllowance(erc20contract, owner, spender) {
  return await erc20contract.methods.allowance(owner, spender).call();
}

export function convertWeiToString(amount) {
  return Web3.utils.fromWei(amount);
}

export async function approve(
  erc20Contract,
  from,
  spender,
  amount,
  onReceipt,
  onError,
) {
  return await erc20Contract.methods
    .approve(spender, Web3.utils.toWei(amount))
    .send({ from })
    .on("error", onError)
    .on("receipt", onReceipt);
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

export async function getAgentFee(escrow) {
  return await escrow.methods.FEE().call({});
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

export async function depositERC20Pay(
  escrow,
  to,
  amount,
  from,
  onError,
  onReceipt,
) {
  await escrow.methods
    .depositErc20Pay(to, Web3.utils.toWei(amount))
    .send({ from })
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
  token,
  from,
  onError,
  onReceipt,
) {
  await escrow.methods
    .createEscrow(buyer, seller, token)
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

//This is for the front end to call, the fees that can be selected
export function selectableFees() {
  const fee = (text: string, fee: number) => {
    return { text, fee };
  };

  let res: { text: string; fee: number }[] = [];

  for (let i = 1; i <= 20; i++) {
    res.push(fee(`${i * 0.5}%`, 50 * i));
  }

  return res;
}

export function calculateFeePercentage(agentFee: string) {
  const fee = parseInt(agentFee) + DAOFEE;
  return ((100 * fee) / 10000).toFixed(1);
}

export async function registerAgent(
  agentRegistry,
  agentName,
  fee,
  from,
  onError,
  onReceipt,
) {
  await agentRegistry.methods
    .registerAgent(agentName, fee)
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
