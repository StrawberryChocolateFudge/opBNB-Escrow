/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
import { html, nothing, render } from "lit-html";
import Web3 from "web3";
import {
  acceptTermsAction,
  allEscrowsActions,
  connectWalletAction,
  escrowActions,
  findOrCreateActions,
  historyPageActions,
  newEscrowActions,
  registerAgentActions,
} from "./actions";
import {
  getCurrentChainCurrency,
  selectableFees,
  SupportedTokenAddresses,
  ZEROADDRESS,
} from "./web3";
import { terms } from "./terms";

export function getById(id: string) {
  return document.getElementById(id);
}

export function updateUrlParams(c, i) {
  const urlParams = new URLSearchParams(window.location.search);
  if (c) {
    urlParams.set("c", c);
  }
  if (i) {
    urlParams.set("i", i);
  }
  window.location.search = urlParams.toString();
}

export enum PageState {
  AllEscrows,
  registerOrUpdate,
  FindOrCreate,
  NewEscrow,
  Escrow,
  History,
  connectWallet,
  termsPage,
  notFound,
}

export function createSuccess(msg: string, nr) {
  const msgslot = getById("message-slot") as HTMLElement;
  if (msgslot.classList.contains("error")) {
    msgslot.classList.remove("error");
  }
  render(escrowNr(msg, nr), msgslot);
  (getById("new-escrow-button-container") as HTMLElement).innerHTML = "";
}

function escrowNr(msg, nr) {
  return html`<button
    id="go-to-escrow"
    data-nr="${nr}"
    class="maxwidth-500px center marginBottom20"
  >
    ${msg}
  </button>`;
}

export function renderError(err: string) {
  const errSlot = getById("message-slot") as HTMLElement;
  if (!errSlot.classList.contains("error")) {
    errSlot.classList.add("error");
  }
  errSlot.innerHTML = err;
}

export async function getPage(page: PageState, args: any) {
  const main = getById("main") as HTMLElement;
  const body = document.getElementsByTagName("body");
  const title = body[0].dataset.title as any;

  switch (page) {
    case PageState.AllEscrows:
      render(AllEscrows(), main);
      allEscrowsActions();
      break;
    case PageState.registerOrUpdate:
      render(RegisterAgent(), main);
      registerAgentActions();
      break;
    case PageState.FindOrCreate:
      render(findOrCreate(title), main);
      findOrCreateActions();
      break;
    case PageState.NewEscrow:
      render(NewEscrow(args.data.arbiterCalls, args.data.deprecated), main);
      newEscrowActions(args.data.arbiterCalls);
      break;
    case PageState.Escrow:
      render(
        EscrowPage(
          args.data,
          args.address,
          args.arbiter,
          args.nr,
          args.fee,
          args.symbol,
        ),
        main,
      );
      escrowActions(args.data, args.address, args.arbiter, args.nr);
      break;
    case PageState.History:
      render(historyPage(args.data), main);
      historyPageActions();
      break;
    case PageState.connectWallet:
      render(ConnectWallet(args.agentName, args.fee), main);
      connectWalletAction(args.nextPage);
      break;
    case PageState.termsPage:
      render(TermsPage(terms), main);
      acceptTermsAction();
      break;
    case PageState.notFound:
      render(NotFoundPage(), main);
      break;
    default:
      break;
  }
}

function historyPage(ids: Array<any>) {
  const reversedIds = [] as Array<any>;
  if (ids !== undefined) {
    for (let i = ids.length - 1; i >= 0; i--) {
      reversedIds.push(ids[i]);
    }
  }

  return html`
    <article class="maxwidth-500px center">
      ${backButton()}
      <hr />
      ${
    ids === undefined
      ? html`<h4 class="text-align-center">No History</h4>`
      : reversedIds.map((id) => HistoryElement(`Escrow ${id}`, id))
  }
    </article>
  `;
}
export function hideButton(el, show) {
  if (show === "show") {
    el.style.display = "block";
  } else if (show === "hide") {
    el.style.display = "none";
  }
}

function withdrawn(w) {
  return w === true ? "YES" : "NO";
}

function getStateText(state) {
  switch (state) {
    case "0":
      return "Awaiting Payment";
    case "1":
      return "Awaiting Delivery";
    case "2":
      return "Delivered";
    case "3":
      return "Refunded";
    default:
      break;
  }
}

//TODO: if it's an ERC20, there needs to be spend approval!
const getAction = (address, buyer, seller, arbiter, state, withdrawn) => {
  switch (address) {
    case buyer:
      if (state === "0") {
        return html`
          <input type="text" id="payment-amount" placeholder="Amount" />
          <button class="width-200 center" id="deposit-payment">
            Deposit Payment
          </button>
        `;
      } else if (state === "1") {
        return html`
          <button id="mark-delivered" class="width-200 center">
            Delivered
          </button>
        `;
      } else if (state === "3" && !withdrawn) {
        return html`
          <button id="claim-refund" class="width-200 center">
            Claim Refund
          </button>
        `;
      }
      break;
    case seller:
      if (state === "1") {
        return html`
          <button id="refund-button" class="width-200 center">Refund</button>
        `;
      } else if (state === "2" && !withdrawn) {
        return html`
          <button id="claim-payment" class="width-200 center">
            Claim Payment
          </button>
        `;
      }
      return;
    case arbiter:
      if (state === "1") {
        return html`<div class="row">
          <button id="arbiter-refund" class="width-200 center">Refund</button>
          <button id="arbiter-delivered" class="width-200 center">
            Delivered
          </button>
        </div>`;
      }
      break;
    default:
      break;
  }
};

