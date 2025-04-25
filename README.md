# Simple ERC-20 Indexer
What's a Token Indexer?

A token indexer is a backend service or tool that collects, organizes, and serves token-related data (like balances, transfers, and metadata) across the blockchain.

Why it's needed:

Raw blockchain data is low-level and hard to query. A token indexer:

 . Reads block data

 . Extracts and processes ERC-20/ERC-721/ERC-1155 token events (e.g. Transfer)

 . Stores it in a database for fast querying


 ✅ What it does:

Function	                  Description
🔄 Tracks balances	         Keeps live balances of tokens for addresses

🧾 Indexes transfers        	Parses Transfer events for history and activity

🎯 Filters by token/user	 Lets you query by wallet, token, block, etc.

📦 Caches metadata	        Stores token name, symbol, logo, decimals

⚡ Serves fast queries    	Exposes clean APIs for frontend apps



💡 Analogy:
A token indexer is like Google Search for blockchain tokens — it continuously reads raw blockchain data and builds a fast, searchable database.

## Set Up

1. Install dependencies by running `npm install`
2. Start application by running `npm run dev`

