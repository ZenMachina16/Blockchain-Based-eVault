// src/components/ClientLinking.jsx

import React, { useState } from 'react';

const ClientLinking = () => {
    const [clientEmail, setClientEmail] = useState('');

    const handleLinkClient = (e) => {
        e.preventDefault();
        // Logic to link the client (e.g., store client data, link with lawyer)
        console.log("Linking client:", { clientEmail });
    };

    return (
        <div>
            <h2>Link Client</h2>
            <form onSubmit={handleLinkClient}>
                <input
                    type="email"
                    placeholder="Client Email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                />
                <button type="submit">Link Client</button>
            </form>
        </div>
    );
};

export default ClientLinking;
