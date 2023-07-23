const hre = require("hardhat");

async function main() {
  const [deployer, seller, inspector, lender] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const RealEstate = await hre.ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();
  console.log("RealEstate deployed to:", realEstate.address);

  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    lender.address,
    inspector.address
  );
  await escrow.deployed();
  console.log("Escrow deployed to:", escrow.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
