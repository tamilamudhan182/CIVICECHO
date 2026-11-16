import { apiService } from './api';

export interface CitizenAccount {
  id: string;
  name: string;
  email: string;
  aadhaar: string; // 12 digits
  otp: string;     // Unique OTP for this Aadhaar
  locality: string;
  district: string;
  state: string;
  points: number;
}

const STORAGE_KEY = 'civic_citizen_credentials';

const INITIAL_DEFAULT_ACCOUNTS: CitizenAccount[] = [
  {
    id: 'user-001',
    name: 'TAMILAMUDHAN',
    email: 'tamilamudhan@civicecho.org',
    aadhaar: '123456789012',
    otp: '123456',
    locality: 'Koramangala',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    points: 0,
  },
  {
    id: 'user-002',
    name: 'Ananya Rao',
    email: 'ananya@civicecho.org',
    aadhaar: '987654321098',
    otp: '654321',
    locality: 'Indiranagar',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    points: 0,
  },
];

export const authService = {
  getAccounts(): CitizenAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_ACCOUNTS));
        return INITIAL_DEFAULT_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to parse citizen accounts from localStorage:', err);
      return INITIAL_DEFAULT_ACCOUNTS;
    }
  },

  saveAccounts(accounts: CitizenAccount[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  },

  addAccount(account: Omit<CitizenAccount, 'id'>): CitizenAccount {
    const accounts = this.getAccounts();
    const cleanAadhaar = account.aadhaar.replace(/\D/g, '');
    
    // Check if Aadhaar already exists
    const existingIndex = accounts.findIndex(a => a.aadhaar.replace(/\D/g, '') === cleanAadhaar);
    const newAccount: CitizenAccount = {
      ...account,
      id: `usr-${Date.now()}`,
      aadhaar: cleanAadhaar,
      otp: account.otp.replace(/\D/g, '').slice(0, 6),
      points: account.points ?? 0,
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = newAccount;
    } else {
      accounts.push(newAccount);
    }

    this.saveAccounts(accounts);

    // Sync to backend database
    apiService.createUser({
      name: newAccount.name,
      email: newAccount.email,
      aadhaar: newAccount.aadhaar,
      otp: newAccount.otp,
      aadhaarLast4: newAccount.aadhaar.slice(-4),
      locality: newAccount.locality,
      district: newAccount.district,
      state: newAccount.state,
      points: newAccount.points ?? 0,
      avatarInitials: newAccount.name
        .split(' ')
        .map(p => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    }).catch(e => console.warn('Failed to sync added user to DB:', e));

    return newAccount;
  },

  deleteAccount(id: string): void {
    const accounts = this.getAccounts().filter(a => a.id !== id);
    this.saveAccounts(accounts);
  },

  findAccountByAadhaar(aadhaar: string): CitizenAccount | undefined {
    const clean = aadhaar.replace(/\D/g, '');
    return this.getAccounts().find(a => a.aadhaar.replace(/\D/g, '') === clean);
  },

  async lookupAccount(aadhaar: string): Promise<CitizenAccount | undefined> {
    const clean = aadhaar.replace(/\D/g, '');
    try {
      const dbUser = await apiService.getUserByAadhaar(clean);
      if (dbUser) {
        const mapped: CitizenAccount = {
          id: String(dbUser.id || `usr-${Date.now()}`),
          name: dbUser.name || 'Citizen User',
          email: dbUser.email || 'citizen@civicecho.org',
          aadhaar: dbUser.aadhaar || clean,
          otp: dbUser.otp || '123456',
          locality: dbUser.locality || 'Koramangala',
          district: dbUser.district || 'Bengaluru Urban',
          state: dbUser.state || 'Karnataka',
          points: dbUser.points ?? 0,
        };
        // update local list cache
        const accounts = this.getAccounts();
        const idx = accounts.findIndex(a => a.aadhaar.replace(/\D/g, '') === clean);
        if (idx >= 0) {
          accounts[idx] = { ...accounts[idx], ...mapped };
        } else {
          accounts.push(mapped);
        }
        this.saveAccounts(accounts);
        return mapped;
      }
    } catch (e) {
      console.warn('Backend lookup failed, falling back to local storage:', e);
    }
    return this.findAccountByAadhaar(clean);
  },

  async verifyAndLogin(aadhaar: string, otp: string): Promise<{ success: boolean; account?: CitizenAccount; error?: string }> {
    const cleanAadhaar = aadhaar.replace(/\D/g, '');
    const cleanOtp = otp.replace(/\D/g, '');

    // Check directly against backend database first for live presentation
    let matchedAccount: CitizenAccount | undefined;
    try {
      const dbUser = await apiService.getUserByAadhaar(cleanAadhaar);
      if (dbUser) {
        matchedAccount = {
          id: String(dbUser.id || 'usr-db'),
          name: dbUser.name,
          email: dbUser.email,
          aadhaar: dbUser.aadhaar || cleanAadhaar,
          otp: dbUser.otp || '',
          locality: dbUser.locality || 'Koramangala',
          district: dbUser.district || 'Bengaluru Urban',
          state: dbUser.state || 'Karnataka',
          points: dbUser.points ?? 0,
        };
      }
    } catch (err) {
      console.warn('Backend user lookup failed, falling back to local credentials:', err);
    }

    if (!matchedAccount) {
      matchedAccount = this.findAccountByAadhaar(cleanAadhaar);
    }

    if (!matchedAccount) {
      return {
        success: false,
        error: `Aadhaar number '${cleanAadhaar}' is not registered in the database. Please check H2 Console or add credentials below.`,
      };
    }

    if (matchedAccount.otp && matchedAccount.otp !== cleanOtp) {
      return {
        success: false,
        error: `Incorrect OTP! Live Database requires OTP '${matchedAccount.otp}' for Aadhaar ending in ${cleanAadhaar.slice(-4)}.`,
      };
    }

    // Set active session in localStorage
    localStorage.setItem('userRole', 'citizen');
    localStorage.setItem('userId', matchedAccount.id);
    localStorage.setItem('userName', matchedAccount.name);
    localStorage.setItem('userEmail', matchedAccount.email);
    localStorage.setItem('userAadhaar', matchedAccount.aadhaar);
    localStorage.setItem('userAadhaarLast4', matchedAccount.aadhaar.slice(-4));
    localStorage.setItem('userLocality', matchedAccount.locality);
    localStorage.setItem('userDistrict', matchedAccount.district);
    localStorage.setItem('userState', matchedAccount.state);
    localStorage.setItem('userPoints', String(matchedAccount.points || 0));

    // Register or sync user in Spring Boot DB
    try {
      await apiService.createUser({
        name: matchedAccount.name,
        email: matchedAccount.email,
        aadhaar: matchedAccount.aadhaar,
        otp: matchedAccount.otp,
        aadhaarLast4: matchedAccount.aadhaar.slice(-4),
        locality: matchedAccount.locality,
        district: matchedAccount.district,
        state: matchedAccount.state,
        points: matchedAccount.points || 0,
        avatarInitials: matchedAccount.name
          .split(' ')
          .map(p => p[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      });
    } catch (e) {
      console.warn('Could not sync user to Spring Boot backend:', e);
    }

    return { success: true, account: matchedAccount };
  },

  getCurrentSession() {
    return {
      role: localStorage.getItem('userRole'),
      name: localStorage.getItem('userName') || 'Citizen',
      email: localStorage.getItem('userEmail') || 'citizen@civicecho.org',
      aadhaar: localStorage.getItem('userAadhaar') || '',
      aadhaarLast4: localStorage.getItem('userAadhaarLast4') || '0000',
      locality: localStorage.getItem('userLocality') || 'Koramangala',
      district: localStorage.getItem('userDistrict') || 'Bengaluru Urban',
      state: localStorage.getItem('userState') || 'Karnataka',
      points: Number(localStorage.getItem('userPoints') || '0'),
    };
  },

  logout(): void {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAadhaar');
    localStorage.removeItem('userAadhaarLast4');
    localStorage.removeItem('userLocality');
    localStorage.removeItem('userDistrict');
    localStorage.removeItem('userState');
    localStorage.removeItem('userPoints');
  }
};

