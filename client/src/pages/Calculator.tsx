import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { StudentDetails } from "@/components/calculator/StudentDetails";
import { CurriculumConfiguration } from "@/components/calculator/CurriculumConfig";
import { PricingSummary } from "@/components/calculator/PricingSummary";
import { Student, CurriculumConfig, PricingConfig } from "@/lib/types";
import { useLocation } from "wouter";
import { MOCK_STUDENTS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [student, setStudent] = useState<Student | null>(null);
  const [location, setLocation] = useLocation();
  
  // Parse query params for studentId and step
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const studentId = searchParams.get("studentId");
    const stepParam = searchParams.get("step");
    const classesParam = searchParams.get("classes");
    const monthsParam = searchParams.get("months");

    if (studentId) {
      fetch(`/api/students/${studentId}`)
        .then(r => r.ok ? r.json() : null)
        .then((s) => {
          if (s) {
            setStudent({ id: s.id, name: s.name, grade: s.grade || '', school: '', parentName: '', phone: '', email: '', status: s.status || 'New', lastActivity: '', areasOfImprovement: [] });
          } else {
            const fallback = MOCK_STUDENTS.find(x => x.id === studentId);
            if (fallback) setStudent(fallback);
            else setStudent({ id: studentId, name: 'Session', grade: '', school: '', parentName: '', phone: '', email: '', status: 'New', lastActivity: '', areasOfImprovement: [] });
          }
        })
        .catch(() => {
          const fallback = MOCK_STUDENTS.find(x => x.id === studentId);
          if (fallback) setStudent(fallback);
          else setStudent({ id: studentId, name: 'Session', grade: '', school: '', parentName: '', phone: '', email: '', status: 'New', lastActivity: '', areasOfImprovement: [] });
        });

      fetch(`/api/customizations/${studentId}`)
        .then(r => r.ok ? r.json() : null)
        .then((data) => {
          if (data && Array.isArray(data.selectedTopics)) {
            const tags: string[] = [...(data.selectedTopics || []), ...(data.parentTopics || [])].filter(Boolean);
            if (tags.length) {
              setCurriculum((prev) => ({ ...prev, topics: tags }));
            }
          }
        })
        .catch(() => {});
    }

    // Restore curriculum from URL or localStorage
    if (classesParam || monthsParam) {
      setCurriculum((prev) => ({
        ...prev,
        classesPerWeek: classesParam ? (parseInt(classesParam, 10) as 3 | 5) : prev.classesPerWeek,
        durationMonths: monthsParam ? Math.max(3, Math.min(24, parseInt(monthsParam, 10))) : prev.durationMonths,
      }));
    } else {
      try {
        const saved = localStorage.getItem("ps_curriculum_config");
        if (saved) {
          const cfg = JSON.parse(saved);
          setCurriculum((prev) => ({
            ...prev,
            classesPerWeek: cfg.classesPerWeek === 5 ? 5 : 3,
            durationMonths: typeof cfg.durationMonths === "number" ? cfg.durationMonths : prev.durationMonths,
            topics: Array.isArray(cfg.topics) ? cfg.topics : prev.topics,
          }));
        }
      } catch {}
    }

    if (stepParam) {
      const s = parseInt(stepParam, 10);
      if (s === 2) setStep(2);
      else if (s === 3) setStep(3);
    }
  }, []);

  

  const [curriculum, setCurriculum] = useState<CurriculumConfig>({
    methodology: "LPP",
    classesPerWeek: 3,
    durationMonths: 12,
    topics: []
  });

  const [pricing, setPricing] = useState<PricingConfig>({
    basePricePerClass: 750,
    sapEnabled: false,
    discountPercentage: 0
  });

  useEffect(() => {
    try {
      localStorage.setItem("ps_curriculum_config", JSON.stringify(curriculum));
    } catch {}
  }, [curriculum]);

  const steps = [
    { num: 1, label: "Student Details" },
    { num: 2, label: "Curriculum" },
    { num: 3, label: "Pricing" }
  ];

  return (
    <div className="min-h-screen bg-background">
       {/* Counsellor Header */}
      <header className="h-16 border-b bg-white flex items-center px-4 md:px-8 justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/brand-logo.png" alt="Logo" className="h-10 w-10 drop-shadow-xl cursor-pointer" onError={(e) => { (e.target as HTMLImageElement).src = '/brand-logo.svg'; }} onClick={() => setLocation('/')} />
          <span className="font-bold text-xl text-primary">PlanetSpark</span>
        </div>
        <div className="flex items-center gap-4">
           {student && <div className="text-sm font-medium hidden md:block text-muted-foreground">Session: {student.name}</div>}
           <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-muted-foreground">
             <LogOut className="h-4 w-4 mr-2" /> End Session
           </Button>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
        {/* Wizard Stepper */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />
          <div className="flex justify-between max-w-2xl mx-auto">
            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-2 bg-background px-4">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                    ${step >= s.num 
                      ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/10" 
                      : "bg-gray-100 text-gray-400 border border-gray-200"}
                  `}
                >
                  {s.num}
                </div>
                <span className={`text-xs font-medium ${step >= s.num ? "text-primary" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {step === 1 && (
            <StudentDetails 
              student={student} 
              setStudent={setStudent} 
              onNext={() => setStep(2)} 
            />
          )}
          {step === 2 && (
            <CurriculumConfiguration 
              config={curriculum} 
              setConfig={setCurriculum} 
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && student && (
            <PricingSummary 
              student={student}
              curriculum={curriculum}
              pricing={pricing}
              setPricing={setPricing}
              setCurriculum={setCurriculum}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
