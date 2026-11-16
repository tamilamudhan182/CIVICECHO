import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/components/AppLayout';
import { apiService, CivicIssueDTO } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const departmentList = [
  { value: 'all', label: '🌐 All Departments' },
  { value: 'health', label: '🏥 Health Authority' },
  { value: 'safety', label: '🛡️ Safety Authority' },
  { value: 'sanitation', label: '🧹 Sanitation Authority' },
  { value: 'water', label: '🚰 Water Supply Authority' },
  { value: 'electricity', label: '⚡ Electricity Authority' },
  { value: 'infrastructure', label: '🛠️ Infrastructure Authority' },
];

const AuthorityDashboard = () => {
  const { toast } = useToast();
  const [issues, setIssues] = useState<CivicIssueDTO[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [authorityName, setAuthorityName] = useState<string>('Municipal Authority Admin');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedDept = localStorage.getItem('authorityDepartment');
    const savedName = localStorage.getItem('authorityName');
    if (savedDept) setSelectedDept(savedDept);
    if (savedName) setAuthorityName(savedName);
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await apiService.getIssues();
      setIssues(data);
    } catch (err) {
      console.error('Failed to fetch issues for Authority Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const updated = await apiService.updateIssueStatus(id, newStatus);
      setIssues((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast({
        title: `✅ Status updated to ${newStatus}`,
        description: newStatus === 'RESOLVED'
          ? 'Business Rule 2 triggered: +100 Civic Reward Points awarded to the reporting citizen!'
          : `Issue #${id} status updated successfully.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update issue status on Spring Boot backend.',
        variant: 'destructive',
      });
    }
  };

  const filteredIssues = selectedDept === 'all'
    ? issues
    : issues.filter((i) => i.category?.toLowerCase() === selectedDept.toLowerCase());

  const pendingCount = filteredIssues.filter((i) => i.status === 'PENDING').length;
  const inProgressCount = filteredIssues.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount = filteredIssues.filter((i) => i.status === 'RESOLVED').length;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-primary" />
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{authorityName} Dashboard</h1>
            </div>
            <p className="text-muted-foreground mt-1">Review, prioritize, and resolve citizen complaints via Spring Boot API</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-[240px] bg-card text-foreground">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                {departmentList.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Complaints</p>
                <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500/20" />
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-500">{inProgressCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-500/20" />
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Resolved Issues</p>
                <p className="text-2xl font-bold text-emerald-500">{resolvedCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
            </CardContent>
          </Card>
        </div>

        {/* Issues Management List */}
        <Card className="shadow-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-card-foreground">
              Prioritized Queue ({filteredIssues.length} Complaints)
            </CardTitle>
            <Badge variant="outline" className="capitalize text-xs">
              Filtering: {departmentList.find(d => d.value === selectedDept)?.label}
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground p-6">Loading issues from Spring Boot...</p>
            ) : filteredIssues.length === 0 ? (
              <p className="text-center text-muted-foreground p-8">No complaints found for the selected department filter.</p>
            ) : (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <div key={issue.id} className="p-4 rounded-lg border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-card-foreground">#{issue.id} - {issue.title}</span>
                        <Badge className="bg-primary/10 text-primary text-xs capitalize">{issue.category}</Badge>
                        <Badge className="bg-destructive/10 text-destructive text-xs capitalize">{issue.urgency} Urgency</Badge>
                        <Badge variant="outline" className="text-xs">Priority Score: {issue.priorityScore?.toFixed(1)}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{issue.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span>📍 {issue.locality}</span>
                        <span>👤 Reported by: {issue.reportedBy}</span>
                        <span>👥 Upvote Clusters: {issue.clusterCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {issue.status !== 'RESOLVED' ? (
                        <>
                          {issue.status !== 'IN_PROGRESS' && (
                            <Button size="sm" variant="outline" onClick={() => issue.id && handleUpdateStatus(issue.id, 'IN_PROGRESS')}>
                              Mark In Progress
                            </Button>
                          )}
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => issue.id && handleUpdateStatus(issue.id, 'RESOLVED')}>
                            Resolve & Award Points
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-500 text-xs px-3 py-1">
                          ✓ Resolved ({issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : 'Today'})
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AuthorityDashboard;
