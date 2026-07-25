# WISHERS 🙏🏻
<img width="2752" height="1536" alt="banner-16-9-1" src="https://github.com/user-attachments/assets/4b8a6f53-f5f0-448a-b101-03d5327dcfa8" />

**WISHERS** is a decentralized, intent-driven AI agent that empowers users to execute complex, condition-based DeFi trades using natural language. We designed WISHERS to be a completely **"Walletless"** experience—the User is the Wallet.

### The WISHERS Architecture

The architecture of WISHERS is broken down into a React frontend and a Node.js/Express backend, working together to create a seamless agentic experience.

1. **Walletless Authentication (World ID)**: We completely removed WalletConnect and MetaMask. The frontend uses **World ID (IDKit)** for Proof of Personhood. Only verified humans can access the agent dashboard. Your World ID Nullifier Hash uniquely and deterministically generates your AI Agent's Wallet.
2. **One-Roundtrip Agent Delegation (AgentKit)**: When your AI Agent needs to execute a transaction on your behalf, it must prove that a human delegated this authority. We integrated **AgentKit (SIWE)** directly into our backend Poller, securely generating the cryptographic Proof-of-Human signature in a single roundtrip, bypassing typical authentication friction.
3. **Live Data Monitoring (The Graph)**: We built a background Poller service that periodically queries the massive Ethereum Mainnet Uniswap V3 Subgraph (USDC/WETH). We rely on The Graph for accurate, real-time data and liquidity data, which acts as the definitive source of truth for triggering our agent's actions.
4. **Automated Execution (Uniswap Trading API)**: When a condition is met (e.g., TVL drops below a threshold), the agent utilizes the **Uniswap Trading API v1** (`/v1/quote` and `/v1/swap`) to find the best route. The transaction is then signed and broadcasted securely to the **World Chain Mainnet** by the delegated Agent Wallet, with verifiable transaction hashes linking to **Worldscan**.
5. **Intent Parsing (OpenAI)**: User's natural language inputs are processed by an LLM via OpenAI's API (using Structured Outputs/Function Calling), strictly casting the intent into a Zod-validated schema with specific threshold conditions and swap actions.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide React (Icons).
- **Backend**: Node.js, Express, Ethers.js v6.
- **AI Engine**: OpenAI API (Function Calling with Zod Schema validation).
- **Blockchain Data**: The Graph (Ethereum Mainnet Uniswap V3 Subgraph).
- **DeFi Execution**: Uniswap Trading API v1, World Chain Mainnet.
- **Identity & Delegation**: World ID (IDKit), AgentKit.

---

## 📖 Getting Started: Step-by-Step Guide

### Prerequisites
Before running WISHERS locally, you need to set up a few developer accounts and get API keys:
1. **Worldcoin Developer Portal**:
   - Go to [developer.world.org](https://developer.world.org) and create a project.
   - Get your **App ID** (for the frontend).
   - Get your **RP ID** (Relying Party ID) and **RP Signing Key** (for backend AgentKit generation).
2. **Uniswap API Key**:
   - Go to [hub.uniswap.org](https://hub.uniswap.org) and get an API key for the Trading API.
3. **The Graph Studio**:
   - Go to [thegraph.com/studio](https://thegraph.com/studio) and generate an API key.
4. **OpenAI API Key**:
   - Get an API key from [platform.openai.com](https://platform.openai.com).
5. **Node.js**:
   - Ensure you have Node.js (v18 or higher) installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Pianochicken/wishers.git
   cd wishers
   ```

2. **Environment Variables**:
   Copy the `.env.example` file to a new `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and carefully fill in all the keys you gathered in the Prerequisites step:
   - `VITE_WORLD_APP_ID`
   - `WORLD_RP_ID`
   - `RP_SIGNING_KEY`
   - `UNISWAP_API_KEY`
   - `THE_GRAPH_API_KEY`
   - `GROQ_API_KEY`
   - `OPENAI_API_KEY`

3. **Install Dependencies**:
   Our project uses a modern npm workspaces monorepo structure. Install everything from the root:
   ```bash
   npm install
   ```

4. **Fund Your Agent Wallet (Important!)**:
   - Because this is a **Walletless** application, your AI Agent will execute transactions on the **World Chain Mainnet**.
   - When you log in via World ID, the frontend will display your Agent's `0x...` Wallet Address.
   - You must send a small amount of **World Chain ETH** to this Agent address to cover gas fees and perform swaps.

5. **Run the Development Server**:
   Launch both the React Frontend and the Express Backend concurrently:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

### Usage
1. Click **"Verify with World ID"** to authenticate. (You can toggle the developer simulator mode in the UI if you don't want to scan the QR code with the real World App).
2. **Register Your Agent**: The UI will now display your WISHERS Agent Wallet Address (e.g., `0x2Eba...`). For the backend verification to pass, you must first register this newly generated agent on the World Chain AgentBook. Open a new terminal and run:
   ```bash
   npx @worldcoin/agentkit-cli register <your-agent-address>
   ```

    You can find details in: https://docs.world.org/agents/agent-kit/integrate 
3. Type a natural language command in the cyberpunk chat interface, for example:
   > *"Monitor the WETH pool. If the TVL rises above $200,000,000 , please swap 0.00001 ETH to WETH."*
4. The AI parses your intent and displays a confirmation card.
5. Click **Confirm Wish**.
6. The **WISHERS Agent** continuously monitors The Graph in the background. Once the TVL reaches your threshold, your Agent signs the AgentKit SIWE payload and automatically executes the trade on Uniswap!
7. Click the generated **Worldscan** link on your Active Wishes dashboard to view the on-chain execution.