const backButton = () =>
  html`
  <div id="backButton" class="cursor-pointer hover-light roundedSquare" style="width: 40px">
    <svg
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:cc="http://creativecommons.org/ns#"
      xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
      xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
      width="30"
      height="30"
      viewBox="0 0 38.000011 68"
      version="1.1"
      id="svg8"
      inkscape:export-filename="/home/user/nextArrow.png"
      inkscape:export-xdpi="96"
      inkscape:export-ydpi="96"
      inkscape:version="0.92.5 (2060ec1f9f, 2020-04-08)"
      sodipodi:docname="prev.svg"
    >
      <g
        inkscape:label="Layer 1"
        inkscape:groupmode="layer"
        id="layer1"
        transform="translate(0,-229)"
      >
        <path
          style="fill:#000000;stroke-width:0.13298428"
          d="m 33.109404,296.87949 c -0.52166,-0.17791 -2.62463,-2.22796 -16.39343,-15.98087 C 6.0199938,270.21499 0.8364838,264.94807 0.6592538,264.58352 0.26144376,263.76526 0.19664376,262.95759 0.45598376,262.05016 l 0.22431004,-0.78485 15.7823502,-15.795 c 11.58948,-11.59876 15.93943,-15.87133 16.37357,-16.08232 2.89992,-1.40929 5.95743,1.69165 4.51855,4.58272 -0.19362,0.38902 -4.71481,5.00268 -14.52988,14.82702 L 8.5760838,263.06 22.883814,277.38935 c 9.32191,9.33601 14.38463,14.49932 14.52843,14.8171 0.81653,1.80443 -0.0452,3.94824 -1.86003,4.62724 -0.84568,0.31641 -1.60744,0.33069 -2.44281,0.0458 z"
          id="path888"
          inkscape:connector-curvature="0"
        />
      </g>
    </svg>
  </div>
`;

const copyButton = () =>
  html`
<div id="copyButton" class="cursor-pointer hover-light roundedSquare"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg></div>`;

const TokenAddressDisplay = (address) =>
  html`
<pre>Token Address: ${address}</pre>`;

// Action button toggles based on if I'm the arbiter, the buyer or the seller
export const EscrowPage = (escrow, address, arbiter, escrowNr, fee, symbol) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const escrowIndex = urlSearchParams.get("i");

  const displayAddress = escrow.ERC20 !== ZEROADDRESS;

  return html`
  <article id="escrow-body" data-nr="${escrowNr}" class="maxwidth-800px center">
  <div class="rowBetween ${escrowIndex ? "hide" : ""}">
    ${backButton()} ${copyButton()}</div>
    <h3 class="text-align-center">${logo()} Escrow ${escrowNr}</h3>
   
    <div class="column">
      ${DisplayInTable("Buyer", escrow.buyer)}${
    DisplayInTable(
      "Seller",
      escrow.seller,
    )
  }${
    DisplayInTable(
      "Payment",
      Web3.utils.fromWei(escrow.pay) + " " + symbol,
    )
  }${DisplayInTable("State", getStateText(escrow.state))}${
    DisplayInTable(
      "Withdrawn",
      withdrawn(escrow.withdrawn),
    )
  }
      ${
    DisplayInTable(
      "Fee",
      Web3.utils.fromWei(fee) + " " + symbol,
    )
  }
    </div>
    ${
    displayAddress
      ? html`${DisplayInTable("Token Address", escrow.ERC20)}`
      : null
  }
    
    <div id="message-slot" class="text-align-center"></div>
    ${
    getAction(
      address,
      escrow.buyer,
      escrow.seller,
      arbiter,
      escrow.state,
      escrow.withdrawn,
    )
  }
    <div class="text-align-center">
      <a
        class="cursor-pointer"
        id="escrow-terms-button"
        class="text-align-center"
        rel="noopener"
        target="_blank"
        >Terms</a
      >
    </div>
  </article>
`;
};

const HistoryElement = (title, data) =>
  html` <table>
  <tbody>
    <tr>
      <td
        class="cursor-pointer hover-light historyPageButtons"
        data-nr="${data}"
      >
        ${title}
      </td>
    </tr>
  </tbody>
</table>`;

const DisplayInTable = (title, data) =>
  html` <table>
  <thead>
    <th>${title}</th>
  </thead>
  <tbody>
    <tr>
      <td>${data}</td>
    </tr>
  </tbody>
</table>`;

