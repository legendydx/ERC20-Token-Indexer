import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Text,
  Flex,
  IconButton,
  Divider,
  Tabs,
  TabList,
  Tab,
  Button,
  Image,
  Spinner
} from '@chakra-ui/react';

const TokenSelectionPage = ({ onBack, onSelectToken }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock tokens data
  const mockTokens = [
    {
      id: 'usdc',
      name: 'USDC',
      contract: '0x4a0d1092E9df255cf95D72834Ea9255132782318',
      category: 'popular',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      color: '#2775CA'
    },
    {
      id: 'dai',
      name: 'DAI',
      contract: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      category: 'popular',
      logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
      color: '#F5AC37'
    },
    {
      id: 'beth',
      name: 'BETH',
      contract: '0xfC673d2bd0B1F54996D1Fea9a6d65a828c95f5D2',
      category: 'popular',
      logo: 'https://cryptologos.cc/logos/lido-staked-ether-steth-logo.png',
      color: '#EC5E2A'
    },
    {
      id: 'ezeth',
      name: 'EZETH',
      contract: '0xbf5495Efe5DB9ce00f80364C8B423567e58D2110',
      category: 'popular',
      logo: 'https://cryptologos.cc/logos/rocket-pool-rpl-logo.png',
      color: '#8DC351'
    },
    {
      id: 'brett',
      name: 'BRETT',
      contract: '0x3bE9e10Bf57b478233d00c1e10d0E79e5D843323',
      category: 'popular',
      logo: 'https://cryptologos.cc/logos/basic-attention-token-bat-logo.png',
      color: '#2775CA'
    },
    {
      id: 'cbeth',
      name: 'CBETH',
      contract: '0x4AC8bD1bDaE47beeF2397e920C61AD300aCa0B54',
      category: 'popular',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      color: '#627EEA'
    },
    {
      id: 'eth',
      name: 'ETH',
      contract: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      category: 'myAsset',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      color: '#627EEA'
    },
    {
      id: 'link',
      name: 'LINK',
      contract: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      category: 'myAsset',
      logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
      color: '#2A5ADA'
    }
  ];

  // Load tokens
  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setTokens(mockTokens);
        setLoading(false);
      }, 700);
    };
    
    loadTokens();
  }, []);

  // Filter tokens based on search and category
  useEffect(() => {
    let result = tokens;
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(token => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.contract.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory === 'all') {
      result = tokens.filter(token => token.category === 'myAsset');
    } else if (selectedCategory === 'custom') {
      // Custom tokens would be user-added tokens
      result = [];
    } else if (selectedCategory === 'popular') {
      result = tokens.filter(token => token.category === 'popular');
    }
    
    setFilteredTokens(result);
  }, [searchQuery, selectedCategory, tokens]);

  // Handle token selection
  const handleSelectToken = (token) => {
    if (onSelectToken) {
      onSelectToken(token);
    }
  };

  // Handle adding a token
  const handleAddToken = (token) => {
    console.log('Adding token:', token);
    // In a real application, this would add the token to the user's assets
  };

  return (
    <Box 
      w="100%" 
      maxW="430px" 
      mx="auto" 
      borderRadius="xl" 
      boxShadow="xl" 
      overflow="hidden" 
      bg="white" 
      h="600px"
    >
      {/* Header */}
      <Flex 
        align="center" 
        p={4} 
        borderBottom="1px solid" 
        borderColor="gray.200"
      >
        <IconButton
          icon={<ArrowLeft size={20} />}
          variant="ghost"
          borderRadius="full"
          onClick={onBack}
          aria-label="Go back"
          mr={2}
        />
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Search size={18} color="gray" />
          </InputLeftElement>
          <Input 
            placeholder="Enter token name or token contract address" 
            size="md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="full"
            fontSize="sm"
          />
        </InputGroup>
      </Flex>

      {/* Categories */}
      <Box px={4} py={3}>
        <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
          Displayed Assets
        </Text>
        
        <VStack spacing={0} align="stretch">
          <Box 
            p={3}
            bg={selectedCategory === 'all' ? 'red.50' : 'transparent'}
            borderRadius="md"
            border="1px solid"
            borderColor={selectedCategory === 'all' ? 'red.500' : 'gray.200'}
            mb={2}
            cursor="pointer"
            onClick={() => setSelectedCategory('all')}
          >
            <Text 
              color={selectedCategory === 'all' ? 'red.500' : 'black'}
              fontWeight={selectedCategory === 'all' ? 'semibold' : 'normal'}
            >
              All My Assets
            </Text>
          </Box>
          
          <Box 
            p={3}
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            mb={2}
            cursor="pointer"
            onClick={() => setSelectedCategory('custom')}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text>Custom Token</Text>
            <Box fontSize="xl" color="gray.400">›</Box>
          </Box>
          
          <Box mt={4} mb={3}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Popular Assets
            </Text>
          </Box>
        </VStack>
      </Box>

      {/* Token List */}
      <Box px={4} pb={4} overflowY="auto" maxH="360px">
        {loading ? (
          <Flex justify="center" py={8}>
            <Spinner size="lg" color="blue.500" />
          </Flex>
        ) : filteredTokens.length === 0 && selectedCategory === 'popular' ? (
          <VStack spacing={3}>
            {tokens
              .filter(token => token.category === 'popular')
              .map(token => (
                <Flex 
                  key={token.id}
                  w="100%" 
                  justify="space-between" 
                  align="center" 
                  py={2}
                >
                  <HStack spacing={3}>
                    <Flex 
                      w="36px" 
                      h="36px" 
                      borderRadius="full" 
                      bg={token.color || "gray.200"} 
                      justify="center" 
                      align="center"
                      overflow="hidden"
                    >
                      {token.logo ? (
                        <Image src={token.logo} alt={token.name} w="100%" h="100%" objectFit="cover" />
                      ) : (
                        <Text color="white" fontWeight="bold">{token.name.substring(0, 1)}</Text>
                      )}
                    </Flex>
                    <Box>
                      <Text fontWeight="medium">{token.name}</Text>
                      <Text fontSize="xs" color="gray.500">{token.contract.substring(0, 8)}...{token.contract.substring(token.contract.length - 8)}</Text>
                    </Box>
                  </HStack>
                  <IconButton
                    icon={<Plus size={16} />}
                    size="sm"
                    borderRadius="full"
                    variant="outline"
                    onClick={() => handleAddToken(token)}
                    aria-label="Add token"
                  />
                </Flex>
              ))}
          </VStack>
        ) : filteredTokens.length === 0 ? (
          <Flex justify="center" align="center" py={8} color="gray.500">
            No tokens found matching your search
          </Flex>
        ) : (
          <VStack spacing={3}>
            {filteredTokens.map(token => (
              <Flex 
                key={token.id}
                w="100%" 
                justify="space-between" 
                align="center" 
                py={2}
                cursor="pointer"
                onClick={() => handleSelectToken(token)}
              >
                <HStack spacing={3}>
                  <Flex 
                    w="36px" 
                    h="36px" 
                    borderRadius="full" 
                    bg={token.color || "gray.200"} 
                    justify="center" 
                    align="center"
                    overflow="hidden"
                  >
                    {token.logo ? (
                      <Image src={token.logo} alt={token.name} w="100%" h="100%" objectFit="cover" />
                    ) : (
                      <Text color="white" fontWeight="bold">{token.name.substring(0, 1)}</Text>
                    )}
                  </Flex>
                  <Box>
                    <Text fontWeight="medium">{token.name}</Text>
                    <Text fontSize="xs" color="gray.500">{token.contract.substring(0, 8)}...{token.contract.substring(token.contract.length - 8)}</Text>
                  </Box>
                </HStack>
                {selectedCategory === 'popular' ? (
                  <IconButton
                    icon={<Plus size={16} />}
                    size="sm"
                    borderRadius="full"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToken(token);
                    }}
                    aria-label="Add token"
                  />
                ) : null}
              </Flex>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

// Example usage:
const TokenSelection = () => {
  const [showSelection, setShowSelection] = useState(true);
  const [selectedToken, setSelectedToken] = useState(null);

  const handleBack = () => {
    console.log('Navigating back...');
    setShowSelection(false);
  };

  const handleSelectToken = (token) => {
    console.log('Selected token:', token);
    setSelectedToken(token);
    // In a real app, you would do something with this token
  };

  return (
    <Box>
      {showSelection ? (
        <TokenSelectionPage 
          onBack={handleBack} 
          onSelectToken={handleSelectToken} 
        />
      ) : (
        <Box p={4} textAlign="center">
          <Text>Token Selection Closed</Text>
          <Button mt={4} onClick={() => setShowSelection(true)}>
            Reopen Selection
          </Button>
          {selectedToken && (
            <Box mt={4} p={4} bg="gray.100" borderRadius="md">
              <Text fontWeight="bold">Last Selected Token: {selectedToken.name}</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TokenSelection;