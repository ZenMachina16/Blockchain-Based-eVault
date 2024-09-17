import React from 'react';
import './App.css'; // Import your styles if any
import UploadComponent from './UploadComponent';
import RetrieveComponent from './RetrieveComponent';
import web3 from './web3';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Blockchain-Based eVault</h1>
      </header>
      <main>
        <UploadComponent />
        <RetrieveComponent />
      </main>
    </div>
  );
}

export default App;
