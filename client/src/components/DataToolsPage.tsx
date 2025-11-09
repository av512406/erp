import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "./StudentsPage";
import type { GradeEntry } from "./GradesPage";

interface DataToolsPageProps {
  students: Student[];
  onImportStudents: (students: Omit<Student, 'id'>[]) => void;
  onImportGrades: (grades: GradeEntry[]) => void;
}

declare global {
  interface Window {
    Papa: any;
  }
}

export default function DataToolsPage({ students, onImportStudents, onImportGrades }: DataToolsPageProps) {
  const [isImporting, setIsImporting] = useState(false);
  const studentFileRef = useRef<HTMLInputElement>(null);
  const gradesFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleStudentImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      window.Papa.parse(csv, {
        header: true,
        complete: (results: any) => {
          const importedStudents = results.data
            .filter((row: any) => row.studentId && row.name)
            .map((row: any) => ({
              studentId: row.studentId,
              name: row.name,
              grade: row.grade,
              section: row.section,
              parentName: row.parentName,
              contactNumber: row.contactNumber
            }));
          onImportStudents(importedStudents);
          toast({
            title: "Import Successful",
            description: `Imported ${importedStudents.length} students`,
          });
          setIsImporting(false);
          if (studentFileRef.current) studentFileRef.current.value = '';
        }
      });
    };
    reader.readAsText(file);
  };

  const handleGradesImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      window.Papa.parse(csv, {
        header: true,
        complete: (results: any) => {
          const importedGrades = results.data
            .filter((row: any) => row.studentId && row.subject && row.marks && row.term)
            .map((row: any) => ({
              studentId: row.studentId,
              subject: row.subject,
              marks: parseFloat(row.marks),
              term: row.term
            }));
          onImportGrades(importedGrades);
          toast({
            title: "Import Successful",
            description: `Imported ${importedGrades.length} grade entries`,
          });
          setIsImporting(false);
          if (gradesFileRef.current) gradesFileRef.current.value = '';
        }
      });
    };
    reader.readAsText(file);
  };

  const handleExportStudents = () => {
    const csvContent = [
      ['studentId', 'name', 'grade', 'section', 'parentName', 'contactNumber'].join(','),
      ...students.map(s => 
        [s.studentId, s.name, s.grade, s.section, s.parentName, s.contactNumber].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${students.length} students`,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Data Tools</h1>
        <p className="text-muted-foreground">Import and export data in bulk</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Students</CardTitle>
            <CardDescription>
              Upload a CSV file to bulk import student records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-file">CSV File</Label>
              <Input
                id="student-file"
                type="file"
                accept=".csv"
                ref={studentFileRef}
                onChange={handleStudentImport}
                disabled={isImporting}
                data-testid="input-import-students"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Expected columns:</p>
              <p className="font-mono text-xs">studentId, name, grade, section, parentName, contactNumber</p>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => studentFileRef.current?.click()}
              disabled={isImporting}
              data-testid="button-import-students"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importing...' : 'Select File'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Grades</CardTitle>
            <CardDescription>
              Upload a CSV file to bulk import student marks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grades-file">CSV File</Label>
              <Input
                id="grades-file"
                type="file"
                accept=".csv"
                ref={gradesFileRef}
                onChange={handleGradesImport}
                disabled={isImporting}
                data-testid="input-import-grades"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Expected columns:</p>
              <p className="font-mono text-xs">studentId, subject, marks, term</p>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => gradesFileRef.current?.click()}
              disabled={isImporting}
              data-testid="button-import-grades"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importing...' : 'Select File'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Students</CardTitle>
            <CardDescription>
              Download all student data as a CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full gap-2"
              onClick={handleExportStudents}
              disabled={students.length === 0}
              data-testid="button-export-students"
            >
              <Download className="w-4 h-4" />
              Download CSV ({students.length} students)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
