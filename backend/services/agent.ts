import { ethers } from 'ethers';

// Base Sepolia RPC Provider
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
export const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);

const RP_SIGNING_KEY = process.env.RP_SIGNING_KEY || 'sk_staging_dummy_key';

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
 * Generates a REAL EVM Base Sepolia Wallet deterministically bound to the user's World ID Nullifier
 */
export function getOrCreateRealAgentWallet(nullifierHash: string, durationHours = 24): AgentSession {
  // Deterministic Private Key generated from RP_SIGNING_KEY + nullifierHash
  const seedString = `${RP_SIGNING_KEY}:${nullifierHash}`;
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
  // Deterministic Private Key generated from RP_SIGNING_KEY + nullifierHash
  const seedString = `${RP_SIGNING_KEY}:${nullifierHash}`;
  const privateKey = ethers.keccak256(ethers.toUtf8Bytes(seedString));
  return new ethers.Wallet(privateKey, provider);
}
