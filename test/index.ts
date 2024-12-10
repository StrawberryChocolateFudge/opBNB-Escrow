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

    const agentFee = 200; // It's 2%

    //Register an agent
    await registry.connect(arbiter).registerAgent(
      "My agent name",
      agentFee,
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
    await escrow.createEscrow(
      buyer.address,
      seller.address,
      ethers.constants.AddressZero,
    );
    expect(await escrow.getLastDetailIndex()).to.equal(1);

    expect(await escrow.FEE()).to.equal(200);
  });

  it("USING ETH, Should create a new escrow and deliver it and another one gets refunded", async function () {
    // eslint-disable-next-line no-unused-vars
    const [signer1, arbiter, seller, buyer] = await ethers.getSigners();

    const SimpleTerms = await ethers.getContractFactory("SimpleTerms");
    const simpleTerms = await SimpleTerms.deploy();

    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.connect(arbiter).deploy(
      arbiter.address,
      simpleTerms.address,
      200,
    );
    await escrow.deployed();
    const escrowAggreementHash = await hashEscrowAgreement();

    await simpleTerms.setTerms(escrowAggreementHash);
    await simpleTerms.connect(arbiter).accept(escrowAggreementHash);
    await simpleTerms.connect(seller).accept(escrowAggreementHash);
    await simpleTerms.connect(buyer).accept(escrowAggreementHash);
    await simpleTerms.accept(escrowAggreementHash);

    await escrow.createEscrow(
      buyer.address,
      seller.address,
      ethers.constants.AddressZero,
    );

    expect(await escrow.getLastDetailIndex()).to.equal(1);
    let detail = await escrow.getDetailByIndex(1);
    expect(await (await escrow.getMyDetails(seller.address)).length).to.equal(
      1,
    );
    expect(await (await escrow.getMyDetails(buyer.address)).length).to.equal(1);

    await escrow.createEscrow(
      buyer.address,
      seller.address,
      ethers.constants.AddressZero,
    );
    expect(await escrow.getLastDetailIndex()).to.equal(2);
    const overrides = { value: parseEther("10") };
    await escrow.connect(buyer).depositPay(1, overrides);

    detail = await escrow.getDetailByIndex(1);
    expect(detail.pay).to.equal(parseEther("10"));
    const calculatedFee = await escrow.calculateFee(detail.pay);
    expect(calculatedFee[0]).to.equal(parseEther("9.75"));
    expect(calculatedFee[1]).to.equal(parseEther("0.2"));
    expect(calculatedFee[2]).to.equal(parseEther("0.05"));

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
      await escrow.createEscrow(
        buyer.address,
        seller.address,
        ethers.constants.AddressZero,
      );
    } catch (err) {
      escrowDeprecated = true;
    }
    expect(escrowDeprecated).to.equal(true);
  });

  it("WITH ERC20, Should create a new escrow and deliver it and another gets refunded", async function () {
    const [signer1, arbiter, seller, buyer] = await ethers.getSigners();
    const MockERC20 = await ethers.getContractFactory("MOCKERC20");
    const usdtm = await MockERC20.deploy();

    const SimpleTerms = await ethers.getContractFactory("SimpleTerms");
    const simpleTerms = await SimpleTerms.deploy();

    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.connect(arbiter).deploy(
      arbiter.address,
      simpleTerms.address,
      200,
    );
    await escrow.deployed();
    const escrowAggreementHash = await hashEscrowAgreement();

    await simpleTerms.setTerms(escrowAggreementHash);
    await simpleTerms.connect(arbiter).accept(escrowAggreementHash);
    await simpleTerms.connect(seller).accept(escrowAggreementHash);
    await simpleTerms.connect(buyer).accept(escrowAggreementHash);
    await simpleTerms.accept(escrowAggreementHash);

    //Test createEscrow with invalid non contract address
    let errorOccured = false;

    let errorMessage = "";

    try {
      await escrow.createEscrow(buyer.address, seller.address, buyer.address);
    } catch (err: any) {
      errorOccured = true;
      errorMessage = err.message;
    }

    expect(errorOccured).to.be.true;
    expect(
      errorMessage.includes(
        "Transaction reverted: function call to a non-contract account",
      ),
    ).to.be.true;

    // Test createEscrow with invalid contract address
    errorOccured = false;
    errorMessage = "";

    try {
      await escrow.createEscrow(buyer.address, seller.address, escrow.address);
    } catch (err: any) {
      errorOccured = true;
      errorMessage = err.message;
    }
    expect(errorOccured).to.be.true;
    expect(
      errorMessage.includes(
        "function selector was not recognized",
      ),
    ).to.be.true;

    //Create a valid escrow
    await escrow.createEscrow(buyer.address, seller.address, usdtm.address);

    expect(await escrow.getLastDetailIndex()).to.equal(1);
    let detail = await escrow.getDetailByIndex(1);

    expect(await usdtm.balanceOf(buyer.address)).to.equal(
      ethers.utils.parseEther("0"),
    );

    //try to deposit ERC20 without balance or approval
    errorOccured = false;
    errorMessage = "";
    try {
      await escrow.connect(buyer).depositErc20Pay(
        1,
        ethers.utils.parseEther("1"),
      );
    } catch (err: any) {
      errorOccured = true;
      errorMessage = err.message;
    }

    expect(errorOccured).to.be.true;
    expect(
      errorMessage.includes(
        "ERC20: insufficient allowance",
      ),
    ).to.be.true;

    usdtm.connect(buyer).approve(escrow.address, ethers.utils.parseEther("1"));

    errorOccured = false;
    errorMessage = "";
    try {
      await escrow.connect(buyer).depositErc20Pay(
        1,
        ethers.utils.parseEther("1"),
      );
    } catch (err: any) {
      errorOccured = true;
      errorMessage = err.message;
    }

    expect(errorOccured).to.be.true;
    expect(
      errorMessage.includes(
        "ERC20: transfer amount exceeds balance",
      ),
    ).to.be.true;

    //try to deposit ETH instead of erc20
    errorOccured = false;
    errorMessage = "";
    try {
      await escrow.connect(buyer).depositPay(
        1,
        { value: parseEther("10") },
      );
    } catch (err: any) {
      errorOccured = true;
      errorMessage = err.message;
    }

    expect(errorOccured).to.be.true;
    expect(
      errorMessage.includes(
        "VM Exception while processing transaction: reverted with reason string 'Gas tokens only'",
      ),
    ).to.be.true;

    //deposit erc20 successfully
    usdtm.mint(buyer.address, parseEther("1"));

    await escrow.connect(buyer).depositErc20Pay(1, parseEther("1"));

    //Gonna confirm delivery now

    await escrow.connect(buyer).confirmDelivery(1);

    let balanceBefore = await usdtm.balanceOf(seller.address);

    expect(balanceBefore).to.equal(parseEther("0"));

    //withdraw
    await escrow.connect(seller).withdrawPay(1);

    let balanceAfter = await usdtm.balanceOf(seller.address);
    //There is a 2.5% fee
    expect(balanceAfter).to.equal(parseEther("0.975"));

    const escrowDetail = await escrow.getDetailByIndex(1);

    expect(escrowDetail.state).to.equal(2);

    //NOw I try a refund

    await usdtm.mint(buyer.address, parseEther("1"));

    await escrow.createEscrow(buyer.address, seller.address, usdtm.address);

    usdtm.connect(buyer).approve(escrow.address, ethers.utils.parseEther("1"));

    await escrow.connect(buyer).depositErc20Pay(2, parseEther("1"));

    await escrow.connect(seller).confirmRefund(2);

    await escrow.connect(buyer).refund(2);
  });
});
