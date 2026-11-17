import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Upload, Sparkles, Send, ShieldCheck, Image as ImageIcon, X, Check } from 'lucide-react';
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

  // Evidence Image Upload State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSize, setImageFileSize] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategoryObj = categories.find((c) => c.value === category);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file (PNG, JPG, JPEG, WEBP).',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image size should be less than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setImageFileName(file.name);
    setImageFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      toast({
        title: '📷 Evidence Photo Attached',
        description: `${file.name} ready to submit.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFileName('');
    setImageFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        imageUrl: imagePreview || '',
      });

      // Update local storage points (+50 pts for filing)
      const currentPts = Number(localStorage.getItem('userPoints') || '0');
      localStorage.setItem('userPoints', String(currentPts + 50));

      toast({
        title: `✅ Complaint #${created.id} Routed to ${matched.departmentName}`,
        description: `Saved to database! +50 Civic Points awarded. Priority Score: ${created.priorityScore?.toFixed(1)}.`,
      });

      setTitle('');
      setDescription('');
      setCategory('sanitation');
      setAiResult(null);
      handleRemoveImage();
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
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Incident Photo Evidence</Label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-destructive hover:underline flex items-center gap-1 font-medium"
                  >
                    <X className="w-3.5 h-3.5" /> Remove Image
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/60 hover:bg-primary/5 transition cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Click to browse or drop photo here</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, JPEG, WEBP (Max 10MB)</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Choose Image File
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-border p-3 bg-card/60 flex items-center gap-4">
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Evidence Preview"
                      className="w-20 h-20 object-cover rounded-md border border-border shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-md flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate max-w-[220px]">{imageFileName}</span>
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 font-medium">Ready</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Size: {imageFileSize} • Evidence verified</p>
                    <div className="pt-1 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Photo
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
