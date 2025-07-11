import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon, 
  Cancel as RejectIcon, 
  Person as UserIcon,
  Gavel as LawyerIcon,
  HowToReg as VerifiedIcon,
  AccessTime as PendingIcon,
  HighlightOff as RejectedIcon
} from '@mui/icons-material';
import contractABI from '../contractABI';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [reviewedApplications, setReviewedApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '', address: '' });
  const [contract, setContract] = useState(null);
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Initialize on component mount
  useEffect(() => {
    // Only initialize once
    if (initialized) return;
    
    const init = async () => {
      // Prevent multiple simultaneous connection attempts
      if (connectionInProgress) return;
      
      setConnectionInProgress(true);
      setIsLoading(true);
      setError(null);
      
      try {
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed');
        }
        
        // Safer connection handling
        let accounts = [];
        try {
          // First try to get accounts without prompting
          const provider = new ethers.BrowserProvider(window.ethereum);
          accounts = await provider.listAccounts();
          
          // Only prompt if no accounts are connected
          if (accounts.length === 0) {
            console.log("No accounts found, requesting connection...");
            // Simplified connection request to avoid race conditions
            accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts',
              params: []
            });
            
            if (!accounts || accounts.length === 0) {
              throw new Error('No accounts returned from MetaMask');
            }
          }
          
          const signer = await provider.getSigner();
          const address = accounts[0];
          setUserAddress(address);
          
          // Get contract address from .env or use hardcoded value for testing
          const contractAddr = process.env.REACT_APP_NAVINEVAULT_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
          setContractAddress(contractAddr);
          
          const contractInstance = new ethers.Contract(contractAddr, contractABI, signer);
          setContract(contractInstance);
          
          // Check if user is an admin
          const adminStatus = await contractInstance.admins(address);
          setIsAdmin(adminStatus);
          
          if (adminStatus) {
            await fetchApplications(contractInstance);
          }
          
          setInitialized(true);
        } catch (connErr) {
          console.error('Connection error:', connErr);
          throw new Error('Failed to connect to MetaMask. Please refresh the page and try again.');
        }
      } catch (err) {
        console.error('Error initializing:', err);
        setError(err.message || 'Failed to initialize');
      } finally {
        setIsLoading(false);
        setConnectionInProgress(false);
      }
    };
    
    // Add a short delay before initialization to avoid race conditions
    const timer = setTimeout(() => {
      init();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [initialized, connectionInProgress]);
  
  // Handle MetaMask account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // MetaMask is locked or user has no accounts
        setError('Please connect to MetaMask.');
        setIsAdmin(false);
        setInitialized(false);
      } else if (accounts[0] !== userAddress) {
        // Account changed, reset state and reinitialize
        setUserAddress(accounts[0]);
        setIsAdmin(false);
        setInitialized(false);
      }
    };
    
    const handleChainChanged = () => {
      // Just reload the page when chain changes
      window.location.reload();
    };
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    // Clean up listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [userAddress]);
  
  // Set up periodic refresh (every 30 seconds) instead of continuous polling
  useEffect(() => {
    if (!initialized || !isAdmin || !contract) return;
    
    // Refresh once immediately
    fetchApplications(contract);
    
    // Set up a timer for periodic refresh
    const timer = setInterval(() => {
      if (contract) {
        console.log("Periodic refresh of applications");
        fetchApplications(contract);
      }
    }, 30000); // Refresh every 30 seconds
    
    // Clean up the timer when the component unmounts
    return () => {
      clearInterval(timer);
    };
  }, [initialized, isAdmin, contract]);
  
  // Fetch lawyer applications
  const fetchApplications = async (contractInstance) => {
    // Prevent fetching if component is unmounting or not initialized
    if (!contractInstance) return;
    
    try {
      setIsLoading(true);
      
      // Get pending applications from contract
      const pendingApps = [];
      const reviewedApps = [];
      
      try {
        console.log("Fetching pending lawyer applications...");
        
        // First try the contract's function
        let pendingAddresses = [];
        try {
          pendingAddresses = await contractInstance.getPendingLawyerApplications();
          console.log("Contract returned pending addresses:", pendingAddresses);
        } catch (err) {
          console.error("Error calling getPendingLawyerApplications:", err);
          pendingAddresses = [];
        }
        
        // If no addresses found, try a manual approach
        if (pendingAddresses.length === 0) {
          console.log("No pending applications found via contract method, trying manual check...");
          
          // These are some known Hardhat test accounts
          const commonAddresses = [
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
            "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", // Add this address
            "0x2546BcD3c84621e976D8185a91A922aE77ECEc30", // Add this address
          ];
          
          // Check each account
          for (const address of commonAddresses) {
            try {
              // Check if this account has a pending application
              const isPending = await contractInstance.pendingLawyers(address);
              
              if (isPending) {
                console.log(`Found pending application for address: ${address}`);
                
                // Get application details
                try {
                  const details = await contractInstance.lawyerApplications(address);
                  
                  // Only include if not already reviewed
                  if (!details.isReviewed) {
                    pendingApps.push({
                      address,
                      name: details.name,
                      barNumber: details.barNumber,
                      email: details.email,
                      additionalInfo: details.additionalInfo,
                      applicationDate: new Date(Number(details.applicationDate) * 1000),
                      status: 'pending'
                    });
                    console.log("Added pending application:", details.name);
                  } else {
                    // This is a reviewed application
                    reviewedApps.push({
                      address,
                      name: details.name,
                      barNumber: details.barNumber,
                      email: details.email,
                      additionalInfo: details.additionalInfo,
                      applicationDate: new Date(Number(details.applicationDate) * 1000),
                      reviewDate: new Date(Number(details.reviewDate) * 1000),
                      status: details.isApproved ? 'approved' : 'rejected',
                      reviewDetails: details.reviewDetails
                    });
                    console.log("Added reviewed application:", details.name);
                  }
                } catch (detailsErr) {
                  console.error(`Error getting details for ${address}:`, detailsErr);
                }
              } else {
                // Check if this is an approved lawyer
                const isLawyer = await contractInstance.isLawyer(address);
                if (isLawyer) {
                  try {
                    const details = await contractInstance.lawyerApplications(address);
                    if (details.isReviewed) {
                      reviewedApps.push({
                        address,
                        name: details.name,
                        barNumber: details.barNumber,
                        email: details.email,
                        additionalInfo: details.additionalInfo,
                        applicationDate: new Date(Number(details.applicationDate) * 1000),
                        reviewDate: new Date(Number(details.reviewDate) * 1000),
                        status: 'approved',
                        reviewDetails: details.reviewDetails
                      });
                      console.log("Added approved lawyer:", details.name);
                    }
                  } catch (detailsErr) {
                    console.error(`Error getting details for lawyer ${address}:`, detailsErr);
                  }
                }
              }
            } catch (addrErr) {
              console.error(`Error checking address ${address}:`, addrErr);
            }
          }
        } else {
          // Process the addresses returned by the contract
          for (const address of pendingAddresses) {
            try {
              const details = await contractInstance.getLawyerApplicationDetails(address);
              pendingApps.push({
                address,
                name: details.name,
                barNumber: details.barNumber,
                email: details.email,
                additionalInfo: details.additionalInfo,
                applicationDate: new Date(Number(details.applicationDate) * 1000),
                status: 'pending'
              });
            } catch (err) {
              console.error(`Error fetching details for ${address}:`, err);
            }
          }
        }
        
        // Fetch approved lawyers
        console.log("Fetching approved/rejected lawyers...");
        const commonAddresses = [
          "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Account #0
          "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account #1
          "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account #2
          "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Account #3
          "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"  // Account #4
        ];
        
        for (const address of commonAddresses) {
          try {
            // Skip if already in pending apps
            if (pendingApps.some(app => app.address === address)) {
              continue;
            }
            
            // Check if this account has a reviewed application
            const isPending = await contractInstance.pendingLawyers(address);
            const isLawyer = await contractInstance.isLawyer(address);
            
            if ((isPending || isLawyer) && !pendingApps.some(app => app.address === address)) {
              try {
                const details = await contractInstance.lawyerApplications(address);
                
                // Only include if already reviewed
                if (details.isReviewed) {
                  reviewedApps.push({
                    address,
                    name: details.name,
                    barNumber: details.barNumber,
                    email: details.email,
                    additionalInfo: details.additionalInfo,
                    applicationDate: new Date(Number(details.applicationDate) * 1000),
                    reviewDate: new Date(Number(details.reviewDate) * 1000),
                    status: details.isApproved ? 'approved' : 'rejected',
                    reviewDetails: details.reviewDetails
                  });
                  console.log(`Added reviewed application for: ${address}`);
                }
              } catch (detailsErr) {
                console.error(`Error getting reviewed details for ${address}:`, detailsErr);
              }
            }
          } catch (addrErr) {
            console.error(`Error checking reviewed status for ${address}:`, addrErr);
          }
        }
      } catch (err) {
        console.error('Error fetching pending applications:', err);
      }
      
      console.log("Setting pending applications:", pendingApps);
      console.log("Setting reviewed applications:", reviewedApps);
      setPendingApplications(pendingApps);
      setReviewedApplications(reviewedApps);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch lawyer applications');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manual refresh button handler
  const handleRefresh = async () => {
    if (contract) {
      await fetchApplications(contract);
    }
  };

  // Approve lawyer application
  const approveLawyer = async (address) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tx = await contract.approveLawyer(address);
      await tx.wait();
      
      // Update the local state
      setPendingApplications(prev => prev.filter(app => app.address !== address));
      setReviewedApplications(prev => [
        ...prev, 
        {
          ...pendingApplications.find(app => app.address === address),
          status: 'approved',
          reviewDate: new Date()
        }
      ]);
      
      setConfirmDialog({ open: false, action: '', address: '' });
    } catch (err) {
      console.error('Error approving lawyer:', err);
      setError(`Failed to approve lawyer: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reject lawyer application
  const rejectLawyer = async (address) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tx = await contract.rejectLawyer(address);
      await tx.wait();
      
      // Update the local state
      setPendingApplications(prev => prev.filter(app => app.address !== address));
      setReviewedApplications(prev => [
        ...prev, 
        {
          ...pendingApplications.find(app => app.address === address),
          status: 'rejected',
          reviewDate: new Date()
        }
      ]);
      
      setConfirmDialog({ open: false, action: '', address: '' });
    } catch (err) {
      console.error('Error rejecting lawyer:', err);
      setError(`Failed to reject lawyer: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle action confirmation
  const handleConfirm = () => {
    if (confirmDialog.action === 'approve') {
      approveLawyer(confirmDialog.address);
    } else if (confirmDialog.action === 'reject') {
      rejectLawyer(confirmDialog.address);
    }
  };
  
  // View application details
  const viewApplication = (application) => {
    setSelectedApplication(application);
  };
  
  // Render status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" color="warning" />;
      case 'approved':
        return <Chip icon={<VerifiedIcon />} label="Approved" color="success" />;
      case 'rejected':
        return <Chip icon={<RejectedIcon />} label="Rejected" color="error" />;
      default:
        return null;
    }
  };
  
  // If loading
  if (isLoading && !error && !initialized) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // If not an admin
  if (!isAdmin && !isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          You do not have admin privileges to access this dashboard.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Your Role: <Chip icon={<UserIcon />} label="Admin" color="primary" />
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "Refresh Applications"}
          </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Pending Applications
            </Typography>
            {pendingApplications.length === 0 ? (
              <Alert severity="info">No pending applications</Alert>
            ) : (
              <List>
                {pendingApplications.map((app) => (
                  <Card key={app.address} sx={{ mb: 2 }}>
                    <CardHeader 
                      title={app.name}
                      subheader={`Bar Number: ${app.barNumber}`}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Email: {app.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Application Date: {app.applicationDate.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Wallet Address: {app.address}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => viewApplication(app)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<ApproveIcon />} 
                        color="success"
                        onClick={() => setConfirmDialog({ open: true, action: 'approve', address: app.address })}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<RejectIcon />} 
                        color="error"
                        onClick={() => setConfirmDialog({ open: true, action: 'reject', address: app.address })}
                      >
                        Reject
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </List>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Reviewed Applications
            </Typography>
            {reviewedApplications.length === 0 ? (
              <Alert severity="info">No reviewed applications</Alert>
            ) : (
              <List>
                {reviewedApplications.map((app) => (
                  <Card key={app.address} sx={{ mb: 2 }}>
                    <CardHeader 
                      title={app.name}
                      subheader={renderStatusChip(app.status)}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Bar Number: {app.barNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Review Date: {app.reviewDate.toLocaleString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => viewApplication(app)}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Application Details Dialog */}
      <Dialog
        open={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedApplication && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                Lawyer Application Details
                {renderStatusChip(selectedApplication.status)}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Name</Typography>
                  <Typography variant="body1">{selectedApplication.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Bar Number</Typography>
                  <Typography variant="body1">{selectedApplication.barNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Email</Typography>
                  <Typography variant="body1">{selectedApplication.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Wallet Address</Typography>
                  <Typography variant="body1">{selectedApplication.address}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Application Date</Typography>
                  <Typography variant="body1">
                    {selectedApplication.applicationDate.toLocaleString()}
                  </Typography>
                </Grid>
                {selectedApplication.additionalInfo && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Additional Information</Typography>
                    <Typography variant="body1">{selectedApplication.additionalInfo}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedApplication(null)}>Close</Button>
              {selectedApplication.status === 'pending' && (
                <>
                  <Button 
                    color="success"
                    onClick={() => {
                      setConfirmDialog({ open: true, action: 'approve', address: selectedApplication.address });
                      setSelectedApplication(null);
                    }}
                  >
                    Approve
                  </Button>
                  <Button 
                    color="error"
                    onClick={() => {
                      setConfirmDialog({ open: true, action: 'reject', address: selectedApplication.address });
                      setSelectedApplication(null);
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: '', address: '' })}
      >
        <DialogTitle>
          {confirmDialog.action === 'approve' ? 'Approve Lawyer' : 'Reject Lawyer'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === 'approve'
              ? 'Are you sure you want to approve this lawyer? This will grant them access to upload and manage legal documents.'
              : 'Are you sure you want to reject this lawyer? They will need to submit a new application to be considered again.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: '', address: '' })}>
            Cancel
          </Button>
          <Button
            color={confirmDialog.action === 'approve' ? 'success' : 'error'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              confirmDialog.action === 'approve' ? 'Approve' : 'Reject'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 