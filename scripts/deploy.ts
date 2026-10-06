import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const CertificateRegistry = await ethers.getContractFactory(
    "CertificateRegistry"
  );

  const certificateRegistry = await CertificateRegistry.deploy();

  await certificateRegistry.waitForDeployment();

  console.log(
    "CertificateRegistry deployed to:",
    await certificateRegistry.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});