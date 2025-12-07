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
  Filter, 
  FileText,
  Trash2,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { MOCK_STUDENTS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState("Grade 5");

  const handleImport = () => {
    toast({
      title: "Import Initiated",
      description: "Opening Excel file picker...",
    });
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Imported 15 new leads successfully.",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    }, 1500);
  };

  const handleCurriculumUpload = () => {
    toast({
      title: "File Selected",
      description: `Uploading curriculum for ${selectedGrade}...`,
    });
    setTimeout(() => {
      toast({
        title: "Upload Complete",
        description: "Curriculum PDF updated successfully.",
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
        <div className="flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-bold text-foreground">Admin Control Panel</h1>
             <p className="text-muted-foreground">Manage leads, curriculum assets, and system configurations.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                   <h3 className="text-2xl font-bold mt-2">1,248</h3>
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
                   <h3 className="text-2xl font-bold mt-2">12</h3>
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
                   <p className="text-sm font-medium text-muted-foreground">Curriculum Files</p>
                   <h3 className="text-2xl font-bold mt-2">14/14</h3>
                 </div>
                 <div className="p-2 bg-success/10 rounded-lg">
                   <FileText className="h-5 w-5 text-success" />
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

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
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleImport}>
                    <Upload className="h-4 w-4" />
                    Import Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Curriculum Upload Section */}
          <div className="space-y-6">
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

                 <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2 hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleCurriculumUpload}>
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
                    {[
                      { grade: 'Grade 5', date: '2 mins ago', name: 'Math_G5_v2.pdf' },
                      { grade: 'Grade 8', date: '1 hour ago', name: 'Math_G8_Final.pdf' },
                      { grade: 'Grade 3', date: 'Yesterday', name: 'Math_G3_Core.pdf' },
                    ].map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border text-sm">
                         <div className="flex items-center gap-3">
                           <FileText className="h-4 w-4 text-primary" />
                           <div className="flex flex-col">
                             <span className="font-medium">{file.grade}</span>
                             <span className="text-xs text-muted-foreground">{file.name}</span>
                           </div>
                         </div>
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10">
                           <Trash2 className="h-3 w-3" />
                         </Button>
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
