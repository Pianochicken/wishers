# WISHERS 🙏🏻

**WISHERS** is a decentralized, intent-driven AI agent that empowers users to execute complex, condition-based DeFi trades using natural language.

### How it's made
The architecture of WISHERS is broken down into a React frontend and a Node.js/Express backend, working together to create a seamless agentic experience. 
1. **Authentication (World ID)**: The frontend uses IDKit v4 for Proof of Personhood. Only verified humans can access the agent dashboard, preventing sybil attacks on our AI infrastructure.
2. **Live Data Monitoring (The Graph)**: We built a background Poller service that periodically queries the Uniswap V3 Subgraph on Ethereum Mainnet. We rely on The Graph for accurate, real-time Total Value Locked (TVL) and liquidity data, which acts as the definitive source of truth for triggering our agent.
3. **Automated Execution (Uniswap Trading API)**: When a condition is met, our agent utilizes the Uniswap Trading API v1 (`/v1/quote` and `/v1/swap`) to find the best route across V2 and V3 pools. By utilizing Native ETH, we bypass Permit2 approvals for faster emergency execution. The transaction is then signed and broadcasted by a secure, delegated ethers.js agent wallet.
4. **Intent Parsing (Groq/OpenAI/LLM)**: User's natural language inputs are processed by an LLM via Groq's/OpenAI's API, strictly casting the intent into a Zod-validated schema with specific threshold conditions and swap actions.

The most interesting architectural aspect is our polling engine design: we utilize a lightweight, recursive polling loop in Node.js that checks The Graph. It evaluates multiple user wishes in parallel against a single GraphQL query, heavily optimizing network requests while still guaranteeing rapid execution when disaster strikes.

---

## System Architecture

WISHERS operates on a strictly defined 4-step pipeline to ensure security and rapid execution:

1. **Verify**: User authenticates as a unique human using **World ID**.
2. **Express**: User types a natural language intent (e.g., *"Wrap my ETH if WETH TVL crosses $200M"*).
3. **Monitor**: The backend AI agent continuously polls **The Graph (Uniswap V3 Subgraph)** for live on-chain metrics.
4. **Execute**: Once conditions are met, the agent signs and broadcasts the swap transaction directly via the **Uniswap Trading API v1**.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide React (Icons).
- **Backend**: Node.js, Express, Ethers.js v6.
- **AI Engine**: Groq/OpenAI API (Function Calling with Zod Schema validation).
- **Blockchain Data**: The Graph (Uniswap V3 Mainnet Subgraph).
- **DeFi Execution**: Uniswap Trading API v1, Base Sepolia (Testnet).
- **Identity**: Worldcoin IDKit v4.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Wallet with Base Sepolia ETH


### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Pianochicken/wishers.git
   cd wishers
   ```
2. Environment Variables:
   Copy the `.env.example` file to a new `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to add your own keys.

3. Install dependencies (Workspace monorepo):
   ```bash
   npm install
   ```
4. Run the development server (Frontend + Backend concurrently):
   ```bash
   npm run dev
   ```
