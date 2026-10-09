const API_BASE_URL = 'http://localhost:8080/api';

export interface CivicIssueDTO {
  id?: number;
  title: string;
  description: string;
  category: string;
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

export interface UserDTO {
  id?: number;
  name: string;
  email: string;
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
    reportedBy: 'aarav@civicecho.org',
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
    reportedBy: 'rohan@civicecho.org',
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
    reportedBy: 'rohan@civicecho.org',
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
    reportedBy: 'priya@civicecho.org',
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
    reportedBy: 'priya@civicecho.org',
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
    reportedBy: 'aarav@civicecho.org',
    clusterCount: 8,
    priorityScore: 88.5
  }
];

const fallbackUsers: UserDTO[] = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@civicecho.org', aadhaarLast4: '4521', locality: 'Koramangala', district: 'Bengaluru Urban', state: 'Karnataka', points: 450, avatarInitials: 'AS', issuesReported: 5, issuesResolved: 4 },
  { id: 2, name: 'Priya Patel', email: 'priya@civicecho.org', aadhaarLast4: '8832', locality: 'Indiranagar', district: 'Bengaluru Urban', state: 'Karnataka', points: 320, avatarInitials: 'PP', issuesReported: 3, issuesResolved: 2 },
  { id: 3, name: 'Rohan Verma', email: 'rohan@civicecho.org', aadhaarLast4: '1290', locality: 'HSR Layout', district: 'Bengaluru Urban', state: 'Karnataka', points: 280, avatarInitials: 'RV', issuesReported: 2, issuesResolved: 1 },
];

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
        reportedBy: issue.reportedBy || 'aarav@civicecho.org',
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

  async upvoteIssue(id: number): Promise<CivicIssueDTO> {
    try {
      const res = await fetch(`${API_BASE_URL}/issues/${id}/upvote`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to upvote issue on Spring Boot API');
      return await res.json();
    } catch (err) {
      const target = fallbackIssues.find(i => i.id === id);
      if (target) {
        target.clusterCount = (target.clusterCount || 1) + 1;
        target.priorityScore = (target.priorityScore || 20) + 5;
        return target;
      }
      throw err;
    }
  },

  async getUsers(): Promise<UserDTO[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.length > 0 ? data : fallbackUsers;
    } catch (err) {
      return fallbackUsers;
    }
  },

  async getUserByEmail(email: string): Promise<UserDTO | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
      if (!res.ok) return fallbackUsers.find(u => u.email === email) || null;
      return await res.json();
    } catch (err) {
      return fallbackUsers.find(u => u.email === email) || null;
    }
  }
};
