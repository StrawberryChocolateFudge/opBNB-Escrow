/* eslint-disable node/handle-callback-err */
/* eslint-disable no-case-declarations */
/* eslint-disable no-undef */
/* eslint-disable node/no-missing-import */
import { fetchBNBUSDPrice } from "./fetch";
import { hashEscrowAgreement } from "./terms";
import {
  createSuccess,
  getById,
  getPage,
  hideButton,
  PageState,
  renderError,
  updateUrlParams,
} from "./views";
import {
  acceptTerms,
  confirmDelivery,
  confirmRefund,
  createEscrow,
  depositPay,
  deprecateEscrow,
  escrowContractAddress,
  getAcceptedTerms,
  getAddress,
  getAgentNameByAddress,
  getAgentRegistry,
  getAgentRegistryContractJSONRpcProvider,
  getAllEscrowContracts,
  getArbiter,
  getContractAndNameByIndex,
  getDeprecated,
  getDetailByIndex,
  getEscrowByAddress,
  getEscrowContract,
  getFee,
  getMyDetails,
  getRegistryIndex,
  getSimpleTermsContract,
  getWeb3,
  refund,
  registerAgent,
  requestAccounts,
  switchToBSCTestnet,
  updateAgentName,
  withdrawPay,
} from "./web3";

const max800 = 800;
export async function connectWalletAction(nextPage: PageState) {
  const bttn = getById("connect-wallet") as HTMLElement;
  bttn.onclick = async () => {
    await switchToBSCTestnet().then(async () => {
      await requestAccounts();

      if (nextPage === PageState.FindOrCreate) {
        getPage(PageState.FindOrCreate, {});
      } else if (nextPage === PageState.Escrow) {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const nr = urlSearchParams.get("i") as string;

        await goToEscrowPageAt(nr);
      }
    });
  };
}

async function goToEscrowPageAt(nr) {
  const cAddress = escrowContractAddress();
  const escrowContract = getEscrowContract(cAddress);
  // get the escrow number from the url
  const escrow = await getDetailByIndex(escrowContract, nr);

  const address = await getAddress();
  const arbiter = await getArbiter(escrowContract);
  let fee = await getFee(escrowContract, escrow.pay);
  if (fee[1] !== undefined) {
    const addedFees = parseInt(fee[1]) + parseInt(fee[2]);
    fee = addedFees.toString();
  } else {
    fee = 0;
  }
  getPage(PageState.Escrow, { data: escrow, address, arbiter, nr, fee });
}

async function clickEscrowLink(el: HTMLElement) {
  const nr = el.dataset.nr as any;

  await goToEscrowPageAt(nr);
}
export async function historyPageActions() {
  const back = getById("backButton") as HTMLElement;
  const bttns = document.getElementsByClassName("historyPageButtons");

  for (let i = 0; i < bttns.length; i++) {
    const bttn = bttns[i] as HTMLElement;
    bttn.onclick = async function () {
      const nr = bttn.dataset.nr as any;
      await goToEscrowPageAt(nr);
    };
  }

  back.onclick = function () {
    getPage(PageState.FindOrCreate, {});
  };
}

