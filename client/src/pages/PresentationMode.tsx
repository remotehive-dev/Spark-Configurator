import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MOCK_STUDENTS } from "@/lib/types";
import { useLocation } from "wouter";
import { FileText, CheckCircle2, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PresentationMode() {
  const [location, setLocation] = useLocation();
  const [student, setStudent] = useState<typeof MOCK_STUDENTS[0] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const studentId = searchParams.get("studentId");
    if (studentId) {
      const found = MOCK_STUDENTS.find(s => s.id === studentId);
      if (found) setStudent(found);
    }
    
    // Simulate generation delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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
      {/* Presentation Header */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">PS</div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Personalized Learning Plan</h1>
            <p className="text-xs text-muted-foreground">Prepared for {student?.name}</p>
          </div>
        </div>
        <Button onClick={() => setLocation(`/calculator?studentId=${student?.id}&step=3`)} className="gap-2 shadow-md">
          Proceed to Pricing <ArrowRight className="h-4 w-4" />
        </Button>
      </header>

      {/* PDF Viewer Simulation */}
      <main className="flex-1 p-8 overflow-hidden flex flex-col items-center">
         <div className="w-full max-w-5xl bg-white shadow-2xl rounded-sm min-h-[800px] border border-gray-200 relative animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col">
            
            {/* Mock PDF Toolbar */}
            <div className="bg-gray-800 text-white p-3 flex justify-between items-center text-sm">
               <div className="flex gap-4">
                 <span>Page 1 / 12</span>
                 <span className="text-gray-400">|</span>
                 <span>100%</span>
               </div>
               <div>{student?.grade}_Maths_Curriculum_v2.pdf</div>
               <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10"><FileText className="h-4 w-4" /></Button>
               </div>
            </div>

            {/* Mock PDF Content */}
            <div className="flex-1 p-16 space-y-12 bg-white relative overflow-hidden">
               {/* Watermark */}
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <span className="text-[120px] font-bold -rotate-45">PLANETSPARK</span>
               </div>

               {/* Header */}
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
                   <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                     <span className="text-gray-400 font-medium">Performance Trajectory Graph</span>
                   </div>
                   
                   <div className="space-y-2">
                     <h3 className="text-lg font-bold uppercase tracking-wider text-gray-400">Selected Focus Areas</h3>
                     <div className="flex flex-wrap gap-2">
                       {['Vedic Maths', 'Olympiad Prep', 'Critical Thinking'].map(tag => (
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
         </div>
      </main>
    </div>
  );
}
