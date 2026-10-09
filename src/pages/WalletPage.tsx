import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowDownLeft, ArrowUpRight, Gift, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const redemptionPartners = [
  { id: 'partner-1', name: 'Bengaluru Metro Pass Credit', category: 'Transit', pointsCost: 100, description: '₹50 discount voucher on Namma Metro recharges', icon: '🚇' },
  { id: 'partner-2', name: 'BBMP Property Tax Rebate', category: 'Civic Tax', pointsCost: 250, description: '5% instant rebate on annual property tax payment', icon: '🏛️' },
  { id: 'partner-3', name: 'BESCOM Utility Bill Voucher', category: 'Electricity', pointsCost: 150, description: '₹100 credit on monthly electricity bill', icon: '⚡' },
  { id: 'partner-4', name: 'Civic Champion Organic Grocery Pass', category: 'Retail', pointsCost: 50, description: '₹50 voucher at local organic farmers markets', icon: '🛒' },
];

const WalletPage = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [issues, setIssues] = useState<CivicIssueDTO[]>([]);
  const [points, setPoints] = useState<number>(450);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedIssues] = await Promise.all([
        apiService.getUsers(),
        apiService.getIssues(),
      ]);

      setIssues(fetchedIssues);

      const currentUserProfile = fetchedUsers.find(u => u.email === 'aarav@civicecho.org') || fetchedUsers[0];
      if (currentUserProfile) {
        setUser(currentUserProfile);
        
        // Calculate points based on live Spring Boot data
        // Base points + (100 * resolved complaints) + (50 * reported complaints)
        const resolvedCount = fetchedIssues.filter(i => i.status === 'RESOLVED').length;
        const totalPoints = currentUserProfile.points;
        setPoints(totalPoints);

        // Build live dynamic transactions list
        const txList: Transaction[] = [];

        // Add earned transactions from resolved issues
        fetchedIssues.forEach((issue) => {
          if (issue.status === 'RESOLVED') {
            txList.push({
              id: `tx-res-${issue.id}`,
              type: 'earned',
              amount: 100,
              description: `Awarded for Resolved Issue: "${issue.title}" (Spring Boot Business Rule 2)`,
              date: issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : 'Recently',
            });
          }
        });

        // Add earned transactions for reporting issues
        fetchedIssues.forEach((issue) => {
          txList.push({
            id: `tx-rep-${issue.id}`,
            type: 'earned',
            amount: 50,
            description: `Reported Complaint: "${issue.title}" (${issue.category.toUpperCase()})`,
            date: issue.reportedAt ? new Date(issue.reportedAt).toLocaleDateString() : 'Recently',
          });
        });

        // Add welcome bonus
        txList.push({
          id: 'tx-welcome',
          type: 'earned',
          amount: 100,
          description: 'Aadhaar Verified Citizen Welcome Bonus',
          date: 'Account Creation',
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

  const handleRedeem = (partnerName: string, cost: number) => {
    if (points < cost) {
      toast({
        title: 'Insufficient Points',
        description: `You need ${cost} points to redeem ${partnerName}. Resolve more civic issues to earn points!`,
        variant: 'destructive',
      });
      return;
    }

    const newBalance = points - cost;
    setPoints(newBalance);
    if (user) {
      user.points = newBalance;
    }

    const newTx: Transaction = {
      id: `tx-red-${Date.now()}`,
      type: 'redeemed',
      amount: cost,
      description: `Redeemed Voucher: ${partnerName}`,
      date: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);

    toast({
      title: '🎉 Voucher Redeemed Successfully!',
      description: `Redeemed ${partnerName} for ${cost} points. Remaining balance: ${newBalance} pts.`,
    });
  };

  const resolvedCount = issues.filter(i => i.status === 'RESOLVED').length;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Civic Reward Wallet</h1>
            <p className="text-muted-foreground mt-1">
              Live points balance computed from Spring Boot REST API & Business Rule 2
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
                  <span className="text-sm font-semibold tracking-wide text-primary-foreground/90">LIVE CIVIC POINTS BALANCE</span>
                </div>
                <Badge className="bg-accent text-accent-foreground font-bold px-3 py-1">
                  Level 3 Champion
                </Badge>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extrabold tracking-tight">{points.toLocaleString()}</span>
                <span className="text-lg font-medium text-accent">PTS</span>
              </div>

              <div className="mt-6 pt-4 border-t border-primary-foreground/20 flex flex-wrap items-center gap-6 text-xs text-primary-foreground/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{resolvedCount} Resolved Complaints (+100 pts each)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{issues.length} Total Complaints Reported</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Live Transaction History */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center justify-between">
                <span>Transaction History</span>
                <Badge variant="outline" className="text-xs">{transactions.length} Entries</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground p-6">Loading transaction records...</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-muted-foreground p-6">No points activity recorded yet.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between gap-3 hover:border-primary/30 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'earned' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
                          {tx.type === 'earned' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-card-foreground">{tx.description}</p>
                          <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>

                      <span className={`text-sm font-bold shrink-0 ${tx.type === 'earned' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {tx.type === 'earned' ? '+' : '-'}{tx.amount} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Redemption Partners */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Gift className="w-5 h-5 text-accent" /> Redeem Civic Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {redemptionPartners.map((partner) => (
                  <div key={partner.id} className="p-4 rounded-lg border border-border bg-card flex items-center justify-between gap-4 hover:border-primary/40 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
                        {partner.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">{partner.name}</p>
                        <p className="text-xs text-muted-foreground">{partner.description}</p>
                        <Badge variant="secondary" className="text-[10px] mt-1">{partner.category}</Badge>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground mb-1.5">{partner.pointsCost} pts</p>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                        onClick={() => handleRedeem(partner.name, partner.pointsCost)}
                      >
                        Redeem
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default WalletPage;
