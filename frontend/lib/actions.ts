/* eslint-disable node/handle-callback-err */
/* eslint-disable no-case-declarations */
/* eslint-disable no-undef */
/* eslint-disable node/no-missing-import */
import { fetchONEUSDPrice } from "./fetch";
import {
  createSuccess,
  getById,
  getPage,
  hideButton,
  PageState,
  renderError,
} from "./views";
import {
  confirmDelivery,
  confirmRefund,
  createEscrow,
  depositPay,
  deprecateEscrow,
  getAcceptedTerms,
  getAddress,
  getArbiter,
  getDeprecated,
  getDetailByIndex,
  getFee,
  getMyDetails,
  refund,
  requestAccounts,
  switchToBSCTestnet,
  withdrawPay,
} from "./web3";

const max800 = 800;
export async function connectWalletAction() {
  const bttn = getById("connect-wallet") as HTMLElement;
  bttn.onclick = async () => {
    await switchToBSCTestnet().then(async () => {
      await requestAccounts();

      getPage(PageState.FindOrCreate, {});
    });
  };
}

async function clickEscrowLink(el: HTMLElement) {
  const nr = el.dataset.nr as any;
  const escrow = await getDetailByIndex(nr);
  const address = await getAddress();
  const arbiter = await getArbiter();
  let fee = await getFee(escrow.pay);
  if (fee[1] !== undefined) {
    const addedFees = parseInt(fee[1]) + parseInt(fee[2]);
    fee = addedFees.toString();
  } else {
    fee = 0;
  }

  getPage(PageState.Escrow, { data: escrow, address, arbiter, nr, fee });
}
export async function historyPageActions() {
  const back = getById("backButton") as HTMLElement;
  const bttns = document.getElementsByClassName("historyPageButtons");

  for (let i = 0; i < bttns.length; i++) {
    const bttn = bttns[i] as HTMLElement;
    bttn.onclick = async function () {
      const nr = bttn.dataset.nr as any;
      const escrow = await getDetailByIndex(nr);
      const address = await getAddress();
      const arbiter = await getArbiter();
      let fee = await getFee(escrow.pay);
      if (fee[1] !== undefined) {
        const addedFees = parseInt(fee[1]) + parseInt(fee[2]);
        fee = addedFees.toString();
      } else {
        fee = 0;
      }

      getPage(PageState.Escrow, { data: escrow, address, arbiter, nr, fee });
    };
  }

  back.onclick = function () {
    getPage(PageState.FindOrCreate, {});
  };
}

export async function escrowActions(detail, address, arbiter, nr) {
  const back = getById("backButton") as HTMLElement;
  back.onclick = function () {
    getPage(PageState.FindOrCreate, {});
  };
  const onError = (err, receipt) => {
    renderError("An Error Occured");
  };
  const onReceipt = async (receipt) => {
    const escrow = await getDetailByIndex(nr);
    let fee = await getFee(escrow.pay);
    if (fee[1] !== undefined) {
      const addedFees = parseInt(fee[1]) + parseInt(fee[2]);
      fee = addedFees.toString();
    } else {
      fee = 0;
    }

    getPage(PageState.Escrow, {
      data: escrow,
      address,
      arbiter,
      nr,
      fee,
    });
  };
  const accepted = await getAcceptedTerms(address);

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
              const price = await fetchONEUSDPrice();
              const usdValue = parseFloat(amountEl.value) * price;

              if (usdValue > max800) {
                renderError("Maximum 800USD value is allowed!");
                return;
              }

              await depositPay(nr, amountEl.value, address, onError, onReceipt);
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
            await confirmDelivery(nr, address, onError, onReceipt);
          } else {
            renderError("You need to accept the terms first!");
          }
        };
      }
      if (refundButton !== null) {
        refundButton.onclick = async function () {
          renderError("");

          if (accepted) {
            await refund(nr, address, onError, onReceipt);
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
            await confirmRefund(nr, address, onError, onReceipt);
          } else {
            renderError("You need to accept the terms first!");
          }
        };
      }

      if (claimPayment !== null) {
        claimPayment.onclick = async function () {
          renderError("");

          if (accepted) {
            await withdrawPay(nr, address, onError, onReceipt);
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
            await confirmRefund(nr, address, onError, onReceipt);
          } else {
            renderError("You need to accept the terms first!");
          }
        };
      }
      if (arbiterDelivered !== null) {
        arbiterDelivered.onclick = async function () {
          renderError("");

          if (accepted) {
            await confirmDelivery(nr, address, onError, onReceipt);
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

      await deprecateEscrow(address, onError, onReceipt);
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

    const accepted = await getAcceptedTerms(address);

    if (accepted) {
      hideButton(back, "hide");
      hideButton(createBttn, "hide");
      try {
        await createEscrow(
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
  const address = await getAddress();

  //TODO: Check if the signer accepted the current terms hash!

  //IF not then show the terms
  
  
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
    try {
      const detail = await getDetailByIndex(escrownrInput.value);

      const address = await getAddress();
      const arbiter = await getArbiter();
      let fee = await getFee(detail.pay);
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

  history.onclick = async function () {
    const address = await getAddress();
    const myDetails = await getMyDetails(address);
    const arbiter = await getArbiter();
    getPage(PageState.History, { data: myDetails, address, arbiter });
  };

  newEscrow.onclick = async function () {
    newEscrowPage();
  };
}

async function newEscrowPage() {
  const arbiter = await getArbiter();
  const address = await getAddress();
  const deprecated = await getDeprecated();
  getPage(PageState.NewEscrow, {
    data: { arbiterCalls: address === arbiter, deprecated },
  });
}

export async function acceptTermsAction(){
  //TODO: get the terms hash and submit a transaction accepting it!
  //TODO: Then navigate to the next page on success
  //TODO: Or show error if unable to sign it!
}