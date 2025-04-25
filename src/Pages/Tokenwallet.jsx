import React, { useState, useEffect } from 'react';
import { Search, Power, Grid, Clock, ArrowUp, Home, PieChart, Wallet, User, Plus, X, ChevronDown, Loader } from 'lucide-react';
import { Center, Flex, Box, Image } from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';

const TokenWallet = ({ initialData = null }) => {
  // States for the application
  const [activeTab, setActiveTab] = useState('tokens');
  const [totalBalance, setTotalBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addTokenModalOpen, setAddTokenModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('ETH Wallet');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  // Alchemy API related states
  const [addressSearchOpen, setAddressSearchOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [addressSearching, setAddressSearching] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState('');
  const [isResolvingENS, setIsResolvingENS] = useState(false);
  const [ensName, setEnsName] = useState('');
  
  const [lastSearchedAddress, setLastSearchedAddress] = useState('');
  const [tokenBalances, setTokenBalances] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);

  // API Key - In a production app, this should be securely managed
  // Here we're assuming it would be injected through environment variables
  const secreteKey = import.meta.env.VITE_API_KEY; // This should be replaced in production

  // Initialize Alchemy configuration
  const alchemyConfig = {
    apiKey: secreteKey,
    network: Network.ETH_MAINNET,
  };

  // Function to resolve ENS name to Ethereum address
  const resolveENS = async (ensName) => {
    if (!ensName.endsWith('.eth') && !ensName.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error("Invalid ENS name or Ethereum address format");
    }
    
    setIsResolvingENS(true);
    
    try {
      const alchemy = new Alchemy(alchemyConfig);
      
      // If it's already an Ethereum address, return it directly
      if (ensName.match(/^0x[a-fA-F0-9]{40}$/)) {
        return ensName;
      }
      
      // Resolve ENS name to Ethereum address
      const address = await alchemy.core.resolveName(ensName);
      
      if (!address) {
        throw new Error(`Could not resolve ENS name: ${ensName}`);
      }
      
      // Store the ENS name for display purposes
      setEnsName(ensName);
      
      return address;
    } catch (error) {
      console.error("Error resolving ENS name:", error);
      throw error;
    } finally {
      setIsResolvingENS(false);
    }
  };

  // Function to look up ENS name for an Ethereum address
  const lookupENS = async (address) => {
    try {
      const alchemy = new Alchemy(alchemyConfig);
      const ensName = await alchemy.core.lookupAddress(address);
      if (ensName) {
        setEnsName(ensName);
      }
      return ensName;
    } catch (error) {
      console.error("Error looking up ENS name:", error);
      return null;
    }
  };

  // Fetch real token balances using Alchemy API
  const fetchTokenBalances = async (addressOrENS) => {
    setAddressSearching(true);
    
    try {
      // Resolve ENS name if provided
      let address;
      
      if (addressOrENS.endsWith('.eth')) {
        address = await resolveENS(addressOrENS);
      } else if (addressOrENS.match(/^0x[a-fA-F0-9]{40}$/)) {
        address = addressOrENS;
        // Try to lookup ENS for this address
        await lookupENS(address);
      } else {
        throw new Error("Invalid Ethereum address or ENS name format");
      }

      const alchemy = new Alchemy(alchemyConfig);
      
      // Get token balances
      const data = await alchemy.core.getTokenBalances(address);
      setTokenBalances(data.tokenBalances);
      
      // Get metadata for each token
      const tokenDataPromises = [];
      for (let i = 0; i < data.tokenBalances.length; i++) {
        const tokenData = alchemy.core.getTokenMetadata(
          data.tokenBalances[i].contractAddress
        );
        tokenDataPromises.push(tokenData);
      }
      
      const tokenDataObjects = await Promise.all(tokenDataPromises);
      setTokenMetadata(tokenDataObjects);
      
      // Process and format the token data
      const formattedTokens = data.tokenBalances.map((balance, index) => {
        const metadata = tokenDataObjects[index];
        const formattedBalance = metadata.decimals ? 
          Utils.formatUnits(balance.tokenBalance, metadata.decimals) : 
          balance.tokenBalance.toString();
          
        // Generate a color based on token symbol if no logo is available
        const generateColor = (symbol) => {
          const colors = ['#627EEA', '#2775CA', '#4D5BD3', '#F7931A', '#26A17B', '#FF007A', '#B6509E', '#1AAB9B'];
          let hash = 0;
          for (let i = 0; i < symbol.length; i++) {
            hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
          }
          return colors[Math.abs(hash) % colors.length];
        };
        
        return {
          id: balance.contractAddress,
          name: metadata.symbol || 'UNKNOWN',
          fullName: metadata.name || 'Unknown Token',
          balance: formattedBalance,
          valueUsd: 0, // Would require price API to get real USD value
          change: '0.00', // Would require historical price data
          color: generateColor(metadata.symbol || 'UNKNOWN'),
          symbol: metadata.symbol || '?',
          logo: metadata.logo
        };
      });
      
      // Filter out zero balances and sort by balance (descending)
      const nonZeroTokens = formattedTokens.filter(token => 
        parseFloat(token.balance) > 0 && token.name !== 'UNKNOWN'
      );
      
      setTokens(nonZeroTokens);
      setHasQueried(true);
      return nonZeroTokens;
    } catch (error) {
      console.error("Error fetching token data:", error);
      throw error;
    } finally {
      setAddressSearching(false);
    }
  };

  // Handle address search submission
  const handleAddressSearch = async (e) => {
    e?.preventDefault();
    
    if (!addressInput.trim()) {
      setAddressSearchError("Please enter an address or ENS name");
      return;
    }
    
    setAddressSearchError("");
    setLoading(true);
    
    try {
      const fetchedTokens = await fetchTokenBalances(addressInput);
      setLastSearchedAddress(addressInput);
      setAddressSearchOpen(false);
      setAddressInput("");
      
      // Calculate total balance (would require price API for actual values)
      // For now, we'll just count the number of tokens
      setTotalBalance(fetchedTokens.length);
    } catch (error) {
      setAddressSearchError(error.toString());
    } finally {
      setLoading(false);
    }
  };

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

  // Color getter for token logo background
  const getTokenLogoBackground = (color) => {
    return { backgroundColor: color || '#627EEA' };
  };

  // Function to get displayed address/ENS
  const getDisplayName = () => {
    if (ensName && lastSearchedAddress === ensName) {
      return ensName;
    } else if (ensName) {
      return ensName;
    } else if (lastSearchedAddress) {
      if (lastSearchedAddress.endsWith('.eth')) {
        return lastSearchedAddress;
      }
      return `${lastSearchedAddress.substring(0, 6)}...${lastSearchedAddress.substring(lastSearchedAddress.length - 4)}`;
    } else {
      return currentAccount;
    }
  };

  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <div className="token-wallet bg-light" style={{ maxWidth: '430px', margin: '0 auto', position: 'relative' }}>
            {/* Phone frame simulation */}
            <div>
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
                        {getDisplayName()} <ChevronDown size={16} className="ms-1" />
                      </div>
                      
                      {showAccountDropdown && (
                        <div className="position-absolute bg-white shadow rounded my-1 py-1" style={{ top: '100%', left: 0, zIndex: 1000, minWidth: '200px' }}>
                          <div 
                            className="dropdown-item py-1 px-3"
                            onClick={() => {
                              setAddressSearchOpen(true);
                              setShowAccountDropdown(false);
                            }}
                          >
                            Look up Address or ENS
                          </div>
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
                        onClick={() => setAddressSearchOpen(true)}
                      >
                        <Wallet size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Balance Card */}
              <div className="balance-card bg-primary text-white m-3 p-3 rounded-4">
                <div className="small mb-1">
                  {ensName ? (
                    <span>Name: {ensName}</span>
                  ) : lastSearchedAddress ? (
                    <span>Address: {lastSearchedAddress.substring(0, 6)}...{lastSearchedAddress.substring(lastSearchedAddress.length - 4)}</span>
                  ) : (
                    "ERC-20 Token Wallet"
                  )}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  {loading ? (
                    <div className="placeholder-glow w-50">
                      <span className="placeholder col-12"></span>
                    </div>
                  ) : (
                    <h3 className="mb-0">
                      {hasQueried ? `${tokens.length} Tokens Found` : "No Tokens"}
                    </h3>
                  )}
                  <button 
                    className="btn btn-sm btn-light rounded-circle"
                    onClick={() => setAddressSearchOpen(true)}
                  >
                    <Search size={16} />
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
                    onClick={() => console.log("Graph clicked")}
                  >
                    <PieChart size={20} />
                  </button>
                  <div className="small">Graph</div>
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
                ) : !hasQueried ? (
                  <div className="text-center py-4 text-muted">
                    Search for an Ethereum address or ENS name to view its ERC-20 tokens
                  </div>
                ) : filteredTokens.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No tokens found for this address or no tokens match your search.
                  </div>
                ) : (
                  filteredTokens.map((token) => (
                    <div 
                      key={token.id} 
                      className="token-item d-flex align-items-center p-2 border-bottom"
                      onClick={() => handleTransfer(token.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {token.logo ? (
                        <img 
                          src={token.logo} 
                          className="token-icon me-3 rounded-circle"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          alt={token.symbol}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="token-icon me-3 rounded-circle d-flex justify-content-center align-items-center text-white"
                        style={{ 
                          ...getTokenLogoBackground(token.color),
                          width: '40px', 
                          height: '40px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          display: token.logo ? 'none' : 'flex'
                        }}
                      >
                        {token.symbol}
                      </div>
                      <div className="token-info flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <div className="fw-bold">{token.name}</div>
                          <div className="fw-bold">{parseFloat(token.balance).toLocaleString(undefined, {
                            maximumFractionDigits: 6
                          })}</div>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div className="small text-muted">{token.fullName}</div>
                          <div className="small text-muted">{token.id.substring(0, 6)}...{token.id.substring(token.id.length - 4)}</div>
                        </div>
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
                <button 
                  className="btn btn-sm text-muted d-flex flex-column align-items-center"
                  onClick={() => setAddressSearchOpen(true)}
                >
                  <Wallet size={20} />
                  <span className="small">Address</span>
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
                    
            </div>

            {/* Address Search Modal */}
            {addressSearchOpen && (
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
                    <h5 className="mb-0">Lookup ERC-20 Tokens</h5>
                    <button 
                      className="btn btn-sm btn-light rounded-circle"
                      onClick={() => {
                        setAddressSearchOpen(false);
                        setAddressSearchError('');
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <form onSubmit={handleAddressSearch}>
                    <div className="mb-3">
                      <label className="form-label">Ethereum Address or ENS Name</label>
                      <input 
                        type="text" 
                        className={`form-control ${addressSearchError ? 'is-invalid' : ''}`}
                        placeholder="0x... or name.eth" 
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                      />
                      {addressSearchError && (
                        <div className="invalid-feedback">{addressSearchError}</div>
                      )}
                      <div className="form-text">
                        Get all the ERC-20 token balances using an address or ENS name
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        type="button"
                        className="btn btn-secondary flex-grow-1"
                        onClick={() => {
                          setAddressSearchOpen(false);
                          setAddressSearchError('');
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="btn btn-primary flex-grow-1"
                        disabled={addressSearching}
                      >
                        {addressSearching ? (
                          <span className="d-flex align-items-center justify-content-center">
                            <Loader size={16} className="me-2 spin" /> 
                            {isResolvingENS ? 'Resolving ENS...' : 'Searching...'}
                          </span>
                        ) : 'Search'}
                      </button>
                    </div>
                  </form>
                  <div className="mt-3">
                    <p className="mb-1 fw-bold">Example inputs to try:</p>
                    <ul className="small">
                      <li className="mb-1">
                        <button 
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          onClick={() => {
                            setAddressInput("vitalik.eth");
                          }}
                        >
                          vitalik.eth
                        </button>
                      </li>
                      <li className="mb-1">
                        <button 
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          onClick={() => {
                            setAddressInput("0x71c7656ec7ab88b098defb751b7401b5f6d8976f");
                          }}
                        >
                          0x71c7656ec7ab88b098defb751b7401b5f6d8976f
                        </button>
                      </li>
                      <li>
                        <button 
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          onClick={() => {
                            setAddressInput("0xf977814e90da44bfa03b6295a0616a897441acec");
                          }}
                        >
                          0xf977814e90da44bfa03b6295a0616a897441acec
                        </button>
                      </li>
                    </ul>
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