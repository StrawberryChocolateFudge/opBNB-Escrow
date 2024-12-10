import web3 from "web3";

//TODO: Idemnify the platform operator too

export const terms = `Escrow Agreement

Prepared for the users of the escrow contract.

This escrow agreement (“Agreement”) is made and entered into on the signing date visible on the bottom of the page. This is an agreement between the Service QuickEscrow.link, the Escrow Agent who is operating this escrow, and the participants (Buyer and Seller), collectively known as parties.
This agreement shall be effective on the date signed and immediately after the parties enter the escrow agreement.

The participants are allowed to use the Escrow Smart Contract these terms are attached to. The funds for their transaction will be held in accordance to the terms and conditions of this escrow agreement listed below.

The Buyer and Seller have agreed to hold a specified amount in the smart contract , operated by the Escrow Agent.
Furthermore, the Escrow Agent is willing and able to accept such responsibilities as well as act in compliance with this escrow agreement in its entirety.

In the instance any disagreement shall rise, the Parties agree the Escrow Agent shall not be held liable for any costs, damages or losses that may arise from duties performed.
The Escrow Agent shall not be held liable for any Software bugs or hacks.
Furthermore, unless written permission has been received from the Parties by the Escrow Agent then no releases or disbursements shall be made.

If such legal disagreement between the Seller and Buyer does occur, the Escrow Agent be discharged from this agreement and will turn all agreements and documentation over to the jurisdiction responsible for this agreement.
Due to the nature of Smart Contracts, only the Escrow Agent will be able to release funds during dispute, he shall only do it if an agreement has been made between parties or the jurisdiction responsible orders him to do so. 
All legal proceedings must be handled by the Parties and exclude the Escrow Agent.

This agreement is for the benefit of the Escrow Agent, Buyer and Seller.
Furthermore, all parties must agree there are no beneficial results for any third parties nor will third parties be involved in any decisions for this escrow agreement.

Escrow

All Funds received with regard to this escrow agreement are deposited into a Smart Contract by the Buyer.

The Fees due to the Escrow Agent at the time of withdraw or disbursement request will be deducted from the payed amount. The Escrow Agent charges a variable fee, displayed on the escrow page.
The Escrow Agent will not be able to combine personal accounts with the escrow funds at any time during the period of this escrow agreement. He is not able withdraw or move the funds.

The Escrow Agent will hold any notifications and instructions they may receive as valid without the requirement to investigate or question the sender.
The KYC details of the parties can be requested by the agent for dispute resolution.

Notifications

All instructions to the Escrow Agent will be in writing. An escrow agent will be available on a forum or via e-mail. Contact the agent before using their service.

The written notice inclusive of directions for disbursement may not be delivered in person.
Notification must be provided to the Escrow Agent no less than 8 hours before the disbursements scheduled delivery.

With written notice from both the Buyer and the Seller, the Escrow Agent will disburse the funds based on the written instructions provided within such notice.
If these instructions have been signed by both Parties, The Escrow Agent will carry out the instructions immediately. If the instructions have only been signed by one of the Parties, then the Escrow Agent will immediately send a copy of the instructions to the other party.

If the other party does not deliver to the Escrow Agent written objections to the proposed action in these instructions within 7 days of receipt of these instructions, the Escrow Agent will acts in accordance with the instructions.

If the Escrow Agent receives an objection to its acting in accordance with the instructions within the 7 day period, it will not proceed until it receives instructions signed by both parties or until a court of competent jurisdiction directs it to do so.

Liabilities

Under the following circumstances, the Escrow Agent shall not incur any held liable or be found at fault,

    • For any omission or error by a party other than the Escrow Agent themselves.
    • Acts in bad faith and willful misconduct or gross negligence. All parties excuse and hereby release the Escrow Agent for all acts done or omitted in good faith.
    • Any loss of funds directly related to errors in the smart contract, hacks or network failure.
    • Any legal proceedings between the Employer and Worker.



Indemnification of Escrow Agent

The Buyer and Seller will indemnify and hold harmless the Escrow Agent for all of its costs, expenses and reasonable attorney’s fees incurred 

Indemnification of the Service QuickEscrow.Link

The Escrow Agent, Buyer and Seller will indemnify and shall not hold liable or be found at fault the Developer of the service,

    • For any omission or error by a party
    • Acts in bad faith and willful misconduct or gross negligence. All parties excuse and hereby release the Developer for all acts done or omitted in good faith.
    • Any loss of funds directly related to errors in the smart contract, hacks or network failure.
    • Any legal proceedings between the Employer and Worker and Escrow Agent
   
QuickEscrow.Link shall be not held liable for any transactions that occur using it's smart contracts or front end.

Under no circumstances can the QuickEscrow.link service access deposited funds.
The QuickEscrow.Link is not held liable for dishonest Escrow Agents under any circumstances
QuickEscrow.Link does not provide a service for sanctioned countries or entities.


QuickEscrow.Link Service agreement
By accepting this contract, you agree to use QuickEscrow.Link and indemnify the service and shall not hold it liable for any transactions conducted through the service.
QuickEscrow.Link does not provide insurance of any kind and has no access to deposited funds.
You hereby agree to pay a fee of 0.5% for all payments conducted through the service for QuickEscrow.Link of upkeep costs.

Governing Law
On Dispute resolution, this escrow agreement will be governed by the applicable laws of the country selected by the Escrow Agent.

Dispute Resolutions

In the event of a dispute, a dispute resolution may be requested at any point before the escrow is finished.

The Parties agree to have their dispute resolved through an independent arbitrator. Once a dispute resolution is requested, the parties will submit their claims including supporting documents in writing to the arbitrator within 7  business days after the delivery of the request for dispute resolution.

All arbitral awards will be in writing and will set forth the findings of fact and conclusions of the law of the arbitrator. The arbitrator’s decision will be binding and final upon the Parties and enforceable in any court of competent jurisdiction.

Agreement

IN WITNESS WHEREOF, the parties hereto have executed this Agreement using their Ethereum Wallet.
By clicking accept and signing, all parties agree to have read and understand the terms and conditions outlined in this escrow agreement hereunder.`;

export function hashEscrowAgreement() {
    return web3.utils.keccak256(terms);
}
