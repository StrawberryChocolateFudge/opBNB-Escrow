# BNB Escrow

This full stack escrow application helps facilitate payments between buyers and sellers using an agent for dispute resolution.
It was created with Hardhat and Parcel.

The escrow must be deployed by the agent and configured to use.
The escrow was built to support no-code deployments, but it's not in the scope of the current version.

## Parties

There are 4 parties of an escrow.
1. Escrow agent
  The agent owns the escrow and provides dispute resolution. There could be a channel to chat with an agent, which is not included in this application
2. Buyer
   The role of the buyer is to deposit the value into the contract. He can receive a refund if the goods and services are not delivered. The buyer must confirm delivery after it's been fulfilled,else a dispute request must be communicated with the agent.
3. Seller
   The role of the seller is to provide goods and services and receive payments using the escrow. The escrow can pull payments from the finalized escrow or refund payments if unable to deliver.
4. FeeDao 
   An optional address to receive fees. This address is included to support DAOification of the escrow later. The DAO is not in scope but a way to collect fees exists.

## Fees
There is a 2% Agent fee and a 1% Dao Fee on the escrow transaction.

## Terms and Conditions
The terms and conditions as created by the agent must be accepted to use the escrow contract functions. Both the buyer and the seller must comply with the legal terms.

## Escrow States

The state of the escrow is determiend by the State enum.
```
enum State {
    awaiting_payment,
    awaiting_delivery,
    delivered,
    refunded
}
```

## API

These are the important smart contract functions that mutate the state.

`createEscrow(address buyer,address seller`
An address can create an escrow if they have accepted the terms.
The escrows are stored indexed. The state of the created escrow is awaiting_payment

A created escrow is accessed by index as a "detail"

`depositPay(uint2546 detail)`
The pay can be deposited by anyone for a specific escrow. The state of the escrow will become awaiting_delivery


`confirmDelivery(uint256 detail)`
The buyer or the agent can confirm the delivery of a service. The agent should only do so on dispute resolution. The state of the escrow will be  delivered

`confirmRefund(uint256 detail)`
The seller or the agent can confirm refunding the escrow payment.The state of the escrow will be refunded.

`withdrawPay(uint256 detail)`
The payment can be only withdrawn by the seller.

`refund(uint256 detail)`
The payment can be pulled for a refund by the buyer


The front end allows maximum 800USD to be escrowed at once with 2% fee. 1% goes to the feeDAO and 1% goes to the escrow agent

