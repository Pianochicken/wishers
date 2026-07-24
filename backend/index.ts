import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth';
import aiRouter from './routes/ai';
import uniswapRouter from './routes/uniswap';
import debugRouter from './routes/debug';

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
console.log(`- Treasury Address: ${process.env.WISHERS_TREASURY_ADDRESS ? process.env.WISHERS_TREASURY_ADDRESS : 'Missing ⚠️'}`);
console.log(`- The Graph API Key: ${process.env.THE_GRAPH_API_KEY && process.env.THE_GRAPH_API_KEY !== 'your_the_graph_api_key_here' ? 'Configured ✅' : 'Missing ⚠️ (DEX Monitor Mode)'}`);
console.log('----------------------------------------------------');

// Routes
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/uniswap', uniswapRouter);
app.use('/api/debug', debugRouter);

// Healthcheck Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'WISHERS API',
    timestamp: new Date().toISOString(),
    network: 'Base Sepolia (chainId: 84532)',
    treasury: process.env.WISHERS_TREASURY_ADDRESS || 'Not Configured',
  });
});

// Start Express Server explicitly on IPv4 (0.0.0.0)
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 WISHERS Express Backend listening on http://localhost:${PORT}`);
});

// Graceful Port Cleanup on Hot Reload / Shutdown
const cleanup = () => {
  server.close(() => {
    console.log('Backend HTTP server closed cleanly.');
  });
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
