// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./CSS/CaseForm.css";

// const CaseForm = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [clients, setClients] = useState([]);
//   const [caseTypes] = useState(["Civil", "Criminal", "Family", "Corporate"]);
//   const [status] = useState(["Open", "In Progress", "Closed"]);

//   // Case form state
//   const [caseData, setCaseData] = useState({
//     clientEmail: "",
//     caseTitle: "",
//     caseDescription: "",
//     caseType: "Civil",
//     status: "Open",
//     summary: "",
//     filingDate: new Date().toISOString().split("T")[0],
//     partiesInvolved: {
//       opposingPartyName: "",
//       opposingCounsel: "",
//       opposingContact: "",
//     },
//     courtDetails: {
//       courtName: "",
//       judgeName: "",
//     },
//   });

//   // Fetch clients on component mount
//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setError("You must be logged in");
//           return;
//         }

//         const response = await axios.get(
//           "http://localhost:3000/api/users/role/client",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         setClients(response.data);
//       } catch (err) {
//         console.error("Error fetching clients:", err);
//         setError("Failed to load clients. Please try again later.");
//       }
//     };

//     fetchClients();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Handle nested objects
//     if (name.includes(".")) {
//       const [parent, child] = name.split(".");
//       setCaseData((prev) => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value,
//         },
//       }));
//     } else {
//       setCaseData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("Authentication required");
//         setLoading(false);
//         return;
//       }

//       // First check if client exists
//       try {
//         await axios.get(
//           `http://localhost:3000/api/users/check-client/${caseData.clientEmail}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//       } catch (clientErr) {
//         setLoading(false);
//         setError("Client not registered. Please register the client first.");
//         return;
//       }

//       // If client exists, proceed with case creation
//       const response = await axios.post("/api/cases/create", caseData, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setSuccess(true);
//       setLoading(false);

//       // Reset form or redirect
//       setTimeout(() => {
//         navigate("/cases");
//       }, 2000);
//     } catch (err) {
//       setLoading(false);
//       if (err.response) {
//         setError(err.response.data.message || "Failed to create case");
//       } else {
//         setError("Network error. Please try again.");
//       }
//     }
//   };

//   return (
//     <div className="case-form-container">
//       <h2>Create New Case</h2>

//       {error && <div className="error-message">{error}</div>}
//       {success && (
//         <div className="success-message">Case created successfully!</div>
//       )}

//       <form onSubmit={handleSubmit} className="case-form">
//         <div className="form-section">
//           <h3>Basic Information</h3>

//           <div className="form-group">
//             <label htmlFor="clientEmail">Client Email *</label>
//             <input
//               type="email"
//               id="clientEmail"
//               name="clientEmail"
//               value={caseData.clientEmail}
//               onChange={handleChange}
//               required
//               placeholder="Enter client's email address"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="caseTitle">Case Title *</label>
//             <input
//               type="text"
//               id="caseTitle"
//               name="caseTitle"
//               value={caseData.caseTitle}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="caseType">Case Type *</label>
//             <select
//               id="caseType"
//               name="caseType"
//               value={caseData.caseType}
//               onChange={handleChange}
//               required
//             >
//               {caseTypes.map((type) => (
//                 <option key={type} value={type}>
//                   {type}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label htmlFor="status">Status</label>
//             <select
//               id="status"
//               name="status"
//               value={caseData.status}
//               onChange={handleChange}
//             >
//               {status.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label htmlFor="filingDate">Filing Date</label>
//             <input
//               type="date"
//               id="filingDate"
//               name="filingDate"
//               value={caseData.filingDate}
//               onChange={handleChange}
//             />
//           </div>
//         </div>

//         <div className="form-section">
//           <h3>Case Description</h3>

//           <div className="form-group">
//             <label htmlFor="caseDescription">Description *</label>
//             <textarea
//               id="caseDescription"
//               name="caseDescription"
//               value={caseData.caseDescription}
//               onChange={handleChange}
//               rows="4"
//               required
//             ></textarea>
//           </div>

//           <div className="form-group">
//             <label htmlFor="summary">Summary</label>
//             <textarea
//               id="summary"
//               name="summary"
//               value={caseData.summary}
//               onChange={handleChange}
//               rows="3"
//             ></textarea>
//           </div>
//         </div>

//         <div className="form-section">
//           <h3>Opposing Party Information</h3>

//           <div className="form-group">
//             <label htmlFor="partiesInvolved.opposingPartyName">
//               Opposing Party Name
//             </label>
//             <input
//               type="text"
//               id="partiesInvolved.opposingPartyName"
//               name="partiesInvolved.opposingPartyName"
//               value={caseData.partiesInvolved.opposingPartyName}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="partiesInvolved.opposingCounsel">
//               Opposing Counsel
//             </label>
//             <input
//               type="text"
//               id="partiesInvolved.opposingCounsel"
//               name="partiesInvolved.opposingCounsel"
//               value={caseData.partiesInvolved.opposingCounsel}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="partiesInvolved.opposingContact">
//               Opposing Party Contact
//             </label>
//             <input
//               type="text"
//               id="partiesInvolved.opposingContact"
//               name="partiesInvolved.opposingContact"
//               value={caseData.partiesInvolved.opposingContact}
//               onChange={handleChange}
//             />
//           </div>
//         </div>

