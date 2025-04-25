import React, { useState, useEffect } from 'react';
import { Search, Power, Grid, Clock, ArrowUp, Home, PieChart, Wallet, User, Plus, X, ChevronDown } from 'lucide-react';
import { Alchemy, Network } from 'alchemy-sdk';
import { Center, Box, Flex } from '@chakra-ui/react';

const TokenWallet = () => {
  // States for the application
  const [activeTab, setActiveTab] = useState('tokens');
  const [totalBalance, setTotalBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addTokenModalOpen, setAddTokenModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('Account 08');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  // Alchemy Integration
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const secreteKey = import.meta.env.VITE_API_KEY;

  // Configure Alchemy
  const settings = {
    apiKey: secreteKey, // Replace with your Alchemy API key
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(settings);

  // Sample addresses for testing
  const exampleAddresses = [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Vitalik
    "0xF977814e90dA44bFA03b6295A0616a897441aceC", // Binance 8
    "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503" // Wallet with variety of tokens
  ];

  // Initial data loading
  useEffect(() => {
    loadDefaultData();
  }, []);

  // Load demo data initially
  const loadDefaultData = async () => {
    try {
      setLoading(true);
      const demoData = await mockFetchTokenData();
      setTokens(demoData.tokens);
      setTotalBalance(demoData.totalBalance);
      setLoading(false);
    } catch (error) {
      console.error("Error loading demo data:", error);
      setLoading(false);
    }
  };

  // Mock function for initial demo data
  const mockFetchTokenData = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalBalance: 38.95,
          tokens: [
            {
              id: 'eth',
              name: 'ETH',
              fullName: 'Ethereum',
              balance: '0.01065',
              valueUsd: 21.91,
              change: '+5.28',
              color: '#627EEA',
              symbol: 'ETH'
            },
            {
              id: 'brett',
              name: 'BRETT',
              fullName: 'Brett Token',
              balance: '0.6641',
              valueUsd: 10.16,
              change: '+12.31',
              color: '#2775CA',
              symbol: 'BRT'
            },
            {
              id: 'toshi',
              name: 'TOSHI',
              fullName: 'Toshi',
              balance: '84,556.6794',
              valueUsd: 15.21,
              change: '+9.36',
              color: '#4D5BD3',
              symbol: 'TSH'
            }
          ]
        });
      }, 600);
    });
  };

  // Function to fetch token balances using Alchemy API
  const fetchTokenBalances = async (address) => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      // Validate Ethereum address
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        setErrorMessage('Please enter a valid Ethereum address');
        setLoading(false);
        return;
      }

      // Fetch token balances
      const balances = await alchemy.core.getTokenBalances(address);
      
      // Filter out zero balances
      const nonZeroBalances = balances.tokenBalances.filter(token => 
        token.tokenBalance !== "0"
      );
      
      // Process each token to get metadata
      const tokenDataPromises = nonZeroBalances.map(async token => {
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        
        // Calculate actual token balance with correct decimals
        const decimals = metadata.decimals || 18;
        const balance = parseInt(token.tokenBalance) / Math.pow(10, decimals);
        
        // Format the balance based on its size
        let formattedBalance;
        if (balance < 0.001) {
          formattedBalance = '<0.001';
        } else if (balance > 1000000) {
          formattedBalance = balance.toLocaleString(undefined, { 
            maximumFractionDigits: 2,
            notation: 'compact',
            compactDisplay: 'short'
          });
        } else if (balance > 1000) {
          formattedBalance = balance.toLocaleString(undefined, { 
            maximumFractionDigits: 2 
          });
        } else if (balance > 1) {
          formattedBalance = balance.toLocaleString(undefined, { 
            maximumFractionDigits: 4 
          });
        } else {
          formattedBalance = balance.toLocaleString(undefined, { 
            maximumSignificantDigits: 6 
          });
        }
        
        // Generate token color based on contract address for consistency
        const colorHash = token.contractAddress.substring(2, 8);
        const color = `#${colorHash}`;
        
        return {
          id: token.contractAddress,
          name: metadata.symbol || 'Unknown',
          fullName: metadata.name || 'Unknown Token',
          balance: formattedBalance,
          rawBalance: balance, // Store raw balance for potential calculations
          valueUsd: 0, // Would require price API integration
          change: '+0.00', // Would require price history API
          color: color,
          symbol: metadata.symbol || '???',
          logoUrl: metadata.logo
        };
      });
      
      const tokenDataResults = await Promise.all(tokenDataPromises);
      
      // Sort tokens by name
      const sortedTokens = tokenDataResults.sort((a, b) => a.name.localeCompare(b.name));
      
      setTokens(sortedTokens);
      setTotalBalance('N/A'); // Would need price API to calculate actual total
      setCurrentAccount(address.substring(0, 6) + '...' + address.substring(38));
      setShowAddressModal(false);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching token data:", error);
      setErrorMessage('Failed to fetch token data. Please try again.');
      setLoading(false);
    }
  };

  // Calculate total balance from tokens (would need price API in real implementation)
  useEffect(() => {
    const sum = tokens.reduce((total, token) => total + parseFloat(token.valueUsd || 0), 0);
    if (!isNaN(sum)) {
      setTotalBalance(sum.toFixed(2));
    }
  }, [tokens]);

  // Filter tokens based on search query
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle token transfer (simulated)
  const handleTransfer = (tokenId) => {
    console.log(`Initiating transfer for token: ${tokenId}`);
    // In a real app, this would open a transfer modal or navigate to transfer page
  };

  // Function to toggle account dropdown
  const toggleAccountDropdown = () => {
    setShowAccountDropdown(!showAccountDropdown);
  };

  // Function to switch accounts
  const switchAccount = (accountName) => {
    setCurrentAccount(accountName);
    setShowAccountDropdown(false);
    // In a real app, this would trigger loading the selected account's data
  };

  // Color getter for token logo background
  const getTokenLogoBackground = (color) => {
    return { backgroundColor: color || '#627EEA' };
  };

  // Handle address search
  const handleAddressSearch = () => {
    if (addressInput.trim()) {
      fetchTokenBalances(addressInput.trim());
    } else {
      setErrorMessage('Please enter an Ethereum address');
    }
  };

  // Handle example address selection
  const useExampleAddress = (address) => {
    setAddressInput(address);
    fetchTokenBalances(address);
  };

  return (
<Box w="100vw">
    <Center>
    <Flex
            alignItems={'center'}
            justifyContent="center"
            flexDirection={'column'}
          >
        <div className="token-wallet bg-light" style={{ maxWidth: '430px', margin: '0 auto', position: 'relative' }}>
      {/* Header */}
      <div className="header d-flex justify-content-between align-items-center px-3 py-2">
        {showSearch ? (
          <div className="input-group">
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="Search tokens..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="d-flex align-items-center position-relative">
              <div 
                className="fw-bold d-flex align-items-center cursor-pointer" 
                onClick={toggleAccountDropdown}
                style={{ cursor: 'pointer' }}
              >
                {currentAccount} <ChevronDown size={16} className="ms-1" />
              </div>
              
              {showAccountDropdown && (
                <div className="position-absolute bg-white shadow rounded mt-1 py-1" style={{ top: '100%', left: 0, zIndex: 1000, minWidth: '150px' }}>
                  <div className="dropdown-item py-1 px-3" onClick={() => switchAccount('Account 08')}>Account 08</div>
                  <div className="dropdown-item py-1 px-3" onClick={() => switchAccount('Account 12')}>Account 12</div>
                  <div className="dropdown-item py-1 px-3" onClick={() => switchAccount('Account 15')}>Account 15</div>
                  <div className="dropdown-item py-1 px-3 text-primary" onClick={() => setShowAddressModal(true)}>Look up Address</div>
                </div>
              )}
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-light rounded-circle p-1" 
                onClick={() => setShowSearch(true)}
              >
                <Search size={16} />
              </button>
              <button 
                className="btn btn-sm btn-light rounded-circle p-1"
                onClick={() => setShowAddressModal(true)}
              >
                <Wallet size={16} />
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Balance Card */}
      <div className="balance-card bg-primary text-white m-3 p-3 rounded-4">
        <div className="small mb-1">$ Balance</div>
        <div className="d-flex justify-content-between align-items-center">
          {loading ? (
            <div className="placeholder-glow w-50">
              <span className="placeholder col-12"></span>
            </div>
          ) : (
            <h3 className="mb-0">{totalBalance === 'N/A' ? 'N/A' : `$ ${totalBalance}`}</h3>
          )}
          <button 
            className="btn btn-sm btn-light rounded-circle"
            onClick={() => setShowAddressModal(true)}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="action-buttons d-flex justify-content-around px-4 py-2">
        <div className="text-center">
          <button 
            className="btn btn-sm rounded-circle bg-light p-2 mb-1"
            onClick={() => console.log("Transfer clicked")}
          >
            <ArrowUp size={20} />
          </button>
          <div className="small">Transfer</div>
        </div>
        <div className="text-center">
          <button 
            className="btn btn-sm rounded-circle bg-light p-2 mb-1"
            onClick={() => console.log("Receive clicked")}
          >
            <Grid size={20} />
          </button>
          <div className="small">Receive</div>
        </div>
        <div className="text-center">
          <button 
            className="btn btn-sm rounded-circle bg-light p-2 mb-1"
            onClick={() => console.log("Activity clicked")}
          >
            <Clock size={20} />
          </button>
          <div className="small">Activity</div>
        </div>
        <div className="text-center">
          <button 
            className="btn btn-sm rounded-circle bg-light p-2 mb-1"
            onClick={() => setShowAddressModal(true)}
          >
            <Search size={20} />
          </button>
          <div className="small">Look up</div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="tabs px-3 pt-3">
        <div className="d-flex">
          <button 
            className={`btn flex-grow-1 ${activeTab === 'tokens' ? 'border-bottom border-primary text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('tokens')}
          >
            Tokens
          </button>
          <button 
            className={`btn flex-grow-1 ${activeTab === 'nft' ? 'border-bottom border-primary text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('nft')}
          >
            NFT
          </button>
          <button 
            className={`btn flex-grow-1 ${activeTab === 'defi' ? 'border-bottom border-primary text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('defi')}
          >
            DeFi
          </button>
        </div>
      </div>
      
      {/* Token List */}
      <div className="token-list px-3 py-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {loading ? (
          // Loading skeleton
          Array(3).fill().map((_, i) => (
            <div key={i} className="token-item d-flex align-items-center p-2 border-bottom">
              <div className="token-icon me-3 rounded-circle" style={{ width: '40px', height: '40px' }}>
                <div className="placeholder-glow w-100 h-100">
                  <span className="placeholder col-12 h-100 rounded-circle"></span>
                </div>
              </div>
              <div className="token-info flex-grow-1">
                <div className="placeholder-glow w-100">
                  <span className="placeholder col-4"></span>
                </div>
                <div className="placeholder-glow w-100">
                  <span className="placeholder col-6"></span>
                </div>
              </div>
            </div>
          ))
        ) : filteredTokens.length === 0 ? (
          <div className="text-center py-4 text-muted">
            No tokens found. Add a new token to get started.
          </div>
        ) : (
          filteredTokens.map((token) => (
            <div 
              key={token.id} 
              className="token-item d-flex align-items-center p-2 border-bottom"
              onClick={() => handleTransfer(token.id)}
              style={{ cursor: 'pointer' }}
            >
              {token.logoUrl ? (
                <img 
                  src={token.logoUrl} 
                  alt={token.symbol}
                  className="token-icon me-3 rounded-circle"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
              ) : (
                <div 
                  className="token-icon me-3 rounded-circle d-flex justify-content-center align-items-center text-white"
                  style={{ 
                    ...getTokenLogoBackground(token.color),
                    width: '40px', 
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {token.symbol.substring(0, 3)}
                </div>
              )}
              <div className="token-info flex-grow-1">
                <div className="d-flex justify-content-between">
                  <div className="fw-bold">{token.name}</div>
                  <div className="fw-bold">{token.balance}</div>
                </div>
                <div className="d-flex justify-content-between">
                  <div className="small text-muted">{token.fullName}</div>
                  <div className="small">
                    {token.valueUsd ? 
                      `$${parseFloat(token.valueUsd).toFixed(2)}` : 
                      '—'
                    }
                  </div>
                </div>
              </div>
              <div className={`token-change ms-2 ${parseFloat(token.change) >= 0 ? 'text-success' : 'text-danger'}`}>
                {token.change}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Bottom Navigation */}
      <div className="bottom-nav d-flex justify-content-around py-3 border-top mt-3 bg-white">
        <button className="btn btn-sm text-primary d-flex flex-column align-items-center">
          <Home size={20} />
          <span className="small">Home</span>
        </button>
        <button className="btn btn-sm text-muted d-flex flex-column align-items-center">
          <PieChart size={20} />
          <span className="small">Market</span>
        </button>
        <button className="btn btn-sm text-muted d-flex flex-column align-items-center">
          <Wallet size={20} />
          <span className="small">Browser</span>
        </button>
        <button className="btn btn-sm text-muted d-flex flex-column align-items-center">
          <User size={20} />
          <span className="small">My Profile</span>
        </button>
      </div>
      
      {/* Add Token Button */}
      <div style={{ position: 'absolute', bottom: '65px', right: '20px' }}>
        <button 
          className="btn btn-danger rounded-circle shadow p-2"
          onClick={() => setAddTokenModalOpen(true)}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Add Token Modal */}
      {addTokenModalOpen && (
        <div className="modal-backdrop" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1050 
        }}>
          <div className="modal-content bg-white rounded-4 p-4" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Add New Token</h5>
              <button 
                className="btn btn-sm btn-light rounded-circle"
                onClick={() => setAddTokenModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="mb-3">
              <label className="form-label">Token Contract Address</label>
              <input type="text" className="form-control" placeholder="0x..." />
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-secondary flex-grow-1"
                onClick={() => setAddTokenModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary flex-grow-1"
                onClick={() => setAddTokenModalOpen(false)}
              >
                Add Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Search Modal */}
      {showAddressModal && (
        <div className="modal-backdrop" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1050 
        }}>
          <div className="modal-content bg-white rounded-4 p-4" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Look up Ethereum Address</h5>
              <button 
                className="btn btn-sm btn-light rounded-circle"
                onClick={() => {
                  setShowAddressModal(false);
                  setErrorMessage('');
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="mb-3">
              <label className="form-label">Enter Ethereum Address</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="0x..." 
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
              {errorMessage && <div className="text-danger mt-2 small">{errorMessage}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Example Addresses:</label>
              <div className="d-flex flex-wrap gap-2">
                {exampleAddresses.map((address, index) => (
                  <button 
                    key={index}
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => useExampleAddress(address)}
                  >
                    {address.substring(0, 6)}...{address.substring(38)}
                  </button>
                ))}
              </div>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-secondary flex-grow-1"
                onClick={() => {
                  setShowAddressModal(false);
                  setErrorMessage('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary flex-grow-1"
                onClick={handleAddressSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
        </Flex>
    </Center>
</Box>
  );
};

export default TokenWallet;