export const NewEscrow = (arbiterCalls, deprecated) =>
  html` <article
  class="maxwidth-500px center"
>
  ${backButton()}
  <h3 class="text-align-center"> Create new Escrow</h3>
  <input
    class="maxwidth-500px center "
    type="text"
    id="buyer-address-input"
    placeholder="Buyer address"
  />
  <input
    class="maxwidth-500px center"
    type="text"
    id="seller-address-input"
    placeholder="Seller address"
  />
  ${TokenSelector()}

  <div id="message-slot" class="text-align-center"></div>
  <div id="new-escrow-button-container">
    <button id="new-escrow" class="width-200 center" ?disabled=${deprecated}>
      Create new
    </button>
  </div>
  ${
    arbiterCalls
      ? html`<hr />
        <button
          class="width-200 center"
          id="deprecate-escrow"
          ?disabled=${deprecated}
        >
          Disable escrow
        </button>`
      : nothing
  }
</article>`;

//TODO: Display a logo and an address
const TokenSelector = () =>
  html`
<select name="tokenSElect" aria-label="Fee Select" required id="token-selectors">
  <option selected disabled value="">Select the token</option>
  ${
    SupportedTokenAddresses.map((val) =>
      html`<option value=${val.address} >${val.name}</option>`
    )
  }
</select>`;

export const findOrCreate = (title: string) =>
  html`
  <article class="maxwidth-500px center">
    <h4 class="text-align-center">${logo()} Find your Escrow</h4>
    <input
      class="width-200 center maxwidth-200"
      type="number"
      id="escrownr-input"
      pattern="d*"
      title="Numbers only, please."
    />
    <div id="message-slot" class="text-align-center"></div>
    <button class="width-200 center" id="find-escrow">Find</button>

    <hr />
    <img src="./imgs/search.svg"/>
    <div style="margin-bottom: 10px;"></div>
    <button id="new-escrow" class="width-200 center">Create new</button>
    <div class="text-align-center">
      <a
        class="cursor-pointer"
        id="terms-button"
        class="text-align-center"
        rel="noopener"
        target="_blank"
        >Terms</a
      >
    </div>
  </article>
`;

export const History = () =>
  html` <article class="maxwidth-500px center">
  <h3 class="text-align-center">History</h3>
</article>`;

export const ConnectWallet = (title: string, fee: string) =>
  html`<article class="maxwidth-500px center">
    <h6 class="text-align-center">${title}</h6>
    <h4 class="text-align-center">${logo()} Escrow Service</h4>
    <h6 class="text-align-center">${fee}% fee</h6>
    <img src="./imgs/connection.svg"/>
    <div id="message-slot" class="text-align-center"></div>
    <button id="connect-wallet" class="maxwidth-200 center">
      Connect Your Wallet
    </button>
  </article>`;

export const TermsPage = (terms: string) =>
  html`<div><article class="maxwidth-800px center">
<h1 class="text-align-center"><button id="terms-back" class="center width-200">Back</button>Terms and conditions</h1>
<img src="./imgs/office.svg"/>
<pre class="terms-pre">${terms}</pre>
<h2><button disabled class="center width-200" id="accept-terms">Accept</button>
</h2>
</article>
</div>`;

const logo = () => html`<img src="./imgs/logo.png" width="40px"/>`;

export const AllEscrows = () =>
  html`<article class="maxwidth-500px center">
  <h1 class="text-align-center">  ${logo()}
 Quick Escrow Links</h1>
     <img src="./imgs/accept_tasks.svg"/>
  <hr/>
    <button class="width-200 center" id="becomeagent">Become an Escrow Agent</button>

</article>`;

export const NotFoundPage = () =>
  html`<article class="maxwidrh-500px center">
  <h1 class="text-align-center">Not Found</h1>
</article>`;

export const RegisterAgent = () =>
  html`<article class="maxwidth-500px center">
  <h1 class="text-align-center">Agent Registry</h1>
  <p>Sign up as an escrow agent and resolve disputes for a fee. Use your telegram handle when registering so you can be contacted. </p>
  <p>The fee you select when registering can't be changed. There is a 0.5% service fee added to your selected amount.</p>
  ${FeeSelector()}
  <input 
  class="center"
  type="text"
  id="agentName"
  title="Telegram Handle"
  placeholder="Escrow Agent Name"
  minlength="5"
  disabled
  />
  
  <div class="row">
  <button class="width-200 marginRight10 lightgray" id="register-backbutton">Back</button>

  <button class="width-200 marginLeft10 " id="register-agent">Register</button>

  </div>
  <div class="text-align-center hide" id="escrow-link-container">
      <a
        class="cursor-pointer"
        id="myescrow-button"
        class="text-align-center"
        rel="noopener"
        target="_blank"
        >Link to My Escrow</a
      >
    </div>

</article>`;

const FeeSelector = () =>
  html`<select disabled name="feeselect" aria-label="Fee Select" required id="register-fee-selectors">
  <option selected disabled value="">Select your fee</option>
  ${
    selectableFees().map((val) =>
      html`<option value=${val.fee} >${val.text}</option>`
    )
  }
</select>`;
