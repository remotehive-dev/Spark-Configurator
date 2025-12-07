import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { StudentDetails } from "@/components/calculator/StudentDetails";
import { CurriculumConfiguration } from "@/components/calculator/CurriculumConfig";
import { PricingSummary } from "@/components/calculator/PricingSummary";
import { Student, CurriculumConfig, PricingConfig } from "@/lib/types";
import { useLocation } from "wouter";
import { MOCK_STUDENTS } from "@/lib/types";

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [student, setStudent] = useState<Student | null>(null);
  const [location] = useLocation();
  
  // Parse query params for studentId
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const studentId = searchParams.get("studentId");
    if (studentId) {
      const found = MOCK_STUDENTS.find(s => s.id === studentId);
      if (found) {
        setStudent(found);
      }
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

  const steps = [
    { num: 1, label: "Student Details" },
    { num: 2, label: "Curriculum" },
    { num: 3, label: "Pricing" }
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
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
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
