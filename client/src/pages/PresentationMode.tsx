import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FileText, CheckCircle2, ArrowRight, Loader2, Sparkles, Download, Printer, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function PresentationMode() {
  const [location, setLocation] = useLocation();
  const [student, setStudent] = useState<{ id: string; name: string; grade?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [tenure, setTenure] = useState<string>("6");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const studentId = searchParams.get("studentId");
    const tenureParam = searchParams.get("tenure");
    if (tenureParam) setTenure(tenureParam);
    if (studentId) {
      fetch(`/api/students/${studentId}`)
        .then(r => r.ok ? r.json() : null)
        .then((s) => {
          if (s && s.id) {
            setStudent({ id: s.id, name: s.name, grade: s.grade });
            const gradeStr = String(s.grade || "");
            const candidates = [gradeStr, gradeStr && gradeStr.match(/^\d+$/) ? `Grade ${gradeStr}` : ""].filter(Boolean);
            const tryFetch = async () => {
              for (const g of candidates) {
                const res = await fetch(`/api/curriculum-files?grade=${encodeURIComponent(g)}`);
                if (res.ok) {
                  const rows = await res.json();
                  const first = Array.isArray(rows) && rows.length ? rows[0] : null;
                  if (first?.url) { setPdfUrl(String(first.url)); return; }
                }
              }
              const resAny = await fetch(`/api/curriculum-files`);
              if (resAny.ok) {
                const rows = await resAny.json();
                const first = Array.isArray(rows) && rows.length ? rows[0] : null;
                if (first?.url) setPdfUrl(String(first.url));
              }
            };
            tryFetch().catch(() => {});
          }
        })
        .catch(() => {});
      fetch(`/api/customizations/${studentId}`)
        .then(r => r.ok ? r.json() : null)
        .then((data) => {
          if (data && Array.isArray(data.selectedTopics)) {
            const tags = [...(data.selectedTopics || []), ...(data.parentTopics || [])].filter(Boolean);
            setFocusAreas(tags);
          }
        })
        .catch(() => {});
    }
    const timer = setTimeout(() => { setLoading(false); }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const graphData = (() => {
    const months = parseInt(tenure, 10) || 6;
    const xUnits = Math.max(1, Math.round(months / 3));
    const arr: { month: string; score: number }[] = [];
    const totalPoints = Math.max(6, xUnits * 2);
    for (let i = 1; i <= totalPoints; i++) {
      const base = 40;
      const slope = 60 / totalPoints;
      const value = Math.min(100, base + i * slope);
      arr.push({ month: `P${i}`, score: Number(value.toFixed(1)) });
    }
    return arr;
  })();

  const handleDownloadPdf = async () => {
    if (!pdfUrl || !student) return;
    try {
      const res = await fetch(pdfUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = `${(student.name || 'Student').replace(/[^a-zA-Z0-9_\- ]/g, '')}_${(student.grade || '').replace(/[^a-zA-Z0-9_\- ]/g, '')}.pdf`;
      a.href = url; a.download = safeName || 'report.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handlePrintPdf = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-6">
         <div className="relative">
           <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
           <div className="relative bg-white p-6 rounded-full shadow-xl">
             <Loader2 className="h-12 w-12 text-primary animate-spin" />
           </div>
         </div>
         <div className="text-center space-y-2 animate-pulse">
           <h2 className="text-2xl font-bold text-primary">Generating Customized Curriculum...</h2>
           <p className="text-muted-foreground">Analyzing student profile and selected focus areas</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <img src="/brand-logo.png" alt="Logo" className="h-8 w-8 drop-shadow" onError={(e) => { (e.target as HTMLImageElement).src = '/brand-logo.svg'; }} />
          <div>
            <h1 className="font-bold text-lg text-foreground">Personalized Learning Plan</h1>
            <p className="text-xs text-muted-foreground">Prepared for {student?.name} • {student?.grade}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setLocation(`/calculator?studentId=${student?.id}&step=2`)}>
            Back
          </Button>
          <Select value={tenure} onValueChange={setTenure}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['3','6','9','12','15','18','21','24'].map(m => (<SelectItem key={m} value={m}>{m} months</SelectItem>))}
            </SelectContent>
          </Select>
          <Button onClick={() => setLocation(`/calculator?studentId=${student?.id}&step=3`)} className="gap-2 shadow-md">
            Proceed to Pricing <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* PDF Viewer Simulation */}
      <main className="flex-1 p-8 overflow-hidden flex flex-col items-center">
         <div className="w-full max-w-5xl bg-white shadow-2xl rounded-sm min-h-[800px] border border-gray-200 relative animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col">
            
            <div className="bg-gray-800 text-white p-3 flex justify-between items-center text-sm">
               <div className="flex items-center gap-2">
                 <Trophy className="h-4 w-4 text-yellow-400" />
                 <span>Congratulations! This personalized report is prepared for {student?.name} ({student?.grade}).</span>
               </div>
               <div className="flex gap-2">
                 <Button variant="ghost" size="sm" className="h-8" onClick={handleDownloadPdf}><Download className="h-4 w-4" /> Download</Button>
                 <Button variant="ghost" size="sm" className="h-8" onClick={handlePrintPdf}><Printer className="h-4 w-4" /> Print</Button>
               </div>
            </div>

            <div className="flex-1 p-16 space-y-12 bg-white relative overflow-hidden">
               {/* Watermark */}
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <span className="text-[120px] font-bold -rotate-45">PLANETSPARK</span>
               </div>

               <div className="flex justify-between items-end border-b-2 border-primary pb-6">
                 <div className="space-y-4">
                   <h1 className="text-5xl font-bold text-primary tracking-tight">Mathematics <br/>Mastery Program</h1>
                   <div className="flex items-center gap-2 text-xl text-secondary font-medium">
                     <Sparkles className="h-6 w-6" />
                     Customized for {student?.name}
                   </div>
                 </div>
                 <div className="text-right space-y-1 text-sm text-gray-500">
                   <p>Generated: {new Date().toLocaleDateString()}</p>
                   <p>ID: {student?.id}</p>
                 </div>
               </div>

               {/* Content Blocks */}
               <div className="grid grid-cols-2 gap-12">
                 <div className="space-y-6">
                   <div className="space-y-2">
                     <h3 className="text-lg font-bold uppercase tracking-wider text-gray-400">Core Modules</h3>
                     <ul className="space-y-3">
                       {['Mental Arithmetic', 'Logical Reasoning', 'Speed Calculation', 'Data Interpretation'].map(item => (
                         <li key={item} className="flex items-center gap-3 text-lg font-medium">
                           <CheckCircle2 className="h-5 w-5 text-success" /> {item}
                         </li>
                       ))}
                     </ul>
                   </div>

                   <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                     <h4 className="font-bold text-blue-900 mb-2">Learning Outcomes</h4>
                     <p className="text-blue-800/80 leading-relaxed">
                       By the end of this module, {student?.name} will demonstrate 3x faster calculation speed and improved confidence in problem-solving scenarios.
                     </p>
                   </div>
                 </div>

                 <div className="space-y-6">
                   <div className="h-56 bg-gray-50 rounded-lg border">
                     <div className="h-56 p-2">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={graphData}>
                           <CartesianGrid strokeDasharray="3 3" />
                           <XAxis dataKey="month" />
                           <YAxis domain={[0, 100]} />
                           <Tooltip />
                           <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
                         </LineChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                   
                     <div className="space-y-2">
                       <h3 className="text-lg font-bold uppercase tracking-wider text-gray-400">Selected Focus Areas</h3>
                       <div className="flex flex-wrap gap-2">
                         {focusAreas.map(tag => (
                           <span key={tag} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium border border-secondary/20">
                             {tag}
                           </span>
                         ))}
                       </div>
                     </div>
                 </div>
              </div>

               {/* Footer */}
               <div className="absolute bottom-12 left-16 right-16 border-t pt-4 flex justify-between text-xs text-gray-400">
                 <span>Confident Communicators & Problem Solvers</span>
                 <span>Page 1</span>
               </div>
            </div>
            {pdfUrl && (
              <div className="border-t">
                <iframe src={pdfUrl} className="w-full min-h-[800px]" title="Curriculum Preview" />
              </div>
            )}
         </div>
      </main>
    </div>
  );
}
