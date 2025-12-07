import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { MOCK_STUDENTS } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export default function CounsellorEntry() {
  const [, setLocation] = useLocation();
  const [searchId, setSearchId] = useState("");
  const { toast } = useToast();
  const [student, setStudent] = useState<typeof MOCK_STUDENTS[0] | null>(null);

  const handleSearch = () => {
    const found = MOCK_STUDENTS.find(s => s.id.toLowerCase() === searchId.toLowerCase());
    if (found) {
      setStudent(found);
      toast({
        title: "Student Found",
        description: `Welcome back, ${found.name}`,
      });
    } else {
      setStudent(null);
      toast({
        title: "Not Found",
        description: "No student found with this ID.",
        variant: "destructive"
      });
    }
  };

  const handleStartSession = () => {
    if (student) {
      setLocation(`/calculator?studentId=${student.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-20 border-b bg-white flex items-center px-8 justify-between">
        <div className="flex items-center gap-2 font-bold text-2xl text-primary">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            PS
          </div>
          PlanetSpark
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2">
              <ShieldCheck className="h-4 w-4" /> Admin Panel
            </Button>
          </Link>
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

                  <Button 
                    size="lg" 
                    className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                    onClick={handleStartSession}
                  >
                    Start Curriculum Customization
                  </Button>
               </CardContent>
            </Card>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © 2025 PlanetSpark Education. All rights reserved.
      </footer>
    </div>
  );
}