//         <div className="form-section">
//           <h3>Court Information</h3>

//           <div className="form-group">
//             <label htmlFor="courtDetails.courtName">Court Name</label>
//             <input
//               type="text"
//               id="courtDetails.courtName"
//               name="courtDetails.courtName"
//               value={caseData.courtDetails.courtName}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="courtDetails.judgeName">Judge Name</label>
//             <input
//               type="text"
//               id="courtDetails.judgeName"
//               name="courtDetails.judgeName"
//               value={caseData.courtDetails.judgeName}
//               onChange={handleChange}
//             />
//           </div>
//         </div>

//         <div className="form-actions">
//           <button type="submit" className="submit-button" disabled={loading}>
//             {loading ? "Creating..." : "Create Case"}
//           </button>
//           <button
//             type="button"
//             className="cancel-button"
//             onClick={() => navigate("/cases")}
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CaseForm;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CSS/CaseForm.css";

const CaseForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [caseTypes] = useState(["Civil", "Criminal", "Family", "Corporate"]);
  const [status] = useState(["Open", "In Progress", "Closed"]);

  // Case form state
  const [caseData, setCaseData] = useState({
    clientName: "",
    clientEmail: "",
    caseTitle: "",
    caseDescription: "",
    caseType: "Civil",
    status: "Open",
    summary: "",
    filingDate: new Date().toISOString().split("T")[0],
    partiesInvolved: {
      opposingPartyName: "",
      opposingCounsel: "",
      opposingContact: "",
    },
    courtDetails: {
      courtName: "",
      judgeName: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setCaseData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setCaseData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      // Proceed with case creation
      const response = await axios.post(
        "http://localhost:5000/api/cases/create",
        caseData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          
        }
        
      );

      setSuccess(true);
      setLoading(false);

      // Redirect to the case details page
      setTimeout(() => {
        navigate(`/case/${response.data._id}`);
      }, 2000);
    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(err.response.data.message || "Failed to create case");
      } else {
        setError("Network error. Please try again.");
      }
    }
  };
  return (
    <div className="case-form-container">
      <h2>Create New Case</h2>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">Case created successfully!</div>
      )}

      <form onSubmit={handleSubmit} className="case-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label htmlFor="clientName">Client Name *</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={caseData.clientName}
              onChange={handleChange}
              required
              placeholder="Enter client's full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="clientEmail">Client Email *</label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={caseData.clientEmail}
              onChange={handleChange}
              required
              placeholder="Enter client's email address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="clientEmail">Client Email *</label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={caseData.clientEmail}
              onChange={handleChange}
              required
              placeholder="Enter client's email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="caseTitle">Case Title *</label>
            <input
              type="text"
              id="caseTitle"
              name="caseTitle"
              value={caseData.caseTitle}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="caseType">Case Type *</label>
            <select
              id="caseType"
              name="caseType"
              value={caseData.caseType}
              onChange={handleChange}
              required
            >
              {caseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={caseData.status}
              onChange={handleChange}
            >
              {status.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="filingDate">Filing Date</label>
            <input
              type="date"
              id="filingDate"
              name="filingDate"
              value={caseData.filingDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Case Description</h3>

          <div className="form-group">
            <label htmlFor="caseDescription">Description *</label>
            <textarea
              id="caseDescription"
              name="caseDescription"
              value={caseData.caseDescription}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              name="summary"
              value={caseData.summary}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <h3>Opposing Party Information</h3>

          <div className="form-group">
            <label htmlFor="partiesInvolved.opposingPartyName">
              Opposing Party Name
            </label>
            <input
              type="text"
              id="partiesInvolved.opposingPartyName"
              name="partiesInvolved.opposingPartyName"
              value={caseData.partiesInvolved.opposingPartyName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="partiesInvolved.opposingCounsel">
              Opposing Counsel
            </label>
            <input
              type="text"
              id="partiesInvolved.opposingCounsel"
              name="partiesInvolved.opposingCounsel"
              value={caseData.partiesInvolved.opposingCounsel}
              onChange={handleChange}
            />
          </div>

          {/* <div className="form-group">
            <label htmlFor="partiesInvolved.opposingContact">
              Opposing Party Contact
            </label>
            <input
              type="text"
              id="partiesInvolved.opposingContact"
              name="partiesInvolved.opposingContact"
              value={caseData.partiesInvolved.opposingContact}
              onChange={handleChange}
            />
          </div> */}
        </div>

        <div className="form-section">
          <h3>Court Information</h3>

          <div className="form-group">
            <label htmlFor="courtDetails.courtName">Court Name</label>
            <input
              type="text"
              id="courtDetails.courtName"
              name="courtDetails.courtName"
              value={caseData.courtDetails.courtName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="courtDetails.judgeName">Judge Name</label>
            <input
              type="text"
              id="courtDetails.judgeName"
              name="courtDetails.judgeName"
              value={caseData.courtDetails.judgeName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Creating..." : "Create Case"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/cases")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseForm;