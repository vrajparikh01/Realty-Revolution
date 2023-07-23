const { ethers } = require("hardhat");
const { expect } = require("chai");

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
  });

  it("should set the nft adresss", async () => {
    expect(await escrow.nftAddress()).to.equal(realEstate.address);
  });
});
