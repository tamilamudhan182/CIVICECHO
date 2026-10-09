import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Fingerprint, MapPin, Building2, User, Key, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [activePortal, setActivePortal] = useState<'citizen' | 'authority'>('citizen');

  // Citizen State
  const [aadhaar, setAadhaar] = useState('123456789012');
  const [otp, setOtp] = useState('123456');
  const [citizenStep, setCitizenStep] = useState<'aadhaar' | 'otp'>('aadhaar');

  // Authority State
  const [selectedAuthorityId, setSelectedAuthorityId] = useState('HEALTH-ADM-01');
  const [password, setPassword] = useState('admin123');

  const [loading, setLoading] = useState(false);

  const handleCitizenLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('userRole', 'citizen');
      localStorage.setItem('userName', 'Aarav Sharma');
      navigate('/dashboard');
    }, 300);
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
        {/* Ripple concentric circles background */}
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
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">CivicEchoX</h1>
          </div>

          {/* Headline */}
          <div className="space-y-1">
            <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
              Your Voice.<br />
              Your City.<br />
              <span className="text-accent">Your Impact.</span>
            </h2>
          </div>

          {/* Subtext */}
          <p className="text-base lg:text-lg text-primary-foreground/85 leading-relaxed font-normal">
            Report civic issues, earn rewards for verified contributions, and watch your community transform — all powered by AI prioritization.
          </p>

          {/* Statistics Grid */}
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

      {/* RIGHT COLUMN: LOGIN FORMS FROM CENTER OF SCREEN (50% Width) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Header & Portal Switcher Tabs */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Sign In to CivicEchoX</h2>
            <p className="text-xs text-muted-foreground">Select your portal to continue with your credentials</p>

            <div className="flex bg-secondary p-1 rounded-xl border border-border mt-3">
              <button
                onClick={() => setActivePortal('citizen')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activePortal === 'citizen'
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Citizen Portal
              </button>
              <button
                onClick={() => setActivePortal('authority')}
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

          {/* LOGIN CARDS */}
          {activePortal === 'citizen' ? (
            // CITIZEN SIGN IN CARD
            <Card className="shadow-lg border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <User className="w-5 h-5 text-primary" /> Citizen Sign In
                </CardTitle>
                <CardDescription className="text-xs">
                  Aadhaar-linked identity authentication for citizens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {citizenStep === 'aadhaar' ? (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="aadhaar" className="text-foreground text-xs">Aadhaar Number</Label>
                      <div className="relative">
                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="aadhaar"
                          placeholder="12-digit Aadhaar"
                          className="pl-9 h-10 text-sm text-foreground"
                          value={aadhaar}
                          onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Demo Citizen Aadhaar: `123456789012`</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-secondary text-xs text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent shrink-0" />
                      <span>Geo-fenced to Koramangala / Indiranagar, Bengaluru</span>
                    </div>

                    <Button
                      className="w-full h-10 gradient-hero text-primary-foreground font-semibold text-xs"
                      onClick={() => setCitizenStep('otp')}
                    >
                      Send OTP <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="otp" className="text-foreground text-xs">Enter 6-digit OTP</Label>
                      <Input
                        id="otp"
                        placeholder="OTP Code"
                        className="h-10 text-center text-base tracking-widest text-foreground"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                      <p className="text-[11px] text-muted-foreground text-center">Demo OTP: `123456`</p>
                    </div>

                    <Button
                      className="w-full h-10 gradient-hero text-primary-foreground font-semibold text-xs"
                      onClick={handleCitizenLogin}
                    >
                      {loading ? 'Authenticating...' : 'Sign In as Citizen'}
                    </Button>

                    <button
                      onClick={() => setCitizenStep('aadhaar')}
                      className="w-full text-xs text-muted-foreground hover:text-foreground text-center block pt-1"
                    >
                      ← Back to Aadhaar
                    </button>
                  </>
                )}

                <div className="pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full h-9 border-primary text-primary hover:bg-primary/10 font-semibold text-xs"
                    onClick={handleCitizenLogin}
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5" /> 1-Click Instant Citizen Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // AUTHORITY ADMIN SIGN IN CARD
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
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" /> {loading ? 'Authenticating Admin...' : 'Sign In as Authority Admin'}
                </Button>
              </CardContent>
            </Card>
          )}

          <p className="text-[11px] text-center text-muted-foreground pt-2">
            CivicEchoX Platform • Connected to Spring Boot 3-Tier Backend API
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
