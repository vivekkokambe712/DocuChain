import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import { ShieldCheck, Upload, FileCheck, Search, Wallet } from "lucide-react";
import { connectWallet } from "./wallet";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [course, setCourse] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);

  const [verifyCertificateId, setVerifyCertificateId] = useState("");
  const [verifyFile, setVerifyFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationDetails, setVerificationDetails] = useState(null);

  const getContract = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  const calculateFileHash = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const handleVerifyCertificate = async () => {
    try {
      if (!walletAddress) {
        throw new Error("Please connect your wallet first.");
      }

      if (!verifyCertificateId || !verifyFile) {
        throw new Error(
          "Please enter the certificate ID and upload the certificate.",
        );
      }

      setVerificationResult(null);
      setVerificationDetails(null);

      const hash = await calculateFileHash(verifyFile);

      console.log("Verification SHA-256:", hash);

      const contract = await getContract();

      const isValid = await contract.verifyCertificate(
        verifyCertificateId,
        hash,
      );

      console.log("Verification result:", isValid);

      setVerificationResult(isValid);

      if (isValid) {
        const details = await contract.getCertificate(verifyCertificateId);

        setVerificationDetails({
          studentName: details[0],
          course: details[1],
          hash: details[2],
          issuer: details[3],
          timestamp: details[4].toString(),
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult(false);
    }
  };

  const handleIssueCertificate = async () => {
    try {
      if (!walletAddress) {
        throw new Error("Please connect your wallet first.");
      }

      if (!studentName || !certificateId || !course || !certificateFile) {
        throw new Error("Please fill all fields and upload the certificate.");
      }

      const hash = await calculateFileHash(certificateFile);

      console.log("Certificate SHA-256:", hash);

      const contract = await getContract();

      const tx = await contract.issueCertificate(
        certificateId,
        studentName,
        course,
        hash,
      );

      console.log("Transaction sent:", tx.hash);

      await tx.wait();

      console.log("Certificate issued successfully!");
    } catch (error) {
      console.error("Issue certificate error:", error);
    }
  };

  async function handleConnectWallet() {
    try {
      setWalletError("");

      const { address } = await connectWallet();

      setWalletAddress(address);
    } catch (error) {
      console.error(error);
      setWalletError(error.message || "Failed to connect wallet.");
    }
  }
  const [activeTab, setActiveTab] = useState("issue");

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h1>DocuChain</h1>
            <p>Blockchain Certificate Verification</p>
          </div>
        </div>

        <div className="network-status">
          <span className="status-dot"></span>
          Local Blockchain
        </div>
        <div className="wallet-section">
          {walletAddress ? (
            <div className="wallet-connected">
              <span className="status-dot"></span>
              {walletAddress.slice(0, 6)}...
              {walletAddress.slice(-4)}
            </div>
          ) : (
            <button className="connect-button" onClick={handleConnectWallet}>
              <Wallet size={17} />
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h2>Certificate Verification System</h2>
          <p>
            Securely issue and verify certificates using blockchain technology.
          </p>
        </section>

        <div className="tabs">
          <button
            className={activeTab === "issue" ? "tab active" : "tab"}
            onClick={() => setActiveTab("issue")}
          >
            <FileCheck size={18} />
            Issue Certificate
          </button>

          <button
            className={activeTab === "verify" ? "tab active" : "tab"}
            onClick={() => setActiveTab("verify")}
          >
            <Search size={18} />
            Verify Certificate
          </button>
        </div>

        {walletError && <div className="error-message">{walletError}</div>}

        {activeTab === "issue" ? (
          <section className="card">
            <div className="card-header">
              <h3>Issue New Certificate</h3>
              <p>Register a certificate on the blockchain.</p>
            </div>

            <div className="form">
              <div className="form-group">
                <label>Student Name</label>
                <input
                  type="text"
                  placeholder="Enter student name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Certificate ID</label>
                <input
                  type="text"
                  placeholder="e.g. CERT001"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Course</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Engineering"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Certificate Document</label>

                <div className="upload-box">
                  <Upload size={28} />

                  <p>Upload certificate</p>

                  <span>PDF, JPG or PNG</span>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setCertificateFile(e.target.files[0])}
                  />
                </div>
              </div>

              <button
                className="primary-button"
                onClick={handleIssueCertificate}
              >
                <ShieldCheck size={18} />
                Issue Certificate
              </button>
            </div>
          </section>
        ) : (
          <section className="card">
            <div className="card-header">
              <h3>Verify Certificate</h3>
              <p>Check whether a certificate is authentic and unchanged.</p>
            </div>

            <div className="form">
              <div className="form-group">
                <label>Certificate ID</label>
                <input
                  type="text"
                  placeholder="Enter certificate ID"
                  value={verifyCertificateId}
                  onChange={(e) => setVerifyCertificateId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Certificate Document</label>

                <div className="upload-box">
                  <Upload size={28} />

                  <p>Upload certificate</p>

                  <span>PDF, JPG or PNG</span>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setVerifyFile(e.target.files[0])}
                  />
                </div>
              </div>

              <button
                className="primary-button"
                onClick={handleVerifyCertificate}
              >
                <ShieldCheck size={18} />
                Verify Certificate
              </button>

              {verificationResult === true && verificationDetails && (
                <div className="verification-success">
                  <h3>✓ Certificate Verified</h3>

                  <p>
                    <strong>Student:</strong> {verificationDetails.studentName}
                  </p>

                  <p>
                    <strong>Course:</strong> {verificationDetails.course}
                  </p>

                  <p>
                    <strong>Certificate ID:</strong> {verifyCertificateId}
                  </p>

                  <p>
                    <strong>Status:</strong> Authentic
                  </p>
                </div>
              )}

              {verificationResult === false && (
                <div className="verification-failure">
                  <h3>✕ Certificate Invalid</h3>

                  <p>This certificate does not match the blockchain record.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer>
        <p>DocuChain • Blockchain-based document verification</p>
      </footer>
    </div>
  );
}

export default App;
