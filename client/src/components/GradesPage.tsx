import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import type { Student } from "./StudentsPage";

export interface GradeEntry {
  studentId: string;
  subject: string;
  marks: number;
  term: string;
}

interface GradesPageProps {
  students: Student[];
  grades: GradeEntry[];
  onSaveGrades: (grades: GradeEntry[]) => void;
}

const GRADES = ['9', '10', '11', '12'];
const SECTIONS = ['A', 'B', 'C'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
const TERMS = ['Term 1', 'Term 2', 'Final'];

export default function GradesPage({ students, grades, onSaveGrades }: GradesPageProps) {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});

  const filteredStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );

  const handleMarksChange = (studentId: string, value: string) => {
    setGradeInputs(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSave = () => {
    const newGrades: GradeEntry[] = filteredStudents.map(student => ({
      studentId: student.id,
      subject: selectedSubject,
      marks: parseFloat(gradeInputs[student.id] || '0'),
      term: selectedTerm
    }));
    onSaveGrades(newGrades);
    setGradeInputs({});
  };

  const isReadyToEnter = selectedGrade && selectedSection && selectedSubject && selectedTerm;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Grade Entry</h1>
        <p className="text-muted-foreground">Enter and manage student marks</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger id="grade" data-testid="select-grade">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger id="section" data-testid="select-section">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map(section => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject" data-testid="select-subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger id="term" data-testid="select-term">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {TERMS.map(term => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isReadyToEnter ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Enter Marks - {selectedSubject} ({selectedTerm})</CardTitle>
            <Button onClick={handleSave} className="gap-2" data-testid="button-save-grades">
              <Save className="w-4 h-4" />
              Save Grades
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-right">Marks (out of 100)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No students found for Grade {selectedGrade} Section {selectedSection}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map(student => {
                      const existingGrade = grades.find(
                        g => g.studentId === student.id && 
                             g.subject === selectedSubject && 
                             g.term === selectedTerm
                      );
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono">{student.studentId}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              className="max-w-24 ml-auto"
                              placeholder={existingGrade ? existingGrade.marks.toString() : "0"}
                              value={gradeInputs[student.id] || ''}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              data-testid={`input-marks-${student.id}`}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Please select Grade, Section, Subject, and Term to enter marks
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
