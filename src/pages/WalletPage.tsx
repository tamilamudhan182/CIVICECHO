import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Gift, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Clock, 
  Calendar, 
  Copy, 
  Check, 
  Info, 
  Ticket, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import AppLayout from '@/components/AppLayout';
import { apiService, CivicIssueDTO, UserDTO } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  date: string;
}

export interface RedemptionPartner {
  id: string;
  name: string;
  partnerBrand: string;
  category: string;
  pointsCost: number;
  discountValue: string;
  description: string;
  icon: string;
  validityDays: number;
  rules: string[];
  howItWorks: string[];
}

export interface RedeemedVoucher {
  id: string;
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
  rules: string[];
  howItWorks: string[];
}

const redemptionPartners: RedemptionPartner[] = [
  {
    id: 'partner-1',
    name: 'Bengaluru Metro Pass Credit',
    partnerBrand: 'BMRCL / Namma Metro',
    category: 'Public Transit',
    pointsCost: 100,
    discountValue: '₹50 Metro Recharge Credit',
    description: 'Instant ₹50 deduction on Namma Metro Smart Card or QR transit passes',
    icon: '🚇',
    validityDays: 30,
    rules: [
      'Valid for 30 days from the date of redemption.',
      'Applicable on Namma Metro Smart Card top-ups and mobile QR tickets.',
      'Single-use voucher code; non-transferable to cash or bank account.',
      'Minimum top-up amount of ₹100 required at recharge gateway.',
      'Valid on Purple and Green Line stations across Bengaluru.'
    ],
    howItWorks: [
      'Open the official Namma Metro App or visit any Metro Station Customer Care desk.',
      'Select "Smart Card Top-up" or "Buy QR Ticket" and enter your travel details.',
      'Paste or present your unique CivicEcho Voucher Code at checkout.',
      '₹50 discount will be deducted automatically from your recharge total.'
    ]
  },
  {
    id: 'partner-2',
    name: 'BBMP Property Tax Rebate',
    partnerBrand: 'BBMP Municipal Revenue Dept',
    category: 'Civic Tax',
    pointsCost: 250,
    discountValue: '5% Instant Tax Rebate (up to ₹500)',
    description: '5% instant rebate on annual municipal property tax under Self-Assessment Scheme',
    icon: '🏛️',
    validityDays: 60,
    rules: [
      'Valid for 60 days from redemption date.',
      'Applicable on official BBMP Property Tax Portal (bbmp.gov.in) for residential zones.',
      'Aadhaar of the registered user must match the municipal assessment record.',
      'Can only be applied once per property assessment PID per financial cycle.',
      'Cannot be clubbed with other state government relief exemptions.'
    ],
    howItWorks: [
      'Navigate to the official BBMP Property Tax Portal (bbmp.gov.in).',
      'Enter your 10-digit Property Identification Number (PID).',
      'On the final payment calculation screen, enter this CivicEcho Rebate Code.',
      '5% deduction (up to ₹500) will be adjusted directly against your net payable tax.'
    ]
  },
  {
    id: 'partner-3',
    name: 'BESCOM Utility Bill Voucher',
    partnerBrand: 'BESCOM Bengaluru Electricity Board',
    category: 'Electricity',
    pointsCost: 150,
    discountValue: '₹100 Electricity Bill Deduction',
    description: '₹100 direct bill credit on residential electricity consumption bills',
    icon: '⚡',
    validityDays: 45,
    rules: [
      'Valid for 45 days from redemption date.',
      'Applicable on residential LT-2 domestic connections in Bengaluru urban/rural circles.',
      'One voucher redemption per billing cycle per Consumer Account ID.',
      'Non-refundable; unutilized credit does not roll over to subsequent months.',
      'Valid for online payments via BESCOM Mithra App or official portal.'
    ],
    howItWorks: [
      'Open the BESCOM Mithra App or visit bescom.karnataka.gov.in.',
      'Select "Pay Electricity Bill" and enter your 10-digit Consumer Account ID.',
      'In the "Promo / Civic Discount Voucher" field, apply your voucher code.',
      'Your electricity bill amount will be reduced by ₹100 instantly.'
    ]
  },
  {
    id: 'partner-4',
    name: 'Civic Champion Organic Grocery Pass',
    partnerBrand: 'HOPCOMS & Bengaluru Organic Board',
    category: 'Green Retail',
    pointsCost: 50,
    discountValue: '₹50 Fresh Organic Produce Voucher',
    description: '₹50 voucher on fresh fruits, vegetables, and pulses at certified green markets',
    icon: '🛒',
    validityDays: 30,
    rules: [
      'Valid for 30 days from redemption date.',
      'Redeemable at any HOPCOMS outlet or affiliated Bengaluru weekend organic farmers markets.',
      'Applicable on total minimum purchase of ₹200 on fresh fruits and vegetables.',
      'Present the digital voucher code and barcode to the cashier prior to final bill generation.',
      'Cannot be exchanged for cash or store credit.'
    ],
    howItWorks: [
      'Visit any HOPCOMS outlet or partnering organic farmers market in Bengaluru.',
      'Select your farm-fresh produce and proceed to the checkout counter.',
      'Display this digital voucher code to the cashier.',
      'The cashier enters the verification code and deducts ₹50 from your bill total.'
    ]
  },
];

