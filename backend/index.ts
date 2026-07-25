import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth';
import aiRouter from './routes/ai';
import uniswapRouter from './routes/uniswap';
import debugRouter from './routes/debug';
import thegraphRouter from './routes/thegraph';
import { startAgentPolling } from './services/poller.js';
import { addWish, getPendingWishes, getAllWishesForHuman } from './services/wishes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0';

// Middlewares
app.use(cors());
app.use(express.json());

// Startup Config Integrity Check
console.log('--- 🔐 WISHERS Backend Environment Config Status ---');
console.log(`- World ID App ID: ${process.env.VITE_WORLD_APP_ID ? 'Configured ✅' : 'Missing ❌'}`);
console.log(`- Uniswap API Key: ${process.env.UNISWAP_API_KEY && process.env.UNISWAP_API_KEY !== 'your_uniswap_api_key' ? 'Configured ✅' : 'Missing ⚠️ (Fallback Mode)'}`);

console.log(`- The Graph API Key: ${process.env.THE_GRAPH_API_KEY && process.env.THE_GRAPH_API_KEY !== 'your_the_graph_api_key' ? 'Configured ✅' : 'Missing ⚠️ (DEX Monitor Mode)'}`);
console.log('----------------------------------------------------');

// Routes
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/uniswap', uniswapRouter);
app.use('/api/debug', debugRouter);
app.use('/api/thegraph', thegraphRouter);

// Wishes API
app.post('/api/wishes', (req: Request, res: Response) => {
  try {
    const { wish, nullifierHash } = req.body;
    if (!wish || !nullifierHash) {
      return res.status(400).json({ error: 'wish and nullifierHash are required' });
    }
    const newWish = addWish({ ...wish, nullifierHash });
    res.json({ status: 'success', wish: newWish });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add wish', details: error.message });
  }
});

app.get('/api/wishes', (req: Request, res: Response) => {
  res.json({ status: 'success', activeWishes: getPendingWishes() });
});

app.get('/api/wishes/:nullifierHash', (req: Request, res: Response) => {
  res.json({ status: 'success', wishes: getAllWishesForHuman(req.params.nullifierHash as string) });
});

// Healthcheck Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'WISHERS API',
    timestamp: new Date().toISOString(),
    network: 'Base Sepolia (chainId: 84532)',

  });
});

// Start Express Server explicitly on IPv4 (0.0.0.0)
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 WISHERS Express Backend listening on http://localhost:${PORT}`);
  
  // Start the background AI Agent Polling Mechanism
  startAgentPolling(30000); // 30 seconds for demo purposes
});

// Graceful Port Cleanup on Hot Reload / Shutdown
const cleanup = () => {
  server.close(() => {
    console.log('Backend HTTP server closed cleanly.');
  });
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
