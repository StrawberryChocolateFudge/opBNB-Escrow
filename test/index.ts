import { expect } from "chai";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { hashEscrowAgreement } from "../frontend/lib/terms";

describe("Escrow", function () {
  it("Should register an agent and deploy an escrow", async function () {
    const [signer1, arbiter, seller, buyer] = await ethers.getSigners();

    const SimpleTerms = await ethers.getContractFactory("SimpleTerms");
    const simpleTerms = await SimpleTerms.deploy();
    const escrowAggreementHash = await hashEscrowAgreement();

    await simpleTerms.setTerms(escrowAggreementHash);
    await simpleTerms.accept(escrowAggreementHash);
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const registry = await AgentRegistry.deploy(simpleTerms.address);
    let index = await registry.index();

    expect(index).to.equal(0);

    //Register an agent
    await registry.connect(arbiter).registerAgent(
      "My agent name",
    );

    const agentName = await registry.agentName(arbiter.address);
    expect(agentName).to.equal("My agent name");

    index = await registry.index();

    expect(index).to.equal(1);

    const escrowAddress = await registry.agentEscrowContracts(arbiter.address);
    //Call the escrow to check
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.attach(escrowAddress);

    expect(await escrow.getLastDetailIndex()).to.equal(0);
    await escrow.createEscrow(buyer.address, seller.address);
    expect(await escrow.getLastDetailIndex()).to.equal(1);
  });

  it("Should create a new escrow and deliver it and another one gets refunded", async function () {
    // eslint-disable-next-line no-unused-vars
    const [signer1, arbiter, seller, buyer] = await ethers.getSigners();

    const SimpleTerms = await ethers.getContractFactory("SimpleTerms");
    const simpleTerms = await SimpleTerms.deploy();

    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.connect(arbiter).deploy(
      arbiter.address,
      simpleTerms.address,
    );
    await escrow.deployed();
    const escrowAggreementHash = await hashEscrowAgreement();

    await simpleTerms.setTerms(escrowAggreementHash);
    await simpleTerms.connect(arbiter).accept(escrowAggreementHash);
    await simpleTerms.connect(seller).accept(escrowAggreementHash);
    await simpleTerms.connect(buyer).accept(escrowAggreementHash);
    await simpleTerms.accept(escrowAggreementHash);

    await escrow.createEscrow(buyer.address, seller.address);

    expect(await escrow.getLastDetailIndex()).to.equal(1);
    let detail = await escrow.getDetailByIndex(1);
    expect(await (await escrow.getMyDetails(seller.address)).length).to.equal(
      1,
    );
    expect(await (await escrow.getMyDetails(buyer.address)).length).to.equal(1);

    await escrow.createEscrow(buyer.address, seller.address);
    expect(await escrow.getLastDetailIndex()).to.equal(2);
    const overrides = { value: parseEther("10") };
    await escrow.connect(buyer).depositPay(1, overrides);

    detail = await escrow.getDetailByIndex(1);
    expect(detail.pay).to.equal(parseEther("10"));
    const calculatedFee = await escrow.calculateFee(detail.pay);
    expect(calculatedFee[0]).to.equal(parseEther("9.7"));
    expect(calculatedFee[1]).to.equal(parseEther("0.2"));
    expect(calculatedFee[2]).to.equal(parseEther("0.1"));

    // set it to delivered now and withdraw it
    await escrow.connect(buyer).confirmDelivery(1);
    detail = await escrow.getDetailByIndex(1);
    const sellerBalance1 = await seller.getBalance();
    await escrow.connect(seller).withdrawPay(1);
    const sellerBalance2 = await seller.getBalance();
    expect(
      parseFloat(formatEther(sellerBalance1)) <
        parseFloat(formatEther(sellerBalance2)),
    );
    detail = await escrow.getDetailByIndex(1);
    expect(detail.withdrawn).to.equal(true);

    // I pay to the other , and refund it
    await escrow.connect(buyer).depositPay(2, overrides);

    detail = await escrow.getDetailByIndex(2);
    expect(detail.pay).to.equal(parseEther("10"));

    await escrow.connect(arbiter).confirmRefund(2);
    detail = await escrow.getDetailByIndex(2);
    expect(detail.state).to.equal(3);
    const balance1 = await buyer.getBalance();
    await escrow.connect(buyer).refund(2);
    const balance2 = await buyer.getBalance();
    expect(
      parseFloat(formatEther(balance1)) < parseFloat(formatEther(balance2)),
    );
    let deprecationFailed = false;
    try {
      await escrow.connect(buyer).deprecateEscrow();
    } catch (err) {
      deprecationFailed = true;
    }
    expect(deprecationFailed).to.equal(true);

    await escrow.connect(arbiter).deprecateEscrow();
    let escrowDeprecated = false;
    try {
      await escrow.createEscrow(buyer.address, seller.address);
    } catch (err) {
      escrowDeprecated = true;
    }
    expect(escrowDeprecated).to.equal(true);
  });
});
