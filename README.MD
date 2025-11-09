# 🛡️ Unified Blockchain-Based Legal Document Management (eVault)

# Demo Video

🎥 **Watch the demo here:**  
[https://www.loom.com/share/c75018efbb06459fa6046d4d87f1ed9b](https://www.loom.com/share/c75018efbb06459fa6046d4d87f1ed9b)


> A decentralized, AI-integrated system for secure and transparent legal document storage, built using Ethereum, IPFS, and NLP-based summarization.

---

## 📚 Abstract

The legal industry demands robust, tamper-resistant, and accessible document storage solutions. This project presents a blockchain-based eVault that integrates Ethereum smart contracts, IPFS (via Pinata), MetaMask authentication, and NLP document summarization to deliver a scalable, decentralized legal document management system. It eliminates reliance on centralized servers, ensures document integrity, and enables efficient access control for legal professionals.

---

## 🏗️ System Architecture

The architecture consists of the following modules:

- **Frontend**: React-based UI with MetaMask integration for login and transactions.
- **Blockchain Layer**: Ethereum smart contracts ensure immutable document metadata and role-based access control.
- **Decentralized Storage**: Documents are stored on IPFS using the Pinata API.
- **AI Backend**: NLP module summarizes uploaded legal documents using transformer models (e.g., BERT, GPT).
- **Database**: A NoSQL store maintains metadata and links between IPFS hashes and smart contract records.

---

## ⚙️ Workflow

1. 🔐 **Login via MetaMask**  
   Users authenticate securely without exposing private keys.

2. 📤 **Document Upload**  
   - Document is hashed.
   - Metadata (timestamp, uploader, type) is generated.
   - Hash and metadata are recorded on Ethereum via smart contracts.
   - File is uploaded to IPFS through Pinata.

3. 📑 **Summarization & Storage**  
   - NLP backend extracts and summarizes document.
   - Summary is stored with metadata and linked to the blockchain.

4. 🔎 **Access Control**  
   Role-based permissions are enforced by smart contracts:
   - `grantAccess(address user)`
   - `revokeAccess(address user)`

5. 📥 **Retrieval**  
   Authorized users retrieve IPFS content using the hash and view summaries for rapid understanding.

---

## 🔐 Key Features

- ✅ **Ethereum Smart Contracts**  
  - Immutable document records
  - Transparent access logs
  - Role-based permissions (e.g., Lawyer, Client, Paralegal)

- 🗂 **Decentralized File Storage (IPFS)**  
  - Persistent, tamper-proof access to legal files
  - Content-addressable with Pinata pinning

- 🧠 **AI-Powered Summarization (NLP)**  
  - Legal documents summarized using transformer models
  - Saves time and enhances clarity

- 🧾 **MetaMask Integration**  
  - Wallet-based login & secure transaction signing

- 🔍 **Verifiability & Audit Trails**  
  - On-chain metadata for traceable interactions

---

## 🧪 Testing & Results

- Smart contracts deployed and tested on **Sepolia Testnet**.
- Verified:
  - Upload times < 3s
  - Role-based access enforcement
  - Accurate hash-based integrity validation
- Smart contract functions like `grantAccess()` and `revokeAccess()` performed reliably.
- NLP summaries significantly reduced legal document review times.

---

## 🚀 Tech Stack

| Layer        | Technology                             |
|--------------|-----------------------------------------|
| Blockchain   | Ethereum (Solidity), MetaMask           |
| Storage      | IPFS (via Pinata)                       |
| Frontend     | React.js, JavaScript, HTML/CSS          |
| Backend AI   | Python (Transformers: BERT/GPT)         |
| Database     | MongoDB / NoSQL                         |
| Authentication | MetaMask Web3 Authentication         |

---

## 🧭 Future Enhancements

- 🔔 **AI-Powered Legal Scheduler**  
  Automated deadline tracking and reminder system with calendar APIs.

- 🛠 **Multi-Chain Support**  
  Polygon / BNB Chain for reduced gas fees and scalability.

- 🔒 **End-to-End Document Encryption**  
  Encrypted IPFS storage for stronger confidentiality.

- 🗂 **Legal System Integration**  
  CRM, e-filing platforms, and case management APIs.

- 📜 **Regulatory Compliance**  
  GDPR, HIPAA, Indian IT Act support for document retention & audit policies.

---

## 💡 Inspiration

This project was inspired by the limitations of traditional legal data storage, aiming to deliver a trustless, efficient, and future-ready solution for modern law practices.


