import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_STUDENTS, Student } from "@/lib/types";
import { Search, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface StudentDetailsProps {
  student: Student | null;
  setStudent: (student: Student | null) => void;
  onNext: () => void;
}

export function StudentDetails({ student, setStudent, onNext }: StudentDetailsProps) {
  const [searchId, setSearchId] = useState("");
  const { toast } = useToast();

  const handleSearch = () => {
    const found = MOCK_STUDENTS.find(s => s.id.toLowerCase() === searchId.toLowerCase());
    if (found) {
      setStudent(found);
      toast({
        title: "Student Found",
        description: `Loaded details for ${found.name}`,
      });
    } else {
      setStudent(null);
      toast({
        title: "Not Found",
        description: "No student found with this ID. Please check and try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (student) {
      setSearchId(student.id);
    }
  }, [student]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground">Student Identification</h2>
        <p className="text-muted-foreground">Enter the Student ID to fetch lead details from the database.</p>
      </div>

      <div className="flex gap-4 items-end max-w-xl">
        <div className="flex-1 space-y-2">
          <Label htmlFor="studentId">Student ID / Lead ID</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="studentId"
              placeholder="e.g. ST-2025-001" 
              className="pl-9"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <Button onClick={handleSearch} className="min-w-[100px]">Fetch</Button>
      </div>

      {student && (
        <Card className="bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Student Name</Label>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    {student.name}
                    <UserCheck className="h-4 w-4 text-success" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Grade</Label>
                  <div className="font-medium">{student.grade}</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">School</Label>
                  <div className="font-medium">{student.school}</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Parent Name</Label>
                  <div className="font-medium">{student.parentName}</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Contact</Label>
                  <div className="font-medium">{student.phone}</div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Current Status</Label>
                  <div className="font-medium text-secondary">{student.status}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button onClick={onNext} size="lg" className="w-full md:w-auto">
                Confirm & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