const WalletPage = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [issues, setIssues] = useState<CivicIssueDTO[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redeemedVouchers, setRedeemedVouchers] = useState<RedeemedVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Voucher Details
  const [selectedVoucher, setSelectedVoucher] = useState<RedeemedVoucher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active View Tab: 'redeem' | 'myVouchers'
  const [activeTab, setActiveTab] = useState<'redeem' | 'myVouchers'>('redeem');

  const getStorageKey = () => {
    const email = localStorage.getItem('userEmail') || 'citizen@civicecho.org';
    return `civic_redeemed_vouchers_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedIssues] = await Promise.all([
        apiService.getUsers(),
        apiService.getIssues(),
      ]);

      setIssues(fetchedIssues);

      const activeEmail = localStorage.getItem('userEmail');
      const currentUserProfile = (activeEmail ? fetchedUsers.find(u => u.email === activeEmail) : null) || fetchedUsers[0] || {
        id: 1,
        name: localStorage.getItem('userName') || 'Citizen',
        email: activeEmail || 'citizen@civicecho.org',
        aadhaarLast4: localStorage.getItem('userAadhaarLast4') || '0000',
        locality: localStorage.getItem('userLocality') || 'Koramangala',
        district: localStorage.getItem('userDistrict') || 'Bengaluru Urban',
        state: 'Karnataka',
        points: 0,
        avatarInitials: (localStorage.getItem('userName') || 'CU').slice(0, 2).toUpperCase(),
        issuesReported: 0,
        issuesResolved: 0,
      };

      if (currentUserProfile) {
        setUser(currentUserProfile);

        // Load saved redeemed vouchers for this citizen
        let savedVouchers: RedeemedVoucher[] = [];
        try {
          const savedVouchersRaw = localStorage.getItem(getStorageKey());
          if (savedVouchersRaw) {
            savedVouchers = JSON.parse(savedVouchersRaw);
            setRedeemedVouchers(savedVouchers);
          }
        } catch (e) {
          console.warn('Error loading redeemed vouchers from localStorage:', e);
        }

        // Filter issues reported specifically by this logged-in citizen
        const myReportedIssues = fetchedIssues.filter(i => 
          activeEmail && i.reportedBy?.trim().toLowerCase() === activeEmail.trim().toLowerCase()
        );
        const myResolvedIssues = myReportedIssues.filter(i => i.status === 'RESOLVED');

        // Points Rule: If a citizen has no reported cases, points are strictly 0!
        const earnedFromReporting = myReportedIssues.length * 50;
        const earnedFromResolving = myResolvedIssues.length * 100;
        const totalEarned = earnedFromReporting + earnedFromResolving;
        const totalSpent = savedVouchers.reduce((acc, v) => acc + (v.pointsSpent || 0), 0);

        const currentLivePoints = myReportedIssues.length === 0 ? 0 : Math.max(0, totalEarned - totalSpent);
        setPoints(currentLivePoints);
        localStorage.setItem('userPoints', String(currentLivePoints));

        // Build live dynamic transactions list strictly from actual cases
        const txList: Transaction[] = [];

        // Add redeemed transactions
        savedVouchers.forEach((v) => {
          txList.push({
            id: `tx-red-${v.id}`,
            type: 'redeemed',
            amount: v.pointsSpent,
            description: `Redeemed: ${v.discountValue} (${v.partnerBrand})`,
            date: v.redeemedDate,
          });
        });

        // Add earned transactions from resolved issues (+100 pts)
        myResolvedIssues.forEach((issue) => {
          txList.push({
            id: `tx-res-${issue.id}`,
            type: 'earned',
            amount: 100,
            description: `Awarded for Resolved Issue: "${issue.title}" (Spring Boot Business Rule 2)`,
            date: issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : 'Recently',
          });
        });

        // Add earned transactions for reporting issues (+50 pts)
        myReportedIssues.forEach((issue) => {
          txList.push({
            id: `tx-rep-${issue.id}`,
            type: 'earned',
            amount: 50,
            description: `Reported Complaint: "${issue.title}" (+50 pts)`,
            date: issue.reportedAt ? new Date(issue.reportedAt).toLocaleDateString() : 'Recently',
          });
        });

        setTransactions(txList);
      }
    } catch (err) {
      console.error('Failed to load wallet data from Spring Boot API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleRedeem = (partner: RedemptionPartner) => {
    if (points < partner.pointsCost) {
      toast({
        title: 'Insufficient Points',
        description: `You have ${points} pts, but need ${partner.pointsCost} pts to redeem ${partner.name}. Report more civic issues to earn points!`,
        variant: 'destructive',
      });
      return;
    }

    const newBalance = points - partner.pointsCost;
    setPoints(newBalance);
    localStorage.setItem('userPoints', String(newBalance));
    if (user) {
      user.points = newBalance;
    }

    // Generate Unique Voucher Code
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefixMap: Record<string, string> = {
      'partner-1': 'METRO-CE',
      'partner-2': 'BBMP-TAX',
      'partner-3': 'BESCOM-POW',
      'partner-4': 'HOPCOMS-ORG',
    };
    const prefix = prefixMap[partner.id] || 'CIVIC-VOUCH';
    const code = `${prefix}-${randomSuffix}`;

    // Calculate Expiry Date
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + partner.validityDays);
    const formattedExpiry = expiry.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newVoucher: RedeemedVoucher = {
      id: `vouch-${Date.now()}`,
      voucherCode: code,
      partnerId: partner.id,
      name: partner.name,
      partnerBrand: partner.partnerBrand,
      category: partner.category,
      icon: partner.icon,
      discountValue: partner.discountValue,
      pointsSpent: partner.pointsCost,
      redeemedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      expiryDate: formattedExpiry,
      validityDays: partner.validityDays,
      rules: partner.rules,
      howItWorks: partner.howItWorks,
    };

    const updatedVouchers = [newVoucher, ...redeemedVouchers];
    setRedeemedVouchers(updatedVouchers);
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedVouchers));

    // Add to transaction log
    const newTx: Transaction = {
      id: `tx-red-${Date.now()}`,
      type: 'redeemed',
      amount: partner.pointsCost,
      description: `Redeemed: ${partner.discountValue} (${partner.partnerBrand})`,
      date: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Open Voucher Details Modal immediately so citizen gets full rules, expiry, & instructions
    setSelectedVoucher(newVoucher);
    setIsModalOpen(true);

    toast({
      title: '🎉 Voucher Redeemed Successfully!',
      description: `Voucher Code: ${code} generated! Review expiry date and instructions.`,
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: '📋 Code Copied to Clipboard',
      description: `Voucher code '${code}' is ready to use!`,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const openVoucherDetails = (voucher: RedeemedVoucher) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const activeEmail = localStorage.getItem('userEmail');
  const myReportedIssues = issues.filter(i => 
    activeEmail && i.reportedBy?.trim().toLowerCase() === activeEmail.trim().toLowerCase()
  );
  const myResolvedCount = myReportedIssues.filter(i => i.status === 'RESOLVED').length;
  const myReportedCount = myReportedIssues.length;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Wallet className="w-6 h-6 text-primary" /> Civic Reward Wallet & Vouchers
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Points earned directly from your reported (+50 pts) and resolved (+100 pts) civic issues
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadWalletData}>
            Refresh Balance
          </Button>
        </motion.div>

        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="gradient-hero text-primary-foreground border-0 shadow-elevated relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center">
              <Award className="w-48 h-48 text-white" />
            </div>

            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-accent" />
                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-primary-foreground/90 uppercase">
                    Available Civic Balance
                  </span>
                </div>
                <Badge className="bg-accent text-accent-foreground font-bold px-3 py-1">
                  Verified Citizen Champion
                </Badge>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extrabold tracking-tight">{points.toLocaleString()}</span>
                <span className="text-lg font-medium text-accent">PTS</span>
              </div>

              <div className="mt-6 pt-4 border-t border-primary-foreground/20 flex flex-wrap items-center gap-6 text-xs text-primary-foreground/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{myResolvedCount} Resolved Complaints (+100 pts each)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{myReportedCount} Reported Complaints (+50 pts each)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-accent" />
                  <span>{redeemedVouchers.length} Active Vouchers Unlocked</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Voucher Navigation Tabs */}
        <div className="flex bg-secondary p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('redeem')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'redeem'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Gift className="w-4 h-4" /> Redeem Coupons ({redemptionPartners.length})
          </button>
          <button
            onClick={() => setActiveTab('myVouchers')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'myVouchers'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Ticket className="w-4 h-4" /> My Redeemed Vouchers ({redeemedVouchers.length})
          </button>
        </div>

        {/* TAB 1: REDEEM NEW COUPONS */}
        {activeTab === 'redeem' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Redemption Partners Catalog */}
            <Card className="shadow-card border-border lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                      <Gift className="w-5 h-5 text-accent" /> Available Municipal & Green Vouchers
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Click "Redeem" to receive your voucher code, full terms, expiry date, and instructions
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Your Balance: <span className="font-bold text-accent ml-1">{points} pts</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {redemptionPartners.map((partner) => {
                    const canAfford = points >= partner.pointsCost;
                    return (
                      <div 
                        key={partner.id} 
                        className={`p-5 rounded-xl border bg-card flex flex-col justify-between gap-4 transition-all ${
                          canAfford ? 'border-border hover:border-primary/50 hover:shadow-sm' : 'border-border/60 opacity-80'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
                              {partner.icon}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                                {partner.category}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Valid {partner.validityDays} Days
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-bold text-card-foreground">{partner.name}</p>
                            <p className="text-xs text-primary font-semibold mt-0.5">{partner.discountValue}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{partner.description}</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Cost</p>
                            <p className="text-base font-extrabold text-foreground">{partner.pointsCost} pts</p>
                          </div>

                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4"
                            onClick={() => handleRedeem(partner)}
                          >
                            Redeem Voucher
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Live Transaction History */}
            <Card className="shadow-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base text-card-foreground flex items-center justify-between">
                  <span>Recent Points Activity</span>
                  <Badge variant="outline" className="text-xs">{transactions.length} Entries</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground p-6">Loading transaction records...</p>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground p-6">No points activity recorded yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between gap-3 hover:border-primary/30 transition">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'earned' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
                            {tx.type === 'earned' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-card-foreground">{tx.description}</p>
                            <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>

                        <span className={`text-xs font-bold shrink-0 ${tx.type === 'earned' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {tx.type === 'earned' ? '+' : '-'}{tx.amount} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: MY REDEEMED VOUCHERS */}
        {activeTab === 'myVouchers' && (
          <div className="space-y-6">
            <Card className="shadow-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-accent" /> My Active Vouchers & Coupons
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      All vouchers you have redeemed with expiry dates, voucher codes, rules, and usage steps
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {redeemedVouchers.length} Unlocked
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {redeemedVouchers.length === 0 ? (
                  <div className="text-center p-10 border border-dashed rounded-xl space-y-3">
                    <div className="w-12 h-12 rounded-full bg-secondary text-2xl flex items-center justify-center mx-auto">
                      🎟️
                    </div>
                    <p className="text-sm font-semibold text-foreground">No Vouchers Redeemed Yet</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Use your civic points in the "Redeem Coupons" tab to claim metro credits, BBMP tax discounts, and more!
                    </p>
                    <Button size="sm" onClick={() => setActiveTab('redeem')} className="text-xs mt-2">
                      Browse Available Coupons
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {redeemedVouchers.map((voucher) => (
                      <div 
                        key={voucher.id} 
                        className="p-5 rounded-xl border border-primary/20 bg-card/80 flex flex-col justify-between gap-4 shadow-sm hover:border-primary/40 transition"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 text-2xl flex items-center justify-center shrink-0">
                                {voucher.icon}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-card-foreground">{voucher.name}</p>
                                <p className="text-[11px] text-primary font-semibold">{voucher.discountValue}</p>
                              </div>
                            </div>
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]">
                              Active
                            </Badge>
                          </div>

                          {/* Voucher Code Box */}
                          <div className="p-2.5 rounded-lg bg-secondary/80 border border-border flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Voucher Code</p>
                              <p className="text-xs font-mono font-bold tracking-wider text-foreground">{voucher.voucherCode}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 px-2 text-[11px] gap-1"
                              onClick={() => handleCopyCode(voucher.voucherCode)}
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </Button>
                          </div>

                          {/* Expiry Date Info */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1 text-[11px]">
                              <Calendar className="w-3.5 h-3.5 text-accent" /> Valid Till: <span className="font-semibold text-foreground">{voucher.expiryDate}</span>
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium">
                              Spent {voucher.pointsSpent} pts
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary hover:text-primary p-0 h-auto font-medium"
                            onClick={() => openVoucherDetails(voucher)}
                          >
                            <Info className="w-3.5 h-3.5 mr-1" /> View Rules & How It Works →
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* DETAILED VOUCHER RULES & HOW IT WORKS MODAL */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            {selectedVoucher && (
              <>
                <DialogHeader className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-3xl flex items-center justify-center shrink-0">
                      {selectedVoucher.icon}
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-foreground">
                        {selectedVoucher.name}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-primary font-semibold mt-0.5">
                        {selectedVoucher.discountValue} • {selectedVoucher.partnerBrand}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Voucher Promo Code Banner */}
                  <div className="p-4 rounded-xl gradient-hero text-primary-foreground space-y-2 text-center relative overflow-hidden">
                    <p className="text-[11px] uppercase tracking-wider text-primary-foreground/75 font-semibold">
                      Your Exclusive Voucher Code
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl sm:text-2xl font-mono font-extrabold tracking-widest bg-white/10 px-4 py-1.5 rounded-lg border border-white/20">
                        {selectedVoucher.voucherCode}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-10 text-xs gap-1 font-semibold"
                        onClick={() => handleCopyCode(selectedVoucher.voucherCode)}
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-2 text-xs text-accent font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Valid until {selectedVoucher.expiryDate} ({selectedVoucher.validityDays} Days Validity)</span>
                    </div>
                  </div>

                  {/* HOW IT WORKS / STEP BY STEP */}
                  <div className="space-y-2 rounded-xl border border-border p-4 bg-secondary/30">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-accent" /> How It Works (How to Use):
                    </h3>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {selectedVoucher.howItWorks.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-foreground/90 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* RULES & CONDITIONS */}
                  <div className="space-y-2 rounded-xl border border-border p-4 bg-secondary/30">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Voucher Rules & Terms:
                    </h3>
                    <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                      {selectedVoucher.rules.map((rule, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <span className="text-foreground/80">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setIsModalOpen(false);
                      setActiveTab('myVouchers');
                    }}
                  >
                    View in My Vouchers
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs bg-primary text-primary-foreground"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Done
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default WalletPage;
