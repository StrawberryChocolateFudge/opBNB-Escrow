/* eslint-disable node/no-missing-import */
// eslint-disable-next-line node/no-missing-import
import { getPage, PageState } from "./lib/views";
import {
  getAgentNameByAddress,
  getAgentRegistryContractJSONRpcProvider,
  getArbiter,
  getEscrowContractJSONRPC,
  isAddress,
} from "./lib/web3";

(async function init() {
  const path = location.pathname;

  if (path === "/terms") {
    await getPage(PageState.termsPage, {});
    return;
  }

  const urlSearchParams = new URLSearchParams(window.location.search);
  const cparam = urlSearchParams.get("c");
  const escrowIndex = urlSearchParams.get("i");

  if (cparam === null) {
    await getPage(PageState.AllEscrows, {});
    return;
  } else {
    const validAddress = isAddress(cparam);
    if (!validAddress) {
      await getPage(PageState.notFound, {});
      return;
    }

    const escrow = getEscrowContractJSONRPC(cparam);
    const agentRegistry = getAgentRegistryContractJSONRpcProvider();
    let agentName = "";
    try {
      const arbiter = await getArbiter(escrow);
      agentName = await getAgentNameByAddress(agentRegistry, arbiter);
    } catch (err) {
      await getPage(PageState.notFound, {});
      return;
    }

    if (escrowIndex === null) {
      await getPage(PageState.connectWallet, {
        agentName,
        nextPage: PageState.FindOrCreate,
      });
      return;
    } else {
      const notvalidNr = isNaN(parseInt(escrowIndex));
      if (notvalidNr) {
        await getPage(PageState.notFound, {});
        return;
      }

      await getPage(PageState.connectWallet, {
        agentName,
        nextPage: PageState.Escrow,
      });
    }
  }
})();
