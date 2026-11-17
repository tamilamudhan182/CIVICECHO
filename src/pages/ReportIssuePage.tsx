import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Upload, Sparkles, Send, ShieldCheck } from 'lucide-react';
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

export const categories = [
  { value: 'health', label: '🏥 Health Authority (Public Health Board)', departmentName: 'Public Health Board', admin: 'HEALTH-ADM-01' },
  { value: 'safety', label: '🛡️ Safety Authority (Traffic & Safety Control)', departmentName: 'Safety & Traffic Control', admin: 'SAFETY-ADM-01' },
  { value: 'sanitation', label: '🧹 Sanitation Authority (Waste & Sanitation Board)', departmentName: 'Sanitation & Waste Board', admin: 'SANITATION-ADM-01' },
  { value: 'water', label: '🚰 Water Supply Authority (Water & Drainage Board)', departmentName: 'Water Supply & Drainage Board', admin: 'WATER-ADM-01' },
  { value: 'electricity', label: '⚡ Electricity Authority (Electricity & Power Board)', departmentName: 'Electricity & Power Board', admin: 'ELEC-ADM-01' },
  { value: 'infrastructure', label: '🛠️ Infrastructure Authority (Roads & Infra Dept)', departmentName: 'Roads & Infrastructure Department', admin: 'INFRA-ADM-01' },
];

const ReportIssuePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('sanitation');
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<{ urgency: string; sentiment: number; tags: string[]; suggestedAuthority: string } | null>(null);

  const selectedCategoryObj = categories.find((c) => c.value === category);

  const handleAnalyze = () => {
    if (!title && !description) return;
    setAnalyzing(true);
    setTimeout(() => {
      const text = `${title} ${description}`.toLowerCase();
      const urgency = text.includes('danger') || text.includes('accident') || text.includes('critical') || text.includes('burst')
        ? 'CRITICAL'
        : 'HIGH';

      let autoCategory = category;
      if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('stench') || text.includes('dump') || text.includes('overflow')) {
        autoCategory = 'sanitation';
      } else if (text.includes('mosquito') || text.includes('dengue') || text.includes('clinic') || text.includes('hospital') || text.includes('health') || text.includes('disease') || text.includes('stagnant')) {
        autoCategory = 'health';
      } else if (text.includes('water') || text.includes('pipe') || text.includes('drainage') || text.includes('sewage') || text.includes('leak')) {
        autoCategory = 'water';
      } else if (text.includes('light') || text.includes('wire') || text.includes('electricity') || text.includes('transformer') || text.includes('power')) {
        autoCategory = 'electricity';
      } else if (text.includes('traffic') || text.includes('guardrail') || text.includes('signal') || text.includes('crossing') || text.includes('safety')) {
        autoCategory = 'safety';
      } else if (text.includes('pothole') || text.includes('road') || text.includes('footpath') || text.includes('bridge')) {
        autoCategory = 'infrastructure';
      }

      setCategory(autoCategory);
      const matched = categories.find((c) => c.value === autoCategory);

      setAiResult({
        urgency,
        sentiment: -0.75,
        tags: ['civic-priority', autoCategory, 'auto-routed'],
        suggestedAuthority: matched ? matched.departmentName : 'Competent Authority',
      });
      setAnalyzing(false);

      toast({
        title: '🤖 AI Auto-Routing Complete',
        description: `Routed to: ${matched?.departmentName || 'Competent Authority'} (Urgency: ${urgency})`,
      });
    }, 800);
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) return;
    setSubmitting(true);
    try {
      const matched = categories.find((c) => c.value === category) || categories[0];
      const urgency = aiResult?.urgency || 'MEDIUM';
      const created = await apiService.createIssue({
        title,
        description,
        category: matched.value,
        department: matched.value,
        assignedAuthority: matched.departmentName,
        urgency,
        location: `${localStorage.getItem('userLocality') || 'Koramangala'}, Bengaluru`,
        locality: localStorage.getItem('userLocality') || 'Koramangala',
        reportedBy: localStorage.getItem('userEmail') || 'citizen@civicecho.org',
        sentimentScore: aiResult?.sentiment || -0.65,
      });

      // Update local storage points (+50 pts for filing)
      const currentPts = Number(localStorage.getItem('userPoints') || '0');
      localStorage.setItem('userPoints', String(currentPts + 50));

      toast({
        title: `✅ Complaint #${created.id} Routed to ${matched.departmentName}`,
        description: `Saved to database! +50 Civic Points awarded for reporting. Priority Score: ${created.priorityScore?.toFixed(1)}.`,
      });

      setTitle('');
      setDescription('');
      setCategory('sanitation');
      setAiResult(null);
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: 'Error Submitting Complaint',
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
                <Label className="text-foreground">Category & Target Authority</Label>
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

            {selectedCategoryObj && (
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <div>
                    <span className="font-semibold text-foreground">Assigned Department: </span>
                    <span className="text-primary font-bold">{selectedCategoryObj.departmentName}</span>
                    <span className="text-muted-foreground ml-1">({selectedCategoryObj.admin})</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[11px] capitalize bg-background">Department: {selectedCategoryObj.value}</Badge>
              </div>
            )}

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
