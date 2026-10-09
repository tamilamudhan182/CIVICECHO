import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Upload, Sparkles, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/AppLayout';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const categories = [
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'health', label: 'Health' },
  { value: 'safety', label: 'Safety' },
  { value: 'sanitation', label: 'Sanitation' },
  { value: 'water', label: 'Water Supply' },
  { value: 'electricity', label: 'Electricity' },
];

const ReportIssuePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<{ urgency: string; sentiment: number; tags: string[] } | null>(null);

  const handleAnalyze = () => {
    if (!title || !description) return;
    setAnalyzing(true);
    setTimeout(() => {
      const urgency = description.toLowerCase().includes('danger') || description.toLowerCase().includes('accident') ? 'CRITICAL' : 'HIGH';
      setAiResult({
        urgency,
        sentiment: -0.78,
        tags: ['public-safety', category || 'general', 'requires-inspection'],
      });
      setAnalyzing(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) return;
    setSubmitting(true);
    try {
      const urgency = aiResult?.urgency || 'MEDIUM';
      const created = await apiService.createIssue({
        title,
        description,
        category,
        urgency,
        location: '80 Feet Road, Koramangala',
        locality: 'Koramangala',
        reportedBy: 'aarav@civicecho.org',
        sentimentScore: aiResult?.sentiment || -0.65,
      });

      toast({
        title: '✅ Issue Reported & Saved to Spring Boot',
        description: `Complaint #${created.id} submitted! Calculated Priority Score: ${created.priorityScore?.toFixed(1)}.`,
      });

      setTitle('');
      setDescription('');
      setCategory('');
      setAiResult(null);
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to submit issue to Spring Boot backend server.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Report an Issue</h1>
          <p className="text-muted-foreground mt-1">Submit a civic complaint (Persisted to Spring Boot API & H2 DB)</p>
        </motion.div>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-foreground">Title</Label>
              <Input placeholder="e.g., Pothole on main road near school" value={title} onChange={(e) => setTitle(e.target.value)} className="text-foreground" />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Description</Label>
              <Textarea placeholder="Describe the issue in detail..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="text-foreground" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value="Koramangala, Bengaluru" disabled className="pl-9 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Auto-detected from your geo-fence</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Evidence (optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/40 transition cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload images or PDFs</p>
                <p className="text-xs text-muted-foreground mt-1">Max 10MB per file</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card className="shadow-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-card-foreground">AI Analysis</h3>
              </div>
              <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={!title || !description || analyzing}>
                {analyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </div>

            {aiResult ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1 p-3 rounded-lg bg-secondary">
                    <p className="text-xs text-muted-foreground">Urgency</p>
                    <p className="font-semibold text-destructive capitalize">{aiResult.urgency}</p>
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-secondary">
                    <p className="text-xs text-muted-foreground">Sentiment</p>
                    <p className="font-semibold text-card-foreground">{aiResult.sentiment.toFixed(2)} (Negative)</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiResult.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-muted-foreground">Fill in the issue details and run AI analysis to auto-detect urgency and sentiment.</p>
            )}
          </CardContent>
        </Card>

        <Button className="w-full h-12 gradient-hero text-primary-foreground font-semibold" onClick={handleSubmit} disabled={!title || !description || !category || submitting}>
          <Send className="w-4 h-4 mr-2" /> {submitting ? 'Submitting to Spring Boot...' : 'Submit Report'}
        </Button>
      </div>
    </AppLayout>
  );
};

export default ReportIssuePage;
