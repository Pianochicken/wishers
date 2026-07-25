import { WishIntent } from '../routes/ai.js';

export interface ActiveWish extends WishIntent {
  id: string;
  nullifierHash: string; // The human who authorized this wish
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  txHash?: string;
  createdAt: number;
}

// In-memory store for active wishes (for hackathon demo)
const activeWishes = new Map<string, ActiveWish>();

export function addWish(wish: Omit<ActiveWish, 'id' | 'status' | 'createdAt'>): ActiveWish {
  const id = `wish_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newWish: ActiveWish = {
    ...wish,
    id,
    status: 'PENDING',
    createdAt: Date.now(),
  };
  
  activeWishes.set(id, newWish);
  console.log(`[Wishes] Added new wish ${id} for human ${wish.nullifierHash.substring(0, 8)}...`);
  return newWish;
}

export function getPendingWishes(): ActiveWish[] {
  return Array.from(activeWishes.values()).filter((w) => w.status === 'PENDING');
}

export function getAllWishesForHuman(nullifierHash: string): ActiveWish[] {
  return Array.from(activeWishes.values()).filter((w) => w.nullifierHash === nullifierHash);
}

export function updateWishStatus(id: string, status: 'EXECUTED' | 'FAILED', txHash?: string): boolean {
  const wish = activeWishes.get(id);
  if (wish) {
    wish.status = status;
    if (txHash) wish.txHash = txHash;
    console.log(`[Wishes] Wish ${id} status updated to ${status}`);
    return true;
  }
  return false;
}
