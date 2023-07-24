const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  const [seller, inspector, lender, buyer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", seller.address);

  const RealEstate = await hre.ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();
  console.log("RealEstate deployed to:", realEstate.address);

  console.log("Minting 5 properties...");

  let transaction = await realEstate
    .connect(seller)
    .safeMint("https://pin.ski/3O5iKfz");
  await transaction.wait();

  transaction = await realEstate
    .connect(seller)
    .safeMint("https://pin.ski/3Q5H43t");
  await transaction.wait();

  transaction = await realEstate
    .connect(seller)
    .safeMint("https://pin.ski/44xaA6G");
  await transaction.wait();

  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    lender.address,
    inspector.address
  );
  await escrow.deployed();
  console.log("Escrow deployed to:", escrow.address);

  // approve 3 properties to escrow to transfer nft
  for (let i = 0; i < 3; i++) {
    transaction = await realEstate.connect(seller).approve(escrow.address, i);
    await transaction.wait();
  }

  console.log("Listing 3 properties...");
  transaction = await escrow
    .connect(seller)
    .list(0, tokens(100), tokens(20), seller.address);
  await transaction.wait();
  transaction = await escrow
    .connect(seller)
    .list(1, tokens(120), tokens(24), seller.address);
  await transaction.wait();
  transaction = await escrow
    .connect(seller)
    .list(2, tokens(150), tokens(45), seller.address);
  await transaction.wait();

  console.log("Properties listed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
