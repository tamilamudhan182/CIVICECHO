export interface User {
  id: string;
  name: string;
  aadhaarLast4: string;
  locality: string;
  district: string;
  state: string;
  points: number;
  avatarInitials: string;
  issuesReported: number;
  issuesResolved: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'health' | 'safety' | 'sanitation' | 'water' | 'electricity';
  status: 'pending' | 'in_progress' | 'resolved';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  sentimentScore: number;
  location: string;
  locality: string;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  clusterCount: number;
  priorityScore: number;
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  date: string;
  partner?: string;
}

export interface RedemptionPartner {
  id: string;
  name: string;
  category: string;
  pointsCost: number;
  description: string;
  icon: string;
}

export const currentUser: User = {
  id: '',
  name: '',
  aadhaarLast4: '',
  locality: '',
  district: '',
  state: '',
  points: 0,
  avatarInitials: '',
  issuesReported: 0,
  issuesResolved: 0,
};

export const mockIssues: Issue[] = [];

export const mockTransactions: Transaction[] = [];

export const redemptionPartners: RedemptionPartner[] = [];

export const leaderboard: { rank: number; name: string; locality: string; points: number; issues: number }[] = [];