export async function escrowActions(detail, address, arbiter, nr) {
  const back = getById("backButton") as HTMLElement;
  const termsButton = getById("escrow-terms-button") as HTMLElement;
  const copyButton = getById("copyButton") as HTMLDivElement;

  copyButton.onclick = function () {
    const url = new URL(window.location.href);
    url.searchParams.set("i", nr);
    navigator.clipboard.writeText(url.href);
  };

  termsButton.onclick = function () {
    renderError("");
    getPage(PageState.termsPage, {});
  };

  const cAddress = escrowContractAddress();
  const escrowContract = getEscrowContract(cAddress);

  back.onclick = function () {
    getPage(PageState.FindOrCreate, {});
  };
  const onError = (err, receipt) => {
    renderError("An Error Occured");
  };
  const onReceipt = async (receipt) => {
    await goToEscrowPageAt(nr);
  };
  const simpleTerms = getSimpleTermsContract();
  const accepted = await getAcceptedTerms(simpleTerms, address);

  switch (address) {
    case detail.buyer:
      const amountEl = getById("payment-amount") as HTMLInputElement;
      const depositBttn = getById("deposit-payment");
      const deliveredBttn = getById("mark-delivered");
      const refundButton = getById("claim-refund");
      if (depositBttn !== null) {
        depositBttn.onclick = async function () {
          renderError("");
          if (parseFloat(amountEl.value) > 0) {
            if (accepted) {
              const price = await fetchBNBUSDPrice();
              const usdValue = parseFloat(amountEl.value) * price;

              if (usdValue > max800) {
                renderError("Maximum 800USD value is allowed!");
                return;
              }

              await depositPay(
                escrowContract,
                nr,
                amountEl.value,
                address,
                onError,
                onReceipt,
              );
            } else {
              renderError("You need to accept the terms first!");
            }
          } else {
            renderError("Invalid Amount");
          }
        };
      }
      if (deliveredBttn !== null) {
        deliveredBttn.onclick = async function () {
          renderError("");

          if (accepted) {
            await confirmDelivery(
              escrowContract,
              nr,
              address,
              onError,
              onReceipt,
            );
          } else {
            renderError("You need to accept the terms first!");
          }
        };
      }
      if (refundButton !== null) {
        refundButton.onclick = async function () {
          renderError("");

          if (accepted) {
            await refund(escrowContract, nr, address, onError, onReceipt);
          } else {
            renderError("You need to accept the terms first!");
          }
        };
      }
      break;
    case detail.seller:
      const setRefundBttn = getById("refund-button");
      const claimPayment = getById("claim-payment");

      if (setRefundBttn !== null) {
        setRefundBttn.onclick = async function () {
          renderError("");

          if (accepted) {
            await confirmRefund(
              escrowContract,
              nr,
              address,
              onError,
              onReceipt,
            );
          } else {
            renderError("You need to accept the terms first!");
          }
        };
      }

      if (claimPayment !== null) {
        claimPayment.onclick = async function () {
          renderError("");

          if (accepted) {
            await withdrawPay(escrowContract, nr, address, onError, onReceipt);
          } else {
            renderError("You need to accept the terms first!");
          }
        };
      }

      break;
    case arbiter:
      const arbiterRefund = getById("arbiter-refund");
      const arbiterDelivered = getById("arbiter-delivered");

      if (arbiterRefund !== null) {
        arbiterRefund.onclick = async function () {
          renderError("");

          if (accepted) {
            await confirmRefund(
              escrowContract,
              nr,
              address,
              onError,
              onReceipt,
            );
          } else {
            renderError("You need to accept the terms first!");
          }
        };
      }
      if (arbiterDelivered !== null) {
        arbiterDelivered.onclick = async function () {
          renderError("");

          if (accepted) {
            await confirmDelivery(
              escrowContract,
              nr,
              address,
              onError,
              onReceipt,
            );
          } else {
            renderError("You need to accept the terms first!");
          }
        };
      }
      break;
    default:
      break;
  }
}

export async function newEscrowActions(arbiterCalls) {
  const buyerInput = getById("buyer-address-input") as HTMLInputElement;
  const sellerInput = getById("seller-address-input") as HTMLInputElement;
  const createBttn = getById("new-escrow") as HTMLElement;
  const back = getById("backButton") as HTMLElement;
  const cAddress = escrowContractAddress();
  const escrowContract = getEscrowContract(cAddress);

  if (arbiterCalls) {
    const deprecateEscrowBtn = getById("deprecate-escrow") as HTMLElement;
    deprecateEscrowBtn.onclick = async function () {
      const onError = (err, receipt) => {
        renderError("An Error occured");
      };
      const onReceipt = (receipt) => {
        newEscrowPage();
      };
      const address = await getAddress();

      await deprecateEscrow(escrowContract, address, onError, onReceipt);
    };
  }

  back.onclick = function () {
    getPage(PageState.FindOrCreate, {});
  };
  createBttn.onclick = async function () {
    if (buyerInput.value.length === 0) {
      renderError("Empty buyer Address Input");
      return;
    }
    if (sellerInput.value.length === 0) {
      renderError("Empty seller Address Input");
      return;
    }
    renderError("");
    // eslint-disable-next-line node/handle-callback-err
    const onError = (err, receipt) => {
      renderError("An Error Occured");
      hideButton(back, "show");
      hideButton(createBttn, "show");
    };
    const onReceipt = (receipt) => {
      const events = receipt.events;
      const escrowCreated = events.EscrowCreated;
      const returnValues = escrowCreated.returnValues;
      hideButton(back, "show");
      hideButton(createBttn, "show");
      createSuccess(`Got to Escrow ${returnValues[0]}`, returnValues[0]);
      clickEscrowLink(getById("go-to-escrow") as HTMLElement);
    };

    const address = await getAddress();
    const simpleTerms = getSimpleTermsContract();
    const accepted = await getAcceptedTerms(simpleTerms, address);
    const cAddress = escrowContractAddress();
    const escrowContract = getEscrowContract(cAddress);

    if (accepted) {
      hideButton(back, "hide");
      hideButton(createBttn, "hide");
      try {
        await createEscrow(
          escrowContract,
          buyerInput.value,
          sellerInput.value,
          address,
          onError,
          onReceipt,
        );
      } catch (err) {
        renderError(err.message);
        hideButton(back, "show");
        hideButton(createBttn, "show");
      }
    } else {
      renderError("You need to accept the terms first!");
    }
  };
}

