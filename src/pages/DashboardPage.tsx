import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Award, TrendingUp, Inbox, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/AppLayout';
import { apiService, CivicIssueDTO, UserDTO } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const DashboardPage = () => {
  const { toast } = useToast();
  const [issues, setIssues] = useState<CivicIssueDTO[]>([]);
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedIssues, fetchedUsers] = await Promise.all([
        apiService.getIssues(),
        apiService.getUsers(),
      ]);
      setIssues(fetchedIssues);
      if (fetchedUsers.length > 0) {
        setCurrentUser(fetchedUsers[0]);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpvote = async (issueId: number) => {
    try {
      const updated = await apiService.upvoteIssue(issueId);
      setIssues((prev) => prev.map((i) => (i.id === issueId ? updated : i)));
      toast({
        title: '👍 Issue Upvoted!',
        description: `Priority score recalculated to ${updated.priorityScore?.toFixed(1)} by Spring Boot Service layer.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to upvote issue.',
        variant: 'destructive',
      });
    }
  };

  const userName = currentUser?.name || 'Aarav Sharma';
  const stats = [
    { label: 'Issues Reported', value: currentUser?.issuesReported ?? issues.length, icon: FileText, color: 'text-primary' },
    { label: 'Issues Resolved', value: currentUser?.issuesResolved ?? issues.filter(i => i.status === 'RESOLVED').length, icon: CheckCircle2, color: 'text-success' },
    { label: 'Civic Points', value: (currentUser?.points ?? 450).toLocaleString(), icon: Award, color: 'text-accent' },
    { label: 'Top Priority Score', value: issues.length > 0 ? issues[0].priorityScore?.toFixed(1) : '0.0', icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Live Civic Engagement Dashboard (Spring Boot Backend Connected)</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Issues */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Issues in Your Area (Ranked by Spring Boot AI Priority Score)</h2>
            <Button variant="outline" size="sm" onClick={loadData}>
              Refresh Data
            </Button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading issues from Spring Boot REST API...</div>
          ) : issues.length === 0 ? (
            <Card className="shadow-card border-border">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <Inbox className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <h3 className="font-medium text-card-foreground mb-1">No issues reported yet</h3>
                <p className="text-sm text-muted-foreground">Be the first to report a civic issue in your area.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <Card key={issue.id} className="shadow-card border-border hover:border-primary/50 transition">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-card-foreground">{issue.title}</span>
                        <Badge variant={issue.status === 'RESOLVED' ? 'outline' : 'secondary'} className="capitalize text-xs">
                          {issue.status}
                        </Badge>
                        <Badge className="bg-primary/10 text-primary text-xs capitalize">
                          {issue.urgency} Urgency
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{issue.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span>📍 {issue.locality}</span>
                        <span>⚡ Priority Score: <strong className="text-primary">{issue.priorityScore?.toFixed(1)}</strong></span>
                        <span>👥 Clusters: {issue.clusterCount}</span>
                      </div>
                    </div>
                    {issue.id && (
                      <Button size="sm" variant="secondary" onClick={() => handleUpvote(issue.id!)}>
                        <ArrowUp className="w-4 h-4 mr-1" /> Upvote ({issue.clusterCount})
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
