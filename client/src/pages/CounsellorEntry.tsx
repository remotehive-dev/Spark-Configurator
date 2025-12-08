import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Search, UserCheck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function CounsellorEntry() {
  const [, setLocation] = useLocation();
  const [searchId, setSearchId] = useState("");
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [topicsView, setTopicsView] = useState<'grade' | 'suggested'>('grade');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [parentInput, setParentInput] = useState("");
  const [parentTopics, setParentTopics] = useState<string[]>([]);
  const [showSubmitting, setShowSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [canCustomize, setCanCustomize] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [postLoginAction, setPostLoginAction] = useState<(() => void) | null>(null);

  const performSearch = async () => {
    try {
      const res = await fetch(`/api/students`);
      if (res.ok) {
        const rows = await res.json();
        const s = rows.find((r: any) => String(r.id).toLowerCase() === searchId.toLowerCase());
        if (s) {
          const mapped: Student = {
            id: s.id,
            name: s.name,
            grade: s.grade || "",
            school: "",
            parentName: "",
            phone: "",
            email: "",
            status: s.status || "New",
            lastActivity: "",
            areasOfImprovement: [],
          };
          setStudent(mapped);
          toast({ title: "Student Found", description: `Welcome back, ${mapped.name}` });
        } else {
          setStudent(null);
          toast({ title: "Not Found", description: "No student found with this ID.", variant: "destructive" });
        }
      } else {
        setStudent(null);
        toast({ title: "Error", description: `${res.status} ${res.statusText}`, variant: "destructive" });
      }
    } catch {
      setStudent(null);
      toast({ title: "Network error", description: "Could not reach API", variant: "destructive" });
    }
  };

  const handleSearch = async () => {
    if (!loggedInUser) {
      setPostLoginAction(() => performSearch);
      setShowLogin(true);
      return;
    }
    performSearch();
  };

  const handleStartSession = () => {
    if (!student) return;
    setCustomizing(true);
    fetch(`/api/curriculum-files?grade=${encodeURIComponent(student.grade || '')}`)
      .then(r => r.ok ? r.json() : [])
      .then((rows) => {
        const topicNames = Array.isArray(rows) ? Array.from(new Set(rows.map((r: any) => String(r.topic || '').trim()).filter(Boolean))) : [];
        if (topicNames.length) {
          setTopics(topicNames);
        } else {
          return fetch('/api/topics').then(r => r.ok ? r.json() : []);
        }
      })
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) {
          setTopics(rows.map((t: any) => String(t.name)));
        } else {
          return fetch(`/api/topics?grade=${encodeURIComponent(student.grade || '')}`).then(r => r.ok ? r.json() : []);
        }
      })
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) {
          const names = rows.map((t: any) => t.name ? String(t.name) : String(t));
          setTopics(names);
        } else if (!topics.length) {
          setTopics(['Algebraic Thinking','Number Sense','Geometry Basics']);
        }
      })
      .catch(() => setTopics(['Algebraic Thinking','Number Sense','Geometry Basics']));

    fetch(`/api/topics/suggest?grade=${encodeURIComponent(student.grade || '')}&limit=20`)
      .then(r => r.ok ? r.json() : [])
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) {
          setSuggestedTopics(rows.map((t: any) => t.name ? String(t.name) : String(t)));
        }
      })
      .catch(() => {});
  };

  const toggleTopic = (name: string) => {
    setSelectedTopics((prev) => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const addParentTopic = () => {
    const val = parentInput.trim();
    if (!val) return;
    setParentTopics((prev) => [...prev, val]);
    setParentInput("");
  };

  useEffect(() => {
    let timer: any;
    if (showSubmitting && secondsLeft > 0) {
      timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    }
    if (showSubmitting && secondsLeft === 0) {
      setCanCustomize(true);
    }
    return () => clearTimeout(timer);
  }, [showSubmitting, secondsLeft]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.username) {
          setLoggedInUser(String(data.username));
        } else {
          setLoggedInUser(null);
        }
      })
      .catch(() => setLoggedInUser(null));
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setLoggedInUser(String(data.username));
        toast({ title: 'Logged in', description: `Welcome, ${data.username}` });
        setShowLogin(false);
        setUsername('');
        setPassword('');
        if (postLoginAction) {
          const action = postLoginAction;
          setPostLoginAction(null);
          action();
        }
      } else {
        toast({ title: 'Login failed', description: `${res.status} ${res.statusText}`, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', description: 'Could not login', variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setLoggedInUser(null);
        toast({ title: 'Logged out', description: 'Session ended' });
      }
    } catch {}
  };

  const handleSubmitSelection = () => {
    if (!student) return;
    if (!selectedTopics.length && !parentTopics.length) {
      toast({ title: 'Select topics', description: 'Choose at least one area of improvement or add a parent topic.' });
      return;
    }
    fetch('/api/customizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student.id, selectedTopics, parentTopics }),
    }).then(() => {
      setShowSubmitting(true);
      setSecondsLeft(30);
      setCanCustomize(false);
    }).catch(() => {
      setShowSubmitting(true);
      setSecondsLeft(30);
      setCanCustomize(false);
    });
  };

  const proceedCustomize = () => {
    setShowSubmitting(false);
    setCustomizing(false);
    setLocation(`/calculator?studentId=${student!.id}&step=2`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-20 border-b bg-white flex items-center px-8 justify-between">
        <div className="flex items-center gap-3">
          <img src="/brand-logo.png" alt="Logo" className="h-16 w-16 drop-shadow-xl" onError={(e) => { (e.target as HTMLImageElement).src = '/brand-logo.svg'; }} />
        </div>
        <div className="flex items-center gap-4">
          {!loggedInUser ? (
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2" onClick={() => setShowLogin(true)}>
              <ShieldCheck className="h-4 w-4" /> Counselor Login
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Logged in as <span className="font-medium text-foreground">{loggedInUser}</span></span>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground border-l pl-4">
            Counsellor Portal v2.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome, Counsellor</h1>
            <p className="text-lg text-muted-foreground">Enter Student ID to begin the consultation session.</p>
          </div>

          <div className="relative">
            <div className="relative flex items-center">
               <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
               <Input 
                 placeholder="Enter Student ID (e.g. ST-2025-001)" 
                 className="pl-12 h-14 text-lg shadow-sm border-2 focus-visible:ring-primary/20 transition-all"
                 value={searchId}
                 onChange={(e) => setSearchId(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               />
               <Button 
                 size="lg" 
                 className="absolute right-2 h-10 px-6"
                 onClick={handleSearch}
               >
                 Search
               </Button>
            </div>
          </div>

          {student && (
            <Card className="border-2 border-primary/10 bg-white shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
               <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
               <CardContent className="pt-6 pb-8 px-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
                    <UserCheck className="h-10 w-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
                    <p className="text-muted-foreground font-medium">{student.grade} • {student.school}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-left bg-gray-50 p-4 rounded-lg border">
                    <div>
                      <span className="text-muted-foreground text-xs uppercase">Parent</span>
                      <p className="font-medium">{student.parentName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs uppercase">Last Activity</span>
                      <p className="font-medium">{student.lastActivity}</p>
                    </div>
                  </div>

                  {!customizing ? (
                    <Button 
                      size="lg" 
                      className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                      onClick={handleStartSession}
                    >
                      Start Curriculum Customization
                    </Button>
                  ) : (
                    <div className="text-left space-y-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Areas of Improvement</h3>
                          <div className="flex items-center gap-2">
                            <Button variant={topicsView === 'grade' ? 'default' : 'outline'} size="sm" onClick={() => setTopicsView('grade')}>Grade Topics</Button>
                            <Button variant={topicsView === 'suggested' ? 'default' : 'outline'} size="sm" onClick={() => setTopicsView('suggested')}>Algorithm Suggested</Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Select one or multiple topics to focus this program.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                          {(topicsView === 'grade' ? topics : suggestedTopics).map((t) => (
                            <label key={t} className="flex items-center gap-2 border rounded-md p-3 hover:bg-primary/5">
                              <Checkbox checked={selectedTopics.includes(t)} onCheckedChange={() => toggleTopic(t)} />
                              <span className="text-sm font-medium">{t}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold">Parent Suggested Topics</h3>
                        <p className="text-sm text-muted-foreground">Add one or more suggestions shared by the parent.</p>
                        <div className="flex gap-2 mt-3">
                          <Input placeholder="e.g. Fractions, Reading speed" value={parentInput} onChange={(e) => setParentInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addParentTopic()} />
                          <Button variant="outline" onClick={addParentTopic}>Add</Button>
                        </div>
                        {!!parentTopics.length && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {parentTopics.map((p, idx) => (
                              <span key={idx} className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">{p}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => { setCustomizing(false); setSelectedTopics([]); setParentTopics([]); }}>Cancel</Button>
                        <Button onClick={handleSubmitSelection} className="shadow">Submit</Button>
                      </div>
                    </div>
                  )}
               </CardContent>
            </Card>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © 2025 PlanetSpark Education. All rights reserved.
      </footer>
      <Dialog open={showSubmitting} onOpenChange={setShowSubmitting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Spinner className="size-5" /> Preparing Custom Curriculum</DialogTitle>
            <DialogDescription>
              This may take a few seconds while we tailor the program to the selected areas.
            </DialogDescription>
          </DialogHeader>
          {!canCustomize ? (
            <div className="text-center space-y-3">
              <div className="text-5xl font-bold tabular-nums">{secondsLeft}s</div>
              <p className="text-sm text-muted-foreground">Hang tight… generating recommendations.</p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="size-6" /> Ready!
              </div>
              <Button onClick={proceedCustomize} className="w-full">Customize the Program</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Counselor Login</DialogTitle>
            <DialogDescription>Enter your credentials to continue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ID / Username</Label>
              <Input id="username" placeholder="e.g. john.doe" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowLogin(false)}>Cancel</Button>
              <Button onClick={handleLogin}>Login</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
