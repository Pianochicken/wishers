import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth';
import aiRouter from './routes/ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to current dir

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);

// Healthcheck Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'WISHERS API',
    timestamp: new Date().toISOString(),
    network: 'Base Sepolia (chainId: 84532)',
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 WISHERS Express Backend listening on http://localhost:${PORT}`);
});
