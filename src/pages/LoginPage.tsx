import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Fingerprint, 
  MapPin, 
  Building2, 
  User, 
  Key, 
  ArrowRight, 
  Zap, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authService, CitizenAccount } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

export const authorityAdmins = [
  { id: 'HEALTH-ADM-01', name: 'Health Department Admin', department: 'health', label: '🏥 Public Health Board' },
  { id: 'SAFETY-ADM-01', name: 'Public Safety Admin', department: 'safety', label: '🛡️ Safety & Traffic Control' },
  { id: 'SANITATION-ADM-01', name: 'Sanitation Admin', department: 'sanitation', label: '🧹 Sanitation & Waste Board' },
  { id: 'WATER-ADM-01', name: 'Water Supply Admin', department: 'water', label: '🚰 Water Supply & Drainage Board' },
  { id: 'ELEC-ADM-01', name: 'Electricity Admin', department: 'electricity', label: '⚡ Electricity & Power Board' },
  { id: 'INFRA-ADM-01', name: 'Infrastructure Admin', department: 'infrastructure', label: '🛠️ Roads & Infrastructure Dept' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activePortal, setActivePortal] = useState<'citizen' | 'authority'>('citizen');

  // Registered Accounts List
  const [accounts, setAccounts] = useState<CitizenAccount[]>([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Citizen Login State
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [citizenStep, setCitizenStep] = useState<'aadhaar' | 'otp'>('aadhaar');
  const [matchedAccount, setMatchedAccount] = useState<CitizenAccount | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Credential Form State
  const [newName, setNewName] = useState('');
  const [newAadhaar, setNewAadhaar] = useState('');
  const [newOtp, setNewOtp] = useState('');
  const [newLocality, setNewLocality] = useState('Koramangala, Bengaluru');
  const [newEmail, setNewEmail] = useState('');

  // Authority State
  const [selectedAuthorityId, setSelectedAuthorityId] = useState('HEALTH-ADM-01');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  // Load registered citizen accounts from localStorage
  useEffect(() => {
    const list = authService.getAccounts();
    setAccounts(list);
    if (list.length > 0) {
      setAadhaar(list[0].aadhaar);
    }
  }, []);

  const handleSendOtp = () => {
    setErrorMsg(null);
    const clean = aadhaar.replace(/\D/g, '');
    if (clean.length !== 12) {
      setErrorMsg('Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    const found = authService.findAccountByAadhaar(clean);
    if (!found) {
      setErrorMsg(`Aadhaar '${clean}' is not registered. Add your custom credentials below to sign in.`);
      return;
    }

    setMatchedAccount(found);
    setOtp('');
    setCitizenStep('otp');
    toast({
      title: '📲 OTP Sent Successfully',
      description: `OTP dispatched for Aadhaar ending in ${clean.slice(-4)}. (Designated OTP: ${found.otp})`,
    });
  };

  const handleCitizenLogin = async () => {
    setErrorMsg(null);
    if (!matchedAccount) {
      setErrorMsg('Aadhaar not identified. Please go back and enter your Aadhaar.');
      return;
    }

    const cleanOtp = otp.replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter a 6-digit OTP.');
      return;
    }

    setLoading(true);
    const result = await authService.verifyAndLogin(matchedAccount.aadhaar, cleanOtp);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Invalid OTP for this Aadhaar.');
      toast({
        title: '❌ Verification Failed',
        description: result.error || 'The OTP does not match this Aadhaar credential.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: `✅ Welcome, ${result.account?.name}!`,
      description: 'Authenticated successfully via unique Aadhaar OTP.',
    });
    navigate('/dashboard');
  };

  const handleAddNewCredential = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAadhaar = newAadhaar.replace(/\D/g, '');
    const cleanOtp = newOtp.replace(/\D/g, '');

    if (!newName.trim()) {
      toast({ title: 'Error', description: 'Please enter a name.', variant: 'destructive' });
      return;
    }
    if (cleanAadhaar.length !== 12) {
      toast({ title: 'Error', description: 'Aadhaar must be exactly 12 digits.', variant: 'destructive' });
      return;
    }
    if (cleanOtp.length !== 6) {
      toast({ title: 'Error', description: 'OTP must be exactly 6 digits.', variant: 'destructive' });
      return;
    }

    const created = authService.addAccount({
      name: newName.trim(),
      aadhaar: cleanAadhaar,
      otp: cleanOtp,
      locality: newLocality.trim() || 'Koramangala',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@civicecho.org`,
      points: 0,
    });

    const updated = authService.getAccounts();
    setAccounts(updated);
    setAadhaar(created.aadhaar);
    setCitizenStep('aadhaar');
    setMatchedAccount(null);
    setShowAddForm(false);
    setErrorMsg(null);

    // Reset inputs
    setNewName('');
    setNewAadhaar('');
    setNewOtp('');
    setNewEmail('');

    toast({
      title: '✅ New Citizen Credential Saved!',
      description: `Aadhaar ${created.aadhaar} registered with specific OTP ${created.otp}.`,
    });
  };

  const handleDeleteAccount = (id: string, name: string) => {
    authService.deleteAccount(id);
    const updated = authService.getAccounts();
    setAccounts(updated);
    if (aadhaar && accounts.find(a => a.id === id)?.aadhaar === aadhaar) {
      setAadhaar(updated.length > 0 ? updated[0].aadhaar : '');
      setCitizenStep('aadhaar');
      setMatchedAccount(null);
    }
    toast({
      title: '🗑️ Account Removed',
      description: `Credential for ${name} deleted successfully.`,
    });
  };

  const handleQuickSelectAccount = (account: CitizenAccount) => {
    setAadhaar(account.aadhaar);
    setMatchedAccount(account);
    setCitizenStep('aadhaar');
    setErrorMsg(null);
    toast({
      title: `Selected ${account.name}`,
      description: `Aadhaar: ${account.aadhaar} • Registered OTP: ${account.otp}`,
    });
  };

  const handleAuthorityLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const selected = authorityAdmins.find(a => a.id === selectedAuthorityId);
      localStorage.setItem('userRole', 'authority');
      if (selected) {
        localStorage.setItem('authorityDepartment', selected.department);
        localStorage.setItem('authorityName', selected.name);
      }
      navigate('/authority');
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* LEFT COLUMN: HERO TEMPLATE PANEL (50% Width) */}
      <div className="w-full lg:w-1/2 gradient-hero flex items-center justify-center p-8 lg:p-12 relative overflow-hidden text-primary-foreground min-h-[400px] lg:min-h-screen">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary-foreground/30"
              style={{
                width: `${220 + i * 140}px`,
                height: `${220 + i * 140}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg space-y-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">CivicEchoX</h1>
          </div>

          <div className="space-y-1">
            <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
              Your Voice.<br />
              Your City.<br />
              <span className="text-accent">Your Impact.</span>
            </h2>
          </div>

          <p className="text-base lg:text-lg text-primary-foreground/85 leading-relaxed font-normal">
            Report civic issues, earn rewards for verified contributions, and watch your community transform — with unique Aadhaar & OTP citizen verification.
          </p>

          <div className="pt-4 flex items-center gap-8 lg:gap-12">
            <div>
              <div className="text-2xl lg:text-3xl font-bold text-white">12,400+</div>
              <div className="text-xs lg:text-sm text-primary-foreground/70 font-medium mt-0.5">Issues Resolved</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-bold text-white">8,200+</div>
              <div className="text-xs lg:text-sm text-primary-foreground/70 font-medium mt-0.5">Active Citizens</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-bold text-white">₹4.2L</div>
              <div className="text-xs lg:text-sm text-primary-foreground/70 font-medium mt-0.5">Points Redeemed</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORMS (50% Width) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10 bg-background overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-5 py-4"
        >
          {/* Header & Portal Switcher Tabs */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Sign In to CivicEchoX</h2>
            <p className="text-xs text-muted-foreground">Select your portal to continue with your credentials</p>

            <div className="flex bg-secondary p-1 rounded-xl border border-border mt-3">
              <button
                onClick={() => { setActivePortal('citizen'); setErrorMsg(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activePortal === 'citizen'
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Citizen Portal
              </button>
              <button
                onClick={() => { setActivePortal('authority'); setErrorMsg(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activePortal === 'authority'
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Authority Admin Portal
              </button>
            </div>
          </div>

          {/* CITIZEN PORTAL */}
          {activePortal === 'citizen' ? (
            <div className="space-y-4">
              <Card className="shadow-lg border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-foreground">
                      <User className="w-4 h-4 text-primary" /> Citizen Sign In
                    </CardTitle>
                    <Badge variant="outline" className="text-[11px] font-normal">
                      Aadhaar + Unique OTP
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Each Aadhaar number has its own dedicated OTP credential
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {citizenStep === 'aadhaar' ? (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="aadhaar" className="text-foreground text-xs font-medium">
                          Enter 12-Digit Aadhaar Number
                        </Label>
                        <div className="relative">
                          <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="aadhaar"
                            placeholder="e.g. 123456789012"
                            className="pl-9 h-10 text-sm font-mono tracking-wider text-foreground"
                            value={aadhaar}
                            onChange={(e) => {
                              setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12));
                              setErrorMsg(null);
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Enter any registered Aadhaar or select one from below
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-secondary text-xs text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent shrink-0" />
                        <span>Locality Geo-fence active (Bengaluru Municipal Area)</span>
                      </div>

                      <Button
                        className="w-full h-10 gradient-hero text-primary-foreground font-semibold text-xs"
                        onClick={handleSendOtp}
                      >
                        Send OTP for this Aadhaar <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Target Aadhaar:</span>
                          <span className="font-mono font-bold text-foreground">
                            **** **** {matchedAccount?.aadhaar.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Citizen Name:</span>
                          <span className="font-semibold text-foreground">{matchedAccount?.name}</span>
                        </div>
                        {matchedAccount && (
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-primary/10">
                            <span className="text-muted-foreground">Specific OTP for this Aadhaar:</span>
                            <Badge className="bg-primary text-primary-foreground font-mono font-bold">
                              {matchedAccount.otp}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="otp" className="text-foreground text-xs font-medium">
                          Enter Specific 6-Digit OTP
                        </Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="otp"
                            placeholder="6-digit OTP"
                            className="pl-9 h-10 text-center text-base tracking-widest font-mono text-foreground"
                            value={otp}
                            onChange={(e) => {
                              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                              setErrorMsg(null);
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        className="w-full h-10 gradient-hero text-primary-foreground font-semibold text-xs"
                        onClick={handleCitizenLogin}
                        disabled={loading}
                      >
                        {loading ? 'Verifying OTP...' : 'Sign In as Citizen'}
                      </Button>

                      <button
                        onClick={() => { setCitizenStep('aadhaar'); setErrorMsg(null); }}
                        className="w-full text-xs text-muted-foreground hover:text-foreground text-center block pt-1"
                      >
                        ← Back to Change Aadhaar
                      </button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* CREDENTIALS MANAGEMENT PANEL */}
              <Card className="border-border bg-card/60 backdrop-blur-sm">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">Registered Citizen Accounts ({accounts.length})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary"
                      onClick={() => setShowManageModal(!showManageModal)}
                    >
                      {showManageModal ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
                      {showManageModal ? 'Hide' : 'Manage / Add Yours'}
                    </Button>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {showManageModal && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden px-4 pb-4 space-y-3"
                    >
                      <p className="text-[11px] text-muted-foreground">
                        Each citizen has an Aadhaar and an individual OTP. You can add your own credentials and delete any dummy data below:
                      </p>

                      {/* Accounts List */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {accounts.length === 0 ? (
                          <div className="text-center p-3 text-xs text-muted-foreground border border-dashed rounded-lg">
                            No credentials registered yet. Add yours below!
                          </div>
                        ) : (
                          accounts.map((acc) => (
                            <div
                              key={acc.id}
                              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                                aadhaar === acc.aadhaar ? 'border-primary bg-primary/5' : 'border-border bg-background'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  <span>{acc.name}</span>
                                  {aadhaar === acc.aadhaar && (
                                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">Active</Badge>
                                  )}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-mono">
                                  Aadhaar: <span className="font-bold text-foreground">{acc.aadhaar}</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                  <span>OTP: <span className="font-mono font-bold text-accent">{acc.otp}</span></span>
                                  <span>•</span>
                                  <span>{acc.locality}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[11px] px-2"
                                  onClick={() => handleQuickSelectAccount(acc)}
                                >
                                  Use
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteAccount(acc.id, acc.name)}
                                  title="Delete this credential"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Form Toggle */}
                      {!showAddForm ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs border-dashed border-primary/50 text-primary hover:bg-primary/5"
                          onClick={() => setShowAddForm(true)}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add My Own Citizen Credential
                        </Button>
                      ) : (
                        <form onSubmit={handleAddNewCredential} className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2.5">
                          <div className="text-xs font-bold text-foreground flex items-center justify-between">
                            <span>Register Custom Citizen</span>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground text-[11px]"
                              onClick={() => setShowAddForm(false)}
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px]">Full Name</Label>
                            <Input
                              placeholder="e.g. Ramesh Kumar"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="h-8 text-xs bg-background"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[11px]">12-Digit Aadhaar</Label>
                              <Input
                                placeholder="12 digits"
                                value={newAadhaar}
                                onChange={(e) => setNewAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                className="h-8 text-xs font-mono bg-background"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px]">Assigned 6-Digit OTP</Label>
                              <Input
                                placeholder="6 digits"
                                value={newOtp}
                                onChange={(e) => setNewOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="h-8 text-xs font-mono bg-background"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[11px]">Locality / Area</Label>
                              <Input
                                placeholder="e.g. Koramangala"
                                value={newLocality}
                                onChange={(e) => setNewLocality(e.target.value)}
                                className="h-8 text-xs bg-background"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px]">Email Address</Label>
                              <Input
                                placeholder="e.g. user@civicecho.org"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="h-8 text-xs bg-background"
                              />
                            </div>
                          </div>

                          <Button type="submit" size="sm" className="w-full h-8 text-xs gradient-hero text-primary-foreground font-semibold">
                            Save My Credential
                          </Button>
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          ) : (
            /* AUTHORITY ADMIN SIGN IN CARD (UNMODIFIED) */
            <Card className="shadow-lg border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Building2 className="w-5 h-5 text-primary" /> Authority Admin Sign In
                </CardTitle>
                <CardDescription className="text-xs">
                  Select your municipal department admin account below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-foreground text-xs">Select Department Admin</Label>
                  <Select value={selectedAuthorityId} onValueChange={setSelectedAuthorityId}>
                    <SelectTrigger className="h-10 text-sm text-foreground bg-card">
                      <SelectValue placeholder="Select Department Admin" />
                    </SelectTrigger>
                    <SelectContent>
                      {authorityAdmins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-foreground text-xs">Admin Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter admin password"
                      className="pl-9 h-10 text-sm text-foreground"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Demo Admin Password: `admin123`</p>
                </div>

                <Button
                  className="w-full h-10 gradient-hero text-primary-foreground font-semibold text-xs mt-2"
                  onClick={handleAuthorityLogin}
                  disabled={loading}
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" /> {loading ? 'Authenticating Admin...' : 'Sign In as Authority Admin'}
                </Button>
              </CardContent>
            </Card>
          )}

          <p className="text-[11px] text-center text-muted-foreground pt-1">
            CivicEchoX Platform • Connected to Spring Boot 3-Tier Backend API
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
