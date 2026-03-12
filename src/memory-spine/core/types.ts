/**
 * Unified Memory Spine - Core Types and Interfaces
 * Phase 1: Foundation
 */

// Layer 1: Identity & Rules
export interface IdentityConfig {
  name: string;
  role: string;
  description: string;
  constraints: string[];
  preferences: Record<string, any>;
}

// Layer 2: Long-term Facts
export interface Fact {
  id: string;
  category: string;
  content: string;
  source: string;
  timestamp: Date;
  confidence: number; // 0-1
}

// Layer 3: Project State
export interface ProjectState {
  projectId: string;
  name: string;
  currentGoal: string;
  completed: string[];
  pending: string[];
  decisions: Decision[];
  blockers: string[];
}

export interface Decision {
  id: string;
  description: string;
  rationale: string;
  timestamp: Date;
  reversible: boolean;
}

// Layer 4: Session Snapshot
export interface SessionSnapshot {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  summary: string;
  newFacts: Fact[];
  decisions: Decision[];
  unfinished: string[];
  writebackRequired: boolean;
}

// Cache Interfaces
export interface CacheEntry<T> {
  key: string;
  value: T;
  category: string;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
}

export interface CacheManager<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Credential Interfaces
export interface Credential {
  service: string;
  key: string;
  value: string;
  encrypted: boolean;
  lastRotated: Date;
  metadata: Record<string, any>;
}

// Performance Metrics
export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  avgLatency: number;
  memoryUsage: number;
}