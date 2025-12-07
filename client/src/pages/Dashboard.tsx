import { useState } from "react";
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
  Search, 
  Upload, 
  Plus, 
  Filter, 
  MoreHorizontal,
  ArrowUpRight
} from "lucide-react";
import { MOCK_STUDENTS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleImport = () => {
    toast({
      title: "Import Initiated",
      description: "Opening Excel file picker...",
    });
    // Mock import delay
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Imported 15 new leads successfully.",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    }, 1500);
  };

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="text-muted-foreground text-sm font-medium mb-2">Total Leads Today</div>
            <div className="text-3xl font-bold text-primary">24</div>
            <div className="text-green-600 text-xs font-medium flex items-center mt-2">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12% from yesterday
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="text-muted-foreground text-sm font-medium mb-2">Pending Demos</div>
            <div className="text-3xl font-bold text-secondary">8</div>
            <div className="text-muted-foreground text-xs mt-2">Requires action</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="text-muted-foreground text-sm font-medium mb-2">Conversion Rate</div>
            <div className="text-3xl font-bold text-success">18%</div>
            <div className="text-green-600 text-xs font-medium flex items-center mt-2">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +2% this week
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, ID or school..." 
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="gap-2 bg-white" onClick={handleImport}>
              <Upload className="h-4 w-4" />
              Import Excel
            </Button>
            <Button className="gap-2" onClick={() => setLocation("/calculator")}>
              <Plus className="h-4 w-4" />
              New Pricing
            </Button>
          </div>
        </div>

        {/* Lead Table */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50">
            <h2 className="font-semibold text-lg">Recent Leads</h2>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Parent Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-primary">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell className="text-muted-foreground">{student.school}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{student.parentName}</span>
                      <span className="text-muted-foreground text-xs">{student.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        student.status === 'Enrolled' ? 'default' : 
                        student.status === 'Demo Completed' ? 'secondary' : 
                        student.status === 'New' ? 'outline' : 'secondary'
                      }
                      className={
                        student.status === 'Enrolled' ? 'bg-success hover:bg-success/90' : 
                        student.status === 'Demo Completed' ? 'bg-secondary hover:bg-secondary/90' : ''
                      }
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setLocation(`/calculator?studentId=${student.id}`)}
                    >
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
