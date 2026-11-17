const API_BASE_URL = 'http://localhost:8080/api';

export interface CivicIssueDTO {
  id?: number;
  title: string;
  description: string;
  category: string;
  department?: string;
  assignedAuthority?: string;
  status?: string;
  urgency?: string;
  sentimentScore?: number;
  location: string;
  locality: string;
  reportedBy: string;
  reportedAt?: string;
  resolvedAt?: string;
  clusterCount?: number;
  priorityScore?: number;
  imageUrl?: string;
}

export interface RedeemedVoucherDTO {
  id?: number;
  voucherCode: string;
  partnerId: string;
  name: string;
  partnerBrand: string;
  category: string;
  icon: string;
  discountValue: string;
  pointsSpent: number;
  redeemedDate: string;
  expiryDate: string;
  validityDays: number;
  rules?: string;
  howItWorks?: string;
  userEmail: string;
  userAadhaar?: string;
}

export interface UserDTO {
  id?: number;
  name: string;
  email: string;
  aadhaar?: string;
  otp?: string;
  aadhaarLast4: string;
  locality: string;
  district: string;
  state: string;
  points: number;
  avatarInitials: string;
  issuesReported: number;
  issuesResolved: number;
}

const fallbackIssues: CivicIssueDTO[] = [
  {
    id: 1,
    title: 'Stagnant Mosquito Water Pool Near Primary Health Center',
    description: 'Stagnant rainwater accumulation causing severe mosquito breeding & dengue hazard.',
    category: 'health',
    status: 'PENDING',
    urgency: 'CRITICAL',
    sentimentScore: -0.9,
    location: '12th Main, Koramangala',
    locality: 'Koramangala',
    reportedBy: 'citizen@civicecho.org',
    clusterCount: 6,
    priorityScore: 99.0
  },
  {
    id: 2,
    title: 'Missing Pedestrian Guard Rail at High Traffic Junction',
    description: 'Guard rail damaged in recent accident, creating severe hazard for school children crossing.',
    category: 'safety',
    status: 'PENDING',
    urgency: 'HIGH',
    sentimentScore: -0.75,
    location: 'Outer Ring Road Junction',
    locality: 'HSR Layout',
    reportedBy: 'citizen@civicecho.org',
    clusterCount: 5,
    priorityScore: 62.5
  },
  {
    id: 3,
    title: 'Garbage Overflow & Uncollected Waste',
    description: 'Municipal bins overflowing with household waste for 3 days. Severe stench and health risk.',
    category: 'sanitation',
    status: 'PENDING',
    urgency: 'HIGH',
    sentimentScore: -0.7,
    location: 'Sector 3 Park, HSR Layout',
    locality: 'HSR Layout',
    reportedBy: 'citizen@civicecho.org',
    clusterCount: 4,
    priorityScore: 57.0
  },
  {
    id: 4,
    title: 'Main Water Pipe Burst & Drinking Water Leakage',
    description: 'Clean drinking water pipe burst causing water logging and low pressure in residential units.',
    category: 'water',
    status: 'PENDING',
    urgency: 'CRITICAL',
    sentimentScore: -0.8,
    location: '100ft Road, Indiranagar',
    locality: 'Indiranagar',
    reportedBy: 'citizen@civicecho.org',
    clusterCount: 7,
    priorityScore: 83.0
  },
  {
    id: 5,
    title: 'Flickering Streetlight & Exposed Electrical Wiring',
    description: 'Streetlight pole off for 3 nights with exposed electrical wires near bus stop.',
    category: 'electricity',
    status: 'PENDING',
    urgency: 'HIGH',
    sentimentScore: -0.65,
    location: 'Indiranagar 100ft Road',
    locality: 'Indiranagar',
    reportedBy: 'citizen@civicecho.org',
    clusterCount: 4,
    priorityScore: 56.5
  },
  {
    id: 6,
    title: 'Hazardous Pothole on 80ft Road',
    description: 'Deep pothole near the school zone causing severe traffic slowdown and potential vehicle damage.',
    category: 'infrastructure',
    status: 'PENDING',
    urgency: 'CRITICAL',
    sentimentScore: -0.85,
    location: '80 Feet Road, Koramangala',
    locality: 'Koramangala',
    reportedBy: 'citizen@civicecho.org',
    clusterCount: 8,
    priorityScore: 88.5
  }
];

const fallbackUsers: UserDTO[] = [];

