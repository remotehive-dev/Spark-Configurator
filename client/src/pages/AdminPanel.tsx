import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Users,
  FileText,
  Filter,
  Search,
  Trash2,
  Upload,
  Plus,
  Pencil,
  X,
  Save
} from "lucide-react";
import { Link } from "wouter";
import { TOPICS, updateTopics } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState("Grade 5");
  const [userStats, setUserStats] = useState<{ total: number; active: number; inactive: number }>({ total: 0, active: 0, inactive: 0 });
  const [usersList, setUsersList] = useState<{ id: string; username: string }[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  
  // Topic Management State
  const [topics, setTopics] = useState(TOPICS);
  const [newTopic, setNewTopic] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState([] as { grade: string; date: string; name: string; url?: string }[]);

  const CATALOG: { grade: string; category: string; topics: string[] }[] = [
    { grade: 'UKG', category: 'Foundational Skills', topics: ['Number Sense','Counting','Place Value (Units, Tens)','Skip Counting (2s, 5s, 10s)','Odd & Even Numbers','Comparison & Ordering','Basic Addition','Basic Subtraction','Estimation','Number Lines','Visual Thinking','Basic Word Problems','Shapes (2D & 3D)','Symmetry','Time Reading (Analog & Digital)'] },
    { grade: 'Grade 1', category: 'Foundational Skills', topics: ['Number Sense','Counting','Place Value (Units, Tens)','Skip Counting (2s, 5s, 10s)','Odd & Even Numbers','Comparison & Ordering','Basic Addition','Basic Subtraction','Estimation','Number Lines','Visual Thinking','Basic Word Problems','Shapes (2D & 3D)','Symmetry','Time Reading (Analog & Digital)'] },
    { grade: 'Grade 2', category: 'Foundational Skills', topics: ['Number Sense','Counting','Place Value (Units, Tens)','Skip Counting (2s, 5s, 10s)','Odd & Even Numbers','Comparison & Ordering','Basic Addition','Basic Subtraction','Estimation','Number Lines','Visual Thinking','Basic Word Problems','Shapes (2D & 3D)','Symmetry','Time Reading (Analog & Digital)'] },
    { grade: 'Grade 3', category: 'Foundational Skills', topics: ['Number Sense','Counting','Place Value (Units, Tens)','Skip Counting (2s, 5s, 10s)','Odd & Even Numbers','Comparison & Ordering','Basic Addition','Basic Subtraction','Estimation','Number Lines','Visual Thinking','Basic Word Problems','Shapes (2D & 3D)','Symmetry','Time Reading (Analog & Digital)'] },
    { grade: 'Grade 4', category: 'Primary Math', topics: ['Multi-Digit Addition','Multi-Digit Subtraction','Multiplication','Division','Fractions (Basics)','Decimals (Basics)','Measurement (Length, Weight, Money)','Vedic Math Basics','Urdhva-Tiryak Sutra','Nikhilam Sutra','Split & Merge Addition','Reverse Counting Subtraction','Fast Addition / Completing the Whole','Patterns (Number & Shape)','Data Handling (Pictographs, Bar Graphs)'] },
    { grade: 'Grade 5', category: 'Primary Math', topics: ['Multi-Digit Addition','Multi-Digit Subtraction','Multiplication','Division','Fractions (Basics)','Decimals (Basics)','Measurement (Length, Weight, Money)','Vedic Math Basics','Urdhva-Tiryak Sutra','Nikhilam Sutra','Split & Merge Addition','Reverse Counting Subtraction','Fast Addition / Completing the Whole','Patterns (Number & Shape)','Data Handling (Pictographs, Bar Graphs)'] },
    { grade: 'Grade 6', category: 'Upper Primary', topics: ['Advanced Arithmetic','Squaring Shortcuts','Cubing Shortcuts','Fast Percentages','Profit & Loss','Pre-Algebra','Simplifying Expressions','Linear Equations (Introduction)','Ratio & Proportion','Basic Probability','Speed, Distance, Time','Geometry Basics (Area, Perimeter)','Pythagorean Triples (Pattern Method)','Budgeting Applications'] },
    { grade: 'Grade 7', category: 'Upper Primary', topics: ['Advanced Arithmetic','Squaring Shortcuts','Cubing Shortcuts','Fast Percentages','Profit & Loss','Pre-Algebra','Simplifying Expressions','Linear Equations (Introduction)','Ratio & Proportion','Basic Probability','Speed, Distance, Time','Geometry Basics (Area, Perimeter)','Pythagorean Triples (Pattern Method)','Budgeting Applications'] },
    { grade: 'Grade 8', category: 'Middle School', topics: ['Rational Numbers','Linear Equations (One Variable)','Algebraic Expressions & Identities','Squares & Square Roots','Cubes & Cube Roots','Polygons','Quadrilaterals','Angle Sum Theorem','Construction (Lines, Diagonals)','Data Handling (Bar, Pie Charts)','Basic Probability','Surface Area & Volume (Cube, Cuboid, Cylinder)','Financial Math (Percentages, Profit/Loss, Simple & Compound Interest Basics)'] },
    { grade: 'Grade 9', category: 'High School', topics: ['Real Numbers (Rational/Irrational)','Exponents (Real Numbers)','Polynomials (Factorization, Zeroes)','Coordinate Geometry (Intro)','Euclid’s Geometry','Lines & Angles','Triangles (Congruence)','Quadrilaterals','Circles (Chords, Cyclic Quadrilateral)','Heron’s Formula','Surface Areas & Volumes (Cone, Sphere, Hemisphere)','Statistics (Histogram, Frequency Polygon)'] },
    { grade: 'Grade 10', category: 'High School', topics: ['Euclid’s Algorithm','Fundamental Theorem of Arithmetic','Polynomial Division Algorithm','Linear Equations in Two Variables','Quadratic Equations','Arithmetic Progressions','Similar Triangles','Trigonometry Basics','Ratios','Identities','Heights & Distances','Coordinate Geometry (Distance, Section Formula)','Surface Area & Volume (Composite Figures)','Statistics (Mean, Median, Mode, Ogive)','Probability (Basic & Combined Events)'] },
    { grade: 'Grade 11', category: 'Senior Secondary', topics: ['Sets','Relations & Functions','Trigonometric Functions (Advanced)','Complex Numbers','Sequence & Series (AP, GP, AM–GM)','Permutations & Combinations','Binomial Theorem','Straight Lines (Coordinate Geometry)','Conic Sections (Circle, Parabola, Ellipse, Hyperbola)','3D Geometry (Basics)','Limits','Derivatives','Probability (Advanced)'] },
    { grade: 'Grade 12', category: 'Senior Secondary', topics: ['Functions & Inverses','Inverse Trigonometric Functions','Matrices','Determinants','Continuity & Differentiability','Applications of Derivatives','Indefinite Integrals','Definite Integrals','Area Under Curve','Differential Equations','Vector Algebra','Probability (Conditional, Bayes)','3D Geometry (Lines & Planes)'] },
  ];

  const GENERAL_SKILLS: { category: string; topics: string[] }[] = [
    { category: 'Mental Ability', topics: ['Mental Math Speed','Number Sense','Quick Estimation','Visualization','Logical Reasoning','Pattern Recognition','Deductive Reasoning','Analytical Thinking','Sequences & Series','Puzzles & Brain Teasers'] },
    { category: 'Application Skills', topics: ['Word Problems','Real-Life Math','Budgeting & Finance','Shopping Discounts','Time, Speed & Distance'] },
    { category: 'School Syllabus (Board-Aligned Sections)', topics: ['CBSE aligned','ICSE aligned','State Board aligned'] },
    { category: 'Vedic Math', topics: ['Fast Addition','Fast Subtraction','Multiplication Tricks','Division Tricks','Squaring Tricks','9s & 11s Multiplication','Nikhilam Sutra','Urdhva Tiryak Sutra'] },
    { category: 'Communication & Explanation Skills (PlanetSpark Style)', topics: ['Math Presentation Skills','Explain Your Reasoning','Problem Solving Confidence'] },
  ];

  const [selectedCatalog, setSelectedCatalog] = useState<Record<string, Set<string>>>({});

  const toggleCatalogTopic = (grade: string | null, category: string, topic: string) => {
    const key = `${grade ?? 'General'}::${category}`;
    setSelectedCatalog((prev) => {
      const next = { ...prev };
      const set = new Set(next[key] || []);
      if (set.has(topic)) set.delete(topic); else set.add(topic);
      next[key] = set;
      return next;
    });
  };

  const selectAllCategory = (grade: string | null, category: string, topics: string[]) => {
    const key = `${grade ?? 'General'}::${category}`;
    setSelectedCatalog((prev) => ({ ...prev, [key]: new Set(topics) }));
  };

  const clearCategory = (grade: string | null, category: string) => {
    const key = `${grade ?? 'General'}::${category}`;
    setSelectedCatalog((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleImportClick = () => {
    document.getElementById('excel-upload')?.click();
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return;
      const header = lines[0].split(",").map(h => h.trim().toLowerCase());
      const idx = (k: string) => header.indexOf(k);
      const rows = lines.slice(1).map(line => {
        const cols = line.split(",").map(c => c.trim());
        return {
          id: cols[idx("lead id")] || cols[idx("id")] || cols[0],
          name: cols[idx("name")] || cols[1],
          grade: cols[idx("grade")] || cols[2],
          status: cols[idx("status")] || cols[3],
          board: cols[idx("board")] || cols[4],
          sapEligible: ((cols[idx("elegible for sap")] || cols[idx("eligible for sap")] || "no").toLowerCase() === "yes")
        };
      }).filter(r => r.id && r.name);
      try {
        const res = await fetch('/api/students/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows) });
        if (res.ok) {
          toast({ title: 'Success', description: `Imported ${rows.length} leads.` });
          // refresh list
          fetch('/api/students').then(r => r.json()).then(setStudents).catch(() => {});
        } else {
          toast({ title: 'Import failed', description: `${res.status} ${res.statusText}` });
        }
      } catch (err) {
        toast({ title: 'Import error', description: 'Could not import CSV' });
      }
    };
    reader.readAsText(file);
  };

  const handleCreateLead = async () => {
    if (!newLead.id || !newLead.name) {
      toast({ title: 'Missing fields', description: 'Lead ID and Name are required.' });
      return;
    }
    try {
      const res = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newLead) });
      if (res.ok) {
        toast({ title: 'Lead Created', description: `${newLead.name} added.` });
        setNewLead({ id: '', name: '', grade: '', status: 'New', board: 'CBSE', sapEligible: false });
        fetch('/api/students').then(r => r.json()).then(setStudents).catch(() => {});
      } else {
        toast({ title: 'Create failed', description: `${res.status} ${res.statusText}` });
      }
    } catch {
      toast({ title: 'Network error', description: 'Could not create lead' });
    }
  };

  const handleCurriculumClick = () => {
    document.getElementById('pdf-upload')?.click();
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({ title: 'Uploading...', description: `Uploading ${file.name} for ${selectedGrade}...` });
    const form = new FormData();
    form.append('file', file);
    form.append('grade', selectedGrade);
    form.append('topic', topics[0] || '');
    try {
      const res = await fetch('/api/upload-curriculum', { method: 'POST', body: form });
      if (res.ok) {
        const data = await res.json();
        const entry = {
          grade: data.grade || selectedGrade,
          name: data.name || file.name,
          date: (data.createdAt || data.created_at || new Date().toISOString()).toString(),
          url: data.url,
        };
        setUploadedFiles(prev => [entry, ...prev]);
        toast({ title: 'Upload Complete', description: 'Curriculum PDF updated successfully.', className: 'bg-green-50 border-green-200 text-green-800' });
      } else {
        toast({ title: 'Upload failed', description: `${res.status} ${res.statusText}` });
      }
    } catch (err) {
      toast({ title: 'Network error', description: 'Could not upload file' });
    }
  };

  // Topic Management Functions
  const handleAddTopic = () => {
    if (newTopic.trim()) {
      const updated = [...topics, newTopic.trim()];
      setTopics(updated);
      updateTopics(updated);
      fetch('/api/topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newTopic.trim(), grade: selectedGrade, category: 'Manual' }) }).catch(() => {});
      setNewTopic("");
      toast({
        title: "Topic Added",
        description: `"${newTopic}" has been added to Areas of Improvement.`,
      });
    }
  };

  const handleDeleteTopic = (index: number) => {
    const updated = topics.filter((_, i) => i !== index);
    setTopics(updated);
    updateTopics(updated);
    // find topic id by name then delete; since we only have names loaded, skip server delete for now
    toast({
      title: "Topic Removed",
      description: "Area of improvement removed successfully.",
    });
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(topics[index]);
  };

  const saveEdit = (index: number) => {
    if (editValue.trim()) {
      const updated = [...topics];
      updated[index] = editValue.trim();
      setTopics(updated);
      updateTopics(updated);
      setEditingIndex(null);
      toast({
        title: "Topic Updated",
        description: "Area of improvement updated successfully.",
      });
    }
  };

  const [students, setStudents] = useState<{id: string; name: string; grade?: string; status?: string; board?: string; sapEligible?: boolean}[]>([]);
  const [newLead, setNewLead] = useState<{id: string; name: string; grade: string; status: string; board: string; sapEligible: boolean}>(
    { id: "", name: "", grade: "", status: "New", board: "CBSE", sapEligible: false }
  );

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // fetch initial data from API
  useEffect(() => {
    fetch(`/api/topics?grade=${encodeURIComponent(selectedGrade)}`)
      .then(r => r.json())
      .then((data: { id?: string; name: string }[]) => {
        const names = data.map(d => d.name);
        setTopics(names);
      })
      .catch(() => {});

    fetch('/api/students')
      .then(r => r.json())
      .then((rows) => setStudents(rows))
      .catch(() => {});

    fetch('/api/curriculum-files')
      .then(r => r.json())
      .then((rows: any[]) => setUploadedFiles(rows.map((r) => ({ grade: r.grade, name: r.name, date: (r.createdAt || r.created_at || '').toString(), url: r.url }))))
      .catch(() => {});

    fetch('/api/admin/users/stats')
      .then(r => r.json())
      .then(setUserStats)
      .catch(() => {});

    fetch('/api/admin/users')
      .then(r => r.json())
      .then(setUsersList)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/topics?grade=${encodeURIComponent(selectedGrade)}`)
      .then(r => r.json())
      .then((data: { id?: string; name: string }[]) => setTopics(data.map(d => d.name)))
      .catch(() => {});
  }, [selectedGrade]);

  useEffect(() => {
    const es = new EventSource('/api/topics/stream');
    const onMessage = (e: MessageEvent) => {
      try {
        const rows = JSON.parse(e.data) as any[];
        const filtered = rows.filter((t: any) => String(t.grade || '').toLowerCase() === selectedGrade.toLowerCase());
        setTopics((filtered.length ? filtered : rows).map((t: any) => t.name));
      } catch {}
    };
    es.addEventListener('message', onMessage);
    return () => {
      es.removeEventListener('message', onMessage as any);
      es.close();
    };
  }, [selectedGrade]);

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-bold text-foreground">Admin Control Panel</h1>
             <p className="text-muted-foreground">Manage leads, curriculum assets, and system configurations.</p>
          </div>
          <Link href="/">
             <Button variant="outline" className="gap-2">
               <ArrowLeft className="h-4 w-4" /> Back to Counsellor View
             </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                   <h3 className="text-2xl font-bold mt-2">{students.length}</h3>
                 </div>
                 <div className="p-2 bg-primary/10 rounded-lg">
                   <BarChart3 className="h-5 w-5 text-primary" />
                 </div>
               </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-sm font-medium text-muted-foreground">Active Counsellors</p>
                   <h3 className="text-2xl font-bold mt-2">{userStats.active}</h3>
                 </div>
                 <div className="p-2 bg-secondary/10 rounded-lg">
                   <CheckCircle className="h-5 w-5 text-secondary" />
                 </div>
               </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-sm font-medium text-muted-foreground">Total Counsellors</p>
                   <h3 className="text-2xl font-bold mt-2">{userStats.total}</h3>
                 </div>
                 <div className="p-2 bg-success/10 rounded-lg">
                   <Users className="h-5 w-5 text-success" />
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Counsellor Users</CardTitle>
              <CardDescription>Manage counselor accounts (admin confirmation required)</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="counsellor@planetspark.in" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showNewUserPassword ? 'text' : 'password'} placeholder="••••••••" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShowNewUserPassword(v => !v)}>
                    {showNewUserPassword ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Admin Confirmation</Label>
                <Input type="password" placeholder="Admin password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={async () => {
                if (!newUserEmail || !newUserPassword) { toast({ title: 'Missing fields', description: 'Email and password are required.' }); return; }
                try {
                  const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: newUserEmail, password: newUserPassword, adminPassword }) });
                  if (res.ok) {
                    toast({ title: 'User created', description: newUserEmail });
                    setNewUserEmail(''); setNewUserPassword('');
                    fetch('/api/admin/users').then(r => r.json()).then(setUsersList).catch(() => {});
                    fetch('/api/admin/users/stats').then(r => r.json()).then(setUserStats).catch(() => {});
                  } else {
                    toast({ title: 'Create failed', description: `${res.status} ${res.statusText}` });
                  }
                } catch { toast({ title: 'Network error', description: 'Could not create user' }); }
              }}>Add User</Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-9" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              </div>
              <Button variant="outline" onClick={() => {
                const q = userSearch.trim();
                fetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(r => r.json()).then(setUsersList).catch(() => {});
              }}>Filter</Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-mono text-xs">{u.id}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Reset Password</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                                <DialogDescription>Enter new password and admin confirmation</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3">
                                <Input type="password" placeholder="New password" id={`new-pass-${u.id}`} />
                                <Input type="password" placeholder="Admin password" id={`admin-pass-${u.id}`} />
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost">Cancel</Button>
                                  <Button onClick={async () => {
                                    const newPass = (document.getElementById(`new-pass-${u.id}`) as HTMLInputElement)?.value;
                                    const adminPass = (document.getElementById(`admin-pass-${u.id}`) as HTMLInputElement)?.value;
                                    if (!newPass || !adminPass) { toast({ title: 'Missing fields', description: 'Provide new and admin passwords.' }); return; }
                                    try {
                                      const res = await fetch(`/api/admin/users/${u.id}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword: newPass, adminPassword: adminPass }) });
                                      if (res.ok) {
                                        toast({ title: 'Password reset', description: u.username });
                                      } else {
                                        toast({ title: 'Reset failed', description: `${res.status} ${res.statusText}` });
                                      }
                                    } catch { toast({ title: 'Network error', description: 'Could not reset password' }); }
                                  }}>Save</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
                            try {
                              const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminPassword }) });
                              if (res.status === 204) {
                                toast({ title: 'User removed', description: u.username });
                                setUsersList((prev) => prev.filter(x => x.id !== u.id));
                                fetch('/api/admin/users/stats').then(r => r.json()).then(setUserStats).catch(() => {});
                              } else {
                                toast({ title: 'Delete failed', description: `${res.status} ${res.statusText}` });
                              }
                            } catch { toast({ title: 'Network error', description: 'Could not delete user' }); }
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lead Management Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                   <CardTitle>Lead Management</CardTitle>
                   <CardDescription>View and manage student leads</CardDescription>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    id="excel-upload" 
                    className="hidden" 
                    accept=".xlsx, .xls, .csv"
                    onChange={handleExcelFileChange}
                  />
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleImportClick}>
                    <Upload className="h-4 w-4" />
                    Import Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <Input placeholder="Lead ID" value={newLead.id} onChange={(e) => setNewLead({ ...newLead, id: e.target.value })} />
                    <Input placeholder="Name" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} />
                    <Input placeholder="Grade" value={newLead.grade} onChange={(e) => setNewLead({ ...newLead, grade: e.target.value })} />
                    <Select value={newLead.status} onValueChange={(v) => setNewLead({ ...newLead, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["New","Contacted","Demo Completed","Enrolled"].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newLead.board} onValueChange={(v) => setNewLead({ ...newLead, board: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["CBSE","ICSE","IGCSE","SSC","State Board"].map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground">
                      <input type="checkbox" className="mr-2" checked={newLead.sapEligible} onChange={(e) => setNewLead({ ...newLead, sapEligible: e.target.checked })} />
                      Eligible for SAP
                    </label>
                    <Button onClick={handleCreateLead} className="ml-auto">Add Lead</Button>
                  </div>
                  <div className="flex gap-2">
                     <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search leads..." 
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <Button variant="ghost" size="icon">
                       <Filter className="h-4 w-4 text-muted-foreground" />
                     </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Board</TableHead>
                          <TableHead>SAP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-mono text-xs">{student.id}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.grade}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{student.status}</Badge>
                            </TableCell>
                            <TableCell>{student.board}</TableCell>
                            <TableCell>{student.sapEligible ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Curriculum & Topics */}
          <div className="space-y-6">
             {/* Curriculum Upload */}
             <Card>
               <CardHeader>
                 <CardTitle>Curriculum Assets</CardTitle>
                 <CardDescription>Upload grade-wise curriculum PDFs</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="space-y-2">
                   <Label>Select Grade</Label>
                   <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {['UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                         <SelectItem key={g} value={g}>{g}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2 hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleCurriculumClick}>
                    <input 
                      type="file" 
                      id="pdf-upload" 
                      className="hidden" 
                      accept=".pdf, .docx"
                      onChange={handlePdfFileChange}
                    />
                    <div className="p-3 bg-primary/10 rounded-full">
                       <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Click to upload PDF</p>
                      <p className="text-xs text-muted-foreground">PDF, DOCX up to 10MB</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <Label className="text-xs uppercase text-muted-foreground">Recent Uploads</Label>
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border text-sm animate-in fade-in slide-in-from-top-2">
                         <div className="flex items-center gap-3">
                           <FileText className="h-4 w-4 text-primary" />
                           <div className="flex flex-col">
                             <span className="font-medium">{file.grade}</span>
                             <span className="text-xs text-muted-foreground">{file.name}</span>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] text-muted-foreground">{file.date}</span>
                           <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10">
                             <Trash2 className="h-3 w-3" />
                           </Button>
                         </div>
                      </div>
                    ))}
                 </div>
               </CardContent>
             </Card>

             {/* Topic Management */}
             <Card>
              <CardHeader>
                <CardTitle>Areas of Improvement</CardTitle>
                <CardDescription>Manage customizable topics for students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Viewing topics for <span className="font-medium">{selectedGrade}</span></div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const groups = CATALOG.filter(c => c.grade === selectedGrade);
                        const payload: { name: string; grade?: string; category?: string }[] = [];
                        groups.forEach((grp) => {
                          grp.topics.forEach((name) => payload.push({ name, grade: grp.grade, category: grp.category }));
                        });
                        if (!payload.length) { toast({ title: 'No catalog for grade', description: selectedGrade }); return; }
                        try {
                          const res = await fetch('/api/topics/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                          if (res.ok) {
                            toast({ title: 'Seeded grade topics', description: `${payload.length} topics added for ${selectedGrade}` });
                            fetch(`/api/topics?grade=${encodeURIComponent(selectedGrade)}`).then(r => r.json()).then((data: any[]) => setTopics(data.map(d => d.name))).catch(() => {});
                          } else {
                            toast({ title: 'Seed failed', description: `${res.status} ${res.statusText}` });
                          }
                        } catch {
                          toast({ title: 'Network error', description: 'Could not seed grade topics.' });
                        }
                      }}
                    >Seed Selected Grade</Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const payload: { name: string; grade?: string; category?: string }[] = [];
                        GENERAL_SKILLS.forEach((grp) => grp.topics.forEach((name) => payload.push({ name, category: grp.category })));
                        try {
                          const res = await fetch('/api/topics/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                          if (res.ok) {
                            toast({ title: 'Seeded general skills', description: `${payload.length} topics added` });
                            fetch(`/api/topics?grade=${encodeURIComponent(selectedGrade)}`).then(r => r.json()).then((data: any[]) => setTopics(data.map(d => d.name))).catch(() => {});
                          } else {
                            toast({ title: 'Seed failed', description: `${res.status} ${res.statusText}` });
                          }
                        } catch {
                          toast({ title: 'Network error', description: 'Could not seed general skills.' });
                        }
                      }}
                    >Seed General Skills</Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add new topic..." 
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                  />
                  <Button size="icon" onClick={handleAddTopic}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    {['UKG','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map((g) => {
                      const groups = CATALOG.filter(c => c.grade === g);
                      if (!groups.length) return null;
                      return (
                        <AccordionItem key={g} value={g}>
                          <AccordionTrigger>
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{g}</span>
                              <span className="text-xs text-muted-foreground">{groups.length} category</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {groups.map((grp, idx) => {
                                const key = `${g}::${grp.category}`;
                                const selectedSet = selectedCatalog[key] || new Set<string>();
                                return (
                                  <div key={idx} className="border rounded-md p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">{grp.category}</span>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => selectAllCategory(g, grp.category, grp.topics)}>Select All</Button>
                                        <Button variant="ghost" size="sm" onClick={() => clearCategory(g, grp.category)}>Clear</Button>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {grp.topics.map((t) => (
                                        <label key={t} className="flex items-center gap-2 p-2 rounded-md border hover:bg-primary/5 cursor-pointer">
                                          <input type="checkbox" checked={selectedSet.has(t)} onChange={() => toggleCatalogTopic(g, grp.category, t)} />
                                          <span className="text-sm">{t}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="general">
                      <AccordionTrigger>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">General Skill-Based Categories</span>
                          <span className="text-xs text-muted-foreground">{GENERAL_SKILLS.length} category</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {GENERAL_SKILLS.map((grp, idx) => {
                            const key = `General::${grp.category}`;
                            const selectedSet = selectedCatalog[key] || new Set<string>();
                            return (
                              <div key={idx} className="border rounded-md p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{grp.category}</span>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => selectAllCategory(null, grp.category, grp.topics)}>Select All</Button>
                                    <Button variant="ghost" size="sm" onClick={() => clearCategory(null, grp.category)}>Clear</Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {grp.topics.map((t) => (
                                    <label key={t} className="flex items-center gap-2 p-2 rounded-md border hover:bg-secondary/5 cursor-pointer">
                                      <input type="checkbox" checked={selectedSet.has(t)} onChange={() => toggleCatalogTopic(null, grp.category, t)} />
                                      <span className="text-sm">{t}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex justify-end">
                    <Button
                      onClick={async () => {
                        const payload: { name: string; grade?: string; category?: string }[] = [];
                        Object.entries(selectedCatalog).forEach(([key, set]) => {
                          const [grade, category] = key.split('::');
                          set.forEach((name) => {
                            payload.push({ name, grade: grade === 'General' ? undefined : grade, category });
                          });
                        });
                        if (!payload.length) {
                          toast({ title: 'No selection', description: 'Select topics to add.' });
                          return;
                        }
                        try {
                          const res = await fetch('/api/topics/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                          if (res.ok) {
                            toast({ title: 'Topics added', description: `Inserted ${payload.length} topics.` });
                            fetch('/api/topics').then(r => r.json()).then((data: any[]) => setTopics(data.map(d => d.name))).catch(() => {});
                          } else {
                            toast({ title: 'Add failed', description: `${res.status} ${res.statusText}` });
                          }
                        } catch {
                          toast({ title: 'Network error', description: 'Could not add topics.' });
                        }
                      }}
                    >
                      Add Selected Topics
                    </Button>
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                  {topics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border text-sm group">
                      {editingIndex === index ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <Input 
                            value={editValue} 
                             onChange={(e) => setEditValue(e.target.value)}
                             className="h-7 text-sm"
                             autoFocus
                           />
                           <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600" onClick={() => saveEdit(index)}>
                             <Save className="h-3 w-3" />
                           </Button>
                           <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-500" onClick={() => setEditingIndex(null)}>
                             <X className="h-3 w-3" />
                           </Button>
                         </div>
                       ) : (
                         <>
                           <span>{topic}</span>
                           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-600" onClick={() => startEditing(index)}>
                               <Pencil className="h-3 w-3" />
                             </Button>
                             <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDeleteTopic(index)}>
                               <Trash2 className="h-3 w-3" />
                             </Button>
                           </div>
                         </>
                       )}
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