export async function findOrCreateActions() {
  // eslint-disable-next-line no-undef
  const escrownrInput = getById("escrownr-input") as HTMLInputElement;
  const findDetail = getById("find-escrow") as HTMLElement;
  const history = getById("historyPage") as HTMLElement;
  const newEscrow = getById("new-escrow") as HTMLElement;
  const termsEl = getById("terms-button") as HTMLAnchorElement;

  termsEl.onclick = function () {
    renderError("");
    getPage(PageState.termsPage, {});
  };

  findDetail.onclick = async function () {
    renderError("");

    const valid = escrownrInput.checkValidity();
    if (!valid) {
      escrownrInput.reportValidity();
    }
    if (escrownrInput.value.length === 0) {
      return;
    }
    await requestAccounts();
    const cAddress = escrowContractAddress();
    const escrowContract = getEscrowContract(cAddress);
    try {
      const detail = await getDetailByIndex(
        escrowContract,
        escrownrInput.value,
      );

      const address = await getAddress();
      const arbiter = await getArbiter(escrowContract);
      let fee = await getFee(escrowContract, detail.pay);
      if (fee[1] !== undefined) {
        const addedFees = parseInt(fee[1]) + parseInt(fee[2]);
        fee = addedFees.toString();
      } else {
        fee = 0;
      }

      getPage(PageState.Escrow, {
        data: detail,
        address,
        arbiter,
        nr: escrownrInput.value,
        fee,
      });
    } catch (err) {
      renderError(err);
    }
  };

  // history.onclick = async function () {
  //   const cAddress = escrowContractAddress();
  //   const escrowContract = getEscrowContract(cAddress);
  //   const address = await getAddress();
  //   const myDetails = await getMyDetails(escrowContract, address);
  //   const arbiter = await getArbiter(escrowContract);
  //   getPage(PageState.History, { data: myDetails, address, arbiter });
  // };

  newEscrow.onclick = async function () {
    newEscrowPage();
  };
}

async function newEscrowPage() {
  const cAddress = escrowContractAddress();
  const escrowContract = getEscrowContract(cAddress);
  const arbiter = await getArbiter(escrowContract);
  const address = await getAddress();
  const deprecated = await getDeprecated(escrowContract);
  getPage(PageState.NewEscrow, {
    data: { arbiterCalls: address === arbiter, deprecated },
  });
}

export async function acceptTermsAction() {
  const backButton = getById("terms-back") as HTMLButtonElement;
  const acceptButton = getById("accept-terms") as HTMLButtonElement;
  const address = await getAddress();
  const simpleTermsContact = getSimpleTermsContract();
  const accepted = await getAcceptedTerms(simpleTermsContact, address);

  async function goback() {
    const urlParams = new URLSearchParams(window.location.search);
    const nr = urlParams.get("i");
    if (nr) {
      //Go to the Escrow page
      goToEscrowPageAt(nr);
    } else {
      getPage(PageState.FindOrCreate, {});
    }
  }

  backButton.onclick = async function () {
    //If there is an i
    await goback();
  };

  if (!accepted) {
    acceptButton.disabled = false;
  }

  acceptButton.onclick = async function () {
    const onError = (err, receipt) => {
      renderError("An error Occured");
      console.log(err);
    };
    const onReceipt = async (receipt) => {
      await goback();
    };

    const termsHash = hashEscrowAgreement();
    await acceptTerms(
      simpleTermsContact,
      termsHash,
      address,
      onError,
      onReceipt,
    );
  };
}

export async function allEscrowsActions() {
  const becomeAgentbutton = getById("becomeagent") as HTMLButtonElement;

  becomeAgentbutton.onclick = async function () {
    await switchToBSCTestnet().then(async () => {
      await requestAccounts();

      getPage(PageState.registerOrUpdate, {});
    });
  };
}

export async function registerAgentActions() {
  const input = getById("agentName") as HTMLInputElement;
  const registerButton = getById("register-agent") as HTMLButtonElement;
  const backButton = getById("register-backbutton") as HTMLButtonElement;

  //Check if the address registered already
  const agentRegistry = getAgentRegistry();

  //Check if the agent registered already, if yes then allow update
  //If no then allow create

  backButton.onclick = function () {
    getPage(PageState.AllEscrows, {});
  };

  const address = await getAddress();

  const agentName = await getAgentNameByAddress(agentRegistry, address);

  input.value = agentName;
  input.disabled = false;
  const onError = (error, receipt) => {
    console.log("error");
    console.log(error);
  };

  const onReceipt = (receipt) => {
    getPage(PageState.AllEscrows, {});
  };

  if (agentName != "") {
    registerButton.textContent = "Update Handle";
    registerButton.onclick = async function (event) {
      event?.preventDefault();
      await updateAgentName(
        agentRegistry,
        input.value,
        address,
        onError,
        onReceipt,
      );
    };

    const myEscrowLink = getById("myescrow-button") as HTMLLinkElement;
    myEscrowLink.onclick = async function (event) {
      event?.preventDefault();
      const escrowC = await getEscrowByAddress(agentRegistry, address);
      updateUrlParams(escrowC, null);
      // await getPage(PageState.FindOrCreate, { contract: escrowC });
    };

    const container = getById("escrow-link-container") as HTMLElement;
    container.classList.remove("hide");
  } else {
    registerButton.textContent = "Register";
    registerButton.onclick = async function (event) {
      event?.preventDefault();
      const localscopeinput = getById("agentName") as HTMLInputElement;

      await registerAgent(
        agentRegistry,
        localscopeinput.value,
        address,
        onError,
        onReceipt,
      );
    };
  }
}