export const apiService = {
  async getIssues(): Promise<CivicIssueDTO[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/issues`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.length > 0 ? data : fallbackIssues;
    } catch (err) {
      console.warn('Backend offline, using fallback issues data:', err);
      return fallbackIssues;
    }
  },

  async getIssueById(id: number): Promise<CivicIssueDTO | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/issues/${id}`);
      if (!res.ok) return fallbackIssues.find(i => i.id === id) || null;
      return await res.json();
    } catch (err) {
      return fallbackIssues.find(i => i.id === id) || null;
    }
  },

  async createIssue(issue: Partial<CivicIssueDTO>): Promise<CivicIssueDTO> {
    try {
      const res = await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue),
      });
      if (!res.ok) throw new Error('Failed to create issue on Spring Boot API');
      return await res.json();
    } catch (err) {
      const newIssue: CivicIssueDTO = {
        id: Date.now(),
        title: issue.title || 'New Civic Issue',
        description: issue.description || '',
        category: issue.category || 'infrastructure',
        status: 'PENDING',
        urgency: issue.urgency || 'MEDIUM',
        sentimentScore: issue.sentimentScore || -0.6,
        location: issue.location || 'Koramangala, Bengaluru',
        locality: issue.locality || 'Koramangala',
        reportedBy: issue.reportedBy || localStorage.getItem('userEmail') || 'citizen@civicecho.org',
        clusterCount: 1,
        priorityScore: 25.0,
      };
      fallbackIssues.unshift(newIssue);
      return newIssue;
    }
  },

  async updateIssueStatus(id: number, status: string): Promise<CivicIssueDTO> {
    try {
      const res = await fetch(`${API_BASE_URL}/issues/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update issue status on Spring Boot API');
      return await res.json();
    } catch (err) {
      const target = fallbackIssues.find(i => i.id === id);
      if (target) {
        target.status = status.toUpperCase();
        if (status === 'RESOLVED') target.resolvedAt = new Date().toISOString();
        return target;
      }
      throw err;
    }
  },

  async upvoteIssue(id: number, voterEmail?: string, voterAadhaar?: string): Promise<CivicIssueDTO> {
    try {
      const email = voterEmail || localStorage.getItem('userEmail') || 'citizen@civicecho.org';
      const aadhaar = voterAadhaar || localStorage.getItem('userAadhaar') || '';
      const res = await fetch(`${API_BASE_URL}/issues/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, voterEmail: email, aadhaar }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upvote issue on Spring Boot API');
      }
      return await res.json();
    } catch (err: any) {
      if (err.message && err.message.includes('already voted')) {
        throw err;
      }
      const target = fallbackIssues.find(i => i.id === id);
      if (target) {
        target.clusterCount = (target.clusterCount || 1) + 1;
        target.priorityScore = (target.priorityScore || 20) + 5;
        return target;
      }
      throw err;
    }
  },

  async getVotedIssueIds(email: string): Promise<number[]> {
    try {
      const cleanEmail = email || localStorage.getItem('userEmail') || '';
      if (!cleanEmail) return [];
      const res = await fetch(`${API_BASE_URL}/issues/voted?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Could not fetch voted issues from DB:', err);
    }
    return [];
  },

  async getRedeemedVouchers(email?: string): Promise<RedeemedVoucherDTO[]> {
    try {
      const cleanEmail = email || localStorage.getItem('userEmail') || '';
      const res = await fetch(`${API_BASE_URL}/vouchers?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Could not fetch vouchers from DB:', err);
    }
    return [];
  },

  async redeemVoucher(voucher: Partial<RedeemedVoucherDTO>): Promise<RedeemedVoucherDTO> {
    try {
      const res = await fetch(`${API_BASE_URL}/vouchers/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucher),
      });
      if (res.ok) {
        return await res.json();
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to redeem voucher on Spring Boot');
    } catch (err) {
      console.warn('Error redeeming voucher on backend:', err);
      throw err;
    }
  },

  async getUsers(): Promise<UserDTO[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return data;
      }
    } catch (err) {
      // Backend offline or error
    }
    return fallbackUsers;
  },

  async getUserByEmail(email: string): Promise<UserDTO | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
      if (!res.ok) return fallbackUsers.find(u => u.email === email) || null;
      return await res.json();
    } catch (err) {
      return fallbackUsers.find(u => u.email === email) || null;
    }
  },

  async getUserByAadhaar(aadhaar: string): Promise<UserDTO | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/aadhaar/${encodeURIComponent(aadhaar.trim())}`);
      if (!res.ok) return fallbackUsers.find(u => u.aadhaar === aadhaar.trim()) || null;
      return await res.json();
    } catch (err) {
      return fallbackUsers.find(u => u.aadhaar === aadhaar.trim()) || null;
    }
  },

  async createUser(user: Partial<UserDTO>): Promise<UserDTO> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend offline or failed to persist user:', err);
    }
    const created: UserDTO = {
      id: Date.now(),
      name: user.name || 'Citizen User',
      email: user.email || 'citizen@civicecho.org',
      aadhaarLast4: user.aadhaarLast4 || '0000',
      locality: user.locality || 'Koramangala',
      district: user.district || 'Bengaluru Urban',
      state: user.state || 'Karnataka',
      points: user.points ?? 0,
      avatarInitials: user.avatarInitials || (user.name ? user.name.slice(0, 2).toUpperCase() : 'CU'),
      issuesReported: user.issuesReported ?? 0,
      issuesResolved: user.issuesResolved ?? 0,
    };
    const existingIndex = fallbackUsers.findIndex(u => u.email === created.email);
    if (existingIndex >= 0) {
      fallbackUsers[existingIndex] = { ...fallbackUsers[existingIndex], ...created };
    } else {
      fallbackUsers.push(created);
    }
    return created;
  }
};
