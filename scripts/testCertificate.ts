import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const contractAddress =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const certificateRegistry = await ethers.getContractAt(
    "CertificateRegistry",
    contractAddress
  );

  console.log("Connected to CertificateRegistry");
  console.log("Contract:", contractAddress);

  // Certificate data
  const certificateId = "CERT001";
  const studentName = "Vivek Kokambe";
  const course = "Computer Engineering";
  const certificateHash = "abc123hash";

  // Issue certificate
  console.log("\nIssuing certificate...");

  const tx = await certificateRegistry.issueCertificate(
    certificateId,
    studentName,
    course,
    certificateHash
  );

  await tx.wait();

  console.log("Certificate issued successfully!");

  // Verify certificate
  const isValid = await certificateRegistry.verifyCertificate(
    certificateId,
    certificateHash
  );

  console.log("\nVerification result:", isValid);

  // Get certificate details
  const certificate =
    await certificateRegistry.getCertificate(certificateId);

  console.log("\nCertificate details:");
  console.log("Student:", certificate[0]);
  console.log("Course:", certificate[1]);
  console.log("Hash:", certificate[2]);
  console.log("Issuer:", certificate[3]);
  console.log("Timestamp:", certificate[4].toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});