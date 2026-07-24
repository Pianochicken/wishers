import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// Healthcheck Route
app.get('/api/health', (req, res) => {
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
