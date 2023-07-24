const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", function () {
  let realEstate, escrow;
  let seller, inspector, lender, buyer;

  beforeEach(async function () {
    [seller, lender, inspector, buyer] = await ethers.getSigners();

    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    await realEstate.deployed();

    let transaction = await realEstate
      .connect(seller)
      .safeMint("https://pin.ski/3O5iKfz");
    await transaction.wait();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      realEstate.address,
      seller.address,
      lender.address,
      inspector.address
    );
    await escrow.deployed();

    // approve escrow to transfer nft
    transaction = await realEstate.connect(seller).approve(escrow.address, 0);
    await transaction.wait();

    transaction = await escrow
      .connect(seller)
      .list(0, tokens(100), tokens(20), buyer.address);
    await transaction.wait();
  });

  it("should set the nft adresss", async () => {
    expect(await escrow.nftAddress()).to.equal(realEstate.address);
  });

  it("updates nft ownership to escrow and check listed property", async () => {
    expect(await realEstate.ownerOf(0)).to.equal(escrow.address);
    expect(await escrow.isListed(0)).to.equal(true);
  });

  it("check escrow balance after deposit", async () => {
    let tx = await escrow
      .connect(buyer)
      .depositEarnest(0, { value: tokens(20) });
    await tx.wait();
    expect(await escrow.getBalance()).to.equal(tokens(20));
  });

  //   it("check inspection status", async () => {
  //     let tx = await escrow.connect(inspector).updateInspectionStatus(0, true);
  //     await tx.wait();
  //     expect(await escrow.inspectionPassed(0)).to.equal(true);
  //   });

  it("updates approval status", async () => {
    let tx = await escrow.connect(lender).approveSale(0);
    await tx.wait();
    expect(await escrow.approval(0, lender.address)).to.equal(true);

    tx = await escrow.connect(buyer).approveSale(0);
    await tx.wait();
    expect(await escrow.approval(0, buyer.address)).to.equal(true);

    tx = await escrow.connect(seller).approveSale(0);
    await tx.wait();
    expect(await escrow.approval(0, seller.address)).to.equal(true);
  });

  it("finalize the sale", async () => {
    let tx = await escrow
      .connect(buyer)
      .depositEarnest(0, { value: tokens(20) });
    await tx.wait();

    // tx = await escrow.updateInspectionStatus(0, true);
    // await tx.wait();

    tx = await escrow.connect(lender).approveSale(0);
    await tx.wait();

    tx = await escrow.connect(buyer).approveSale(0);
    await tx.wait();

    tx = await escrow.connect(seller).approveSale(0);
    await tx.wait();

    await lender.sendTransaction({ to: escrow.address, value: tokens(80) });

    tx = await escrow.connect(buyer).finalizeSale(0);
    await tx.wait();

    // updates the balance
    expect(await escrow.getBalance()).to.equal(0);

    // updates the ownership
    expect(await realEstate.ownerOf(0)).to.equal(buyer.address);
  });
});
