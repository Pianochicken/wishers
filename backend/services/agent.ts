import { ethers } from 'ethers';

// World Chain Mainnet RPC Provider
const WORLD_CHAIN_RPC_URL = process.env.WORLD_CHAIN_RPC_URL || 'https://worldchain-mainnet.g.alchemy.com/public';
export const provider = new ethers.JsonRpcProvider(WORLD_CHAIN_RPC_URL);

export interface AgentSession {
  nullifierHash: string;
  agentAddress: string;
  createdAt: number;
  expiresAt: number; // Timestamp in ms
  durationHours: number;
}

// In-memory active agent sessions store
const activeAgentSessions = new Map<string, AgentSession>();

/**
 * Generates a REAL EVM World Chain Wallet deterministically bound to the user's World ID Nullifier
 */
export function getOrCreateRealAgentWallet(nullifierHash: string, durationHours = 24): AgentSession {
  // ESM Fix: Access env vars inside the function at runtime so dotenv has time to load
  const signingKey = process.env.RP_SIGNING_KEY;
  if (!signingKey) {
    throw new Error('❌ [Agent] RP_SIGNING_KEY is missing in environment variables!');
  }
  
  // Deterministic Private Key generated from signingKey + nullifierHash
  const seedString = `${signingKey}:${nullifierHash}`;
  const privateKey = ethers.keccak256(ethers.toUtf8Bytes(seedString));
  const wallet = new ethers.Wallet(privateKey, provider);

  const now = Date.now();
  const expiresAt = now + durationHours * 3600 * 1000;

  const session: AgentSession = {
    nullifierHash,
    agentAddress: wallet.address,
    createdAt: now,
    expiresAt: expiresAt,
    durationHours,
  };

  activeAgentSessions.set(nullifierHash, session);
  return session;
}

/**
 * Validates if an Agent Session is currently active and unexpired
 */
export function validateAgentSession(nullifierHash: string): { isValid: boolean; session?: AgentSession; error?: string } {
  const session = activeAgentSessions.get(nullifierHash);
  if (!session) {
    return { isValid: false, error: 'No active agent session found. Please verify with World ID.' };
  }

  if (Date.now() > session.expiresAt) {
    return { isValid: false, session, error: 'Agent Session Key has expired (24h protection limit reached). Please renew.' };
  }

  return { isValid: true, session };
}

/**
 * Renews an Agent Session for another 24 hours
 */
export function renewAgentSession(nullifierHash: string, durationHours = 24): AgentSession {
  return getOrCreateRealAgentWallet(nullifierHash, durationHours);
}

/**
 * Reconstructs and returns the actual ethers.Wallet object for the Agent Session
 * This is used to sign and send transactions on behalf of the user.
 */
export function getAgentWallet(nullifierHash: string): ethers.Wallet {
  // ESM Fix: Access env vars inside the function at runtime
  const signingKey = process.env.RP_SIGNING_KEY;
  if (!signingKey) {
    throw new Error('❌ [Agent] RP_SIGNING_KEY is missing in environment variables!');
  }

  // Deterministic Private Key generated from signingKey + nullifierHash
  const seedString = `${signingKey}:${nullifierHash}`;
  const privateKey = ethers.keccak256(ethers.toUtf8Bytes(seedString));
  return new ethers.Wallet(privateKey, provider);
}
