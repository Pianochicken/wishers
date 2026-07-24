import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

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
