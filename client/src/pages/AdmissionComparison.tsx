import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

function computeSapTotals(durationMonths: number, classesPerWeek: number) {
  const tenureUnits = Math.max(1, Math.round((durationMonths || 3) / 3));
  const frequencyFactor = (classesPerWeek || 3) / 3;
  const learn = Math.round(12 * tenureUnits * frequencyFactor);
  const practice = Math.round(24 * tenureUnits * frequencyFactor);
  const perform = Math.round(24 * tenureUnits * frequencyFactor);
  const total = learn + practice + perform;
  return { learn, practice, perform, total };
}

export default function AdmissionComparison() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const { tenureMonths, classesPerWeek } = useMemo(() => {
    let tenure = 12;
    let classes = 3;
    const qTen = search.get('tenure');
    const qCls = search.get('classes');
    if (qTen) tenure = Math.max(3, Math.min(24, parseInt(qTen, 10)) || 12);
    if (qCls) classes = Number(qCls) === 5 ? 5 : 3;
    try {
      const saved = localStorage.getItem('ps_curriculum_config');
      if (saved) {
        const cfg = JSON.parse(saved);
        tenure = typeof cfg.durationMonths === 'number' ? cfg.durationMonths : tenure;
        classes = cfg.classesPerWeek === 5 ? 5 : classes;
      }
    } catch {}
    return { tenureMonths: tenure, classesPerWeek: classes };
  }, [search]);

  const sapTotals = useMemo(() => computeSapTotals(tenureMonths, classesPerWeek), [tenureMonths, classesPerWeek]);

  const [regularYears, setRegularYears] = useState<1 | 2>(1);

  const rows = useMemo(() => ([
    { k: "1:1 Classes (Personalised Learning Sessions)", regular: "1 per week", sap: "1 per week" },
    { k: "Class Ratio", regular: "1:20, 1:30", sap: "1:1" },
    { k: "Practice Sessions / Workshop", regular: "1 per week", sap: "2 per week" },
    { k: "Olympiad / competitive", regular: "NO", sap: "YES" },
    { k: "Mental Maths / Fast Calculation", regular: "NO", sap: "YES" },
    { k: "Performance classes", regular: "1 per week", sap: "2 per week" },
    { k: "Total Tenure", regular: `${regularYears} ${regularYears === 1 ? "Year" : "Years"}`, sap: `${tenureMonths} Months (Flexible)` },
    { k: "Total Classes", regular: `${regularYears === 1 ? "180 (1 Year)" : "360 (2 Years)"}`, sap: `${sapTotals.total} Sessions` },
    { k: "Observatory Sessions", regular: "-", sap: "5 Classes" },
    { k: "LMS Access", regular: "Limited", sap: "Free Lifetime Access" },
    { k: "Top Rated Coach", regular: "Regular", sap: "Parent Choice • Can change" },
    { k: "Days/Time Flexibility", regular: "NO", sap: "Yes (week, days, hours)" },
    { k: "PTM's", regular: "10 Not mandatory", sap: "After every 10 sessions (Mandatory)" },
    { k: "Payment Flexibility", regular: "NO", sap: "NO COST EMI / ONE TIME PAY" },
  ]), [tenureMonths, sapTotals.total, regularYears]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goBack = () => {
    const sp = new URLSearchParams(window.location.search);
    const studentId = sp.get("studentId") || "";
    setLocation(`/presentation?studentId=${encodeURIComponent(studentId)}`);
  };

  const proceedPricing = () => {
    toast({ title: "Benefits Ahead", description: "Now comes the main benefits to save money.", duration: 2500 });
    const sp = new URLSearchParams(window.location.search);
    const studentId = sp.get("studentId") || "";
    setTimeout(() => {
      setLocation(`/calculator?studentId=${encodeURIComponent(studentId)}&step=3`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-secondary/10">
      <header className="bg-white/80 backdrop-blur border-b px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/brand-logo.png" alt="Logo" className="h-8 w-8 drop-shadow cursor-pointer" onError={(e) => { (e.target as HTMLImageElement).src = '/brand-logo.svg'; }} onClick={() => setLocation('/')} />
          <div>
            <h1 className="font-bold text-lg">Program Comparison</h1>
            <p className="text-xs text-muted-foreground">Regular Admission vs Student Ambassador Programme (SAP)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
          <Button onClick={proceedPricing} className="gap-2">Proceed to Pricing <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </header>

      <main className="container mx-auto p-6 md:p-10 max-w-6xl space-y-8">
        <Card className="p-8 relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-primary/10 text-primary text-xs">
                <Sparkles className="h-4 w-4" /> Introducing
              </div>
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight">Student Ambassador Programme (SAP)</div>
              <p className="text-muted-foreground text-sm">
                Maximize outcomes with twice-weekly practice, flexible scheduling, lifetime LMS access, structured PTMs, and Olympiad readiness.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Twice Weekly Practice","Flexible Coach Choice","Lifetime LMS","Mandatory PTMs","Olympiad Prep"].map((b) => (
                  <span key={b} className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs border border-secondary/20">{b}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/20 p-6 border">
              <div className="text-xs text-muted-foreground">Why SAP?</div>
              <div className="text-lg font-semibold">Outcome-first, parent-friendly</div>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Practice + performance rhythm accelerates mastery</li>
                <li>Coach and schedule control to fit family routines</li>
                <li>PTMs every 10 sessions for transparent progress</li>
                <li>Zero-cost EMI or One-time pay options</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 p-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">OFFERINGS</div>
              <div className="text-sm">Detailed feature comparison to guide admission choice.</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Regular Admission</div>
              <Badge variant="secondary">Baseline</Badge>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Plan:</span>
              <Button size="sm" variant={regularYears === 1 ? "default" : "outline"} onClick={() => setRegularYears(1)}>1 Year</Button>
              <Button size="sm" variant={regularYears === 2 ? "default" : "outline"} onClick={() => setRegularYears(2)}>2 Years</Button>
            </div>
          </Card>
          <Card className="p-4 border-green-300">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Student Ambassador Programme (SAP)</div>
              <Badge className="bg-green-100 text-green-700">Recommended</Badge>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offerings</TableHead>
                <TableHead>Regular Admission</TableHead>
                <TableHead>SAP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.k}>
                  <TableCell className="font-medium max-w-xs">{r.k}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/(NO|^-$)/i.test(r.regular) ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{r.regular}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/(YES)/i.test(r.sap) || !/(NO|^-$)/i.test(r.sap) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>{r.sap}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-muted-foreground">Outcomes</div>
              <div className="font-semibold">More practice, faster progress</div>
              <p className="text-sm text-muted-foreground">Twice weekly practice and performance sessions sustain momentum.</p>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Access</div>
              <div className="font-semibold">Lifetime LMS</div>
              <p className="text-sm text-muted-foreground">Continuous practice, revision, and parent visibility even after course.</p>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Flexibility</div>
              <div className="font-semibold">Coach & schedule control</div>
              <p className="text-sm text-muted-foreground">Pick top-rated coaches and adjust days, weeks, and hours.</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs">Save more with SAP benefits</div>
          </div>
        </Card>
      </main>
    </div>
  );
}
