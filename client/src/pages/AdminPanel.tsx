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
  ArrowLeft,
  BarChart3,
  CheckCircle,
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
import { MOCK_STUDENTS, TOPICS, updateTopics } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState("Grade 5");
  
  // Topic Management State
  const [topics, setTopics] = useState(TOPICS);
  const [newTopic, setNewTopic] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState([
    { grade: 'Grade 5', date: '2 mins ago', name: 'Math_G5_v2.pdf' },
    { grade: 'Grade 8', date: '1 hour ago', name: 'Math_G8_Final.pdf' },
    { grade: 'Grade 3', date: 'Yesterday', name: 'Math_G3_Core.pdf' },
  ]);

  const handleImportClick = () => {
    document.getElementById('excel-upload')?.click();
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Importing...",
        description: `Processing ${file.name}...`,
      });
      setTimeout(() => {
        toast({
          title: "Success",
          description: `Successfully imported leads from ${file.name}`,
          className: "bg-green-50 border-green-200 text-green-800"
        });
      }, 1500);
    }
  };

  const handleCurriculumClick = () => {
    document.getElementById('pdf-upload')?.click();
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Uploading...",
        description: `Uploading ${file.name} for ${selectedGrade}...`,
      });
      setTimeout(() => {
        const newFile = {
          grade: selectedGrade,
          date: 'Just now',
          name: file.name
        };
        setUploadedFiles([newFile, ...uploadedFiles]);
        toast({
          title: "Upload Complete",
          description: "Curriculum PDF updated successfully.",
          className: "bg-green-50 border-green-200 text-green-800"
        });
      }, 1500);
    }
  };

  // Topic Management Functions
  const handleAddTopic = () => {
    if (newTopic.trim()) {
      const updated = [...topics, newTopic.trim()];
      setTopics(updated);
      updateTopics(updated);
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
