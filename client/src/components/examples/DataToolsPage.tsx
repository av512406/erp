import DataToolsPage from '../DataToolsPage';
import type { Student } from '../StudentsPage';
import type { GradeEntry } from '../GradesPage';

export default function DataToolsPageExample() {
  const mockStudents: Student[] = [
    {
      id: '1',
      studentId: 'STU001',
      name: 'John Doe',
      grade: '10',
      section: 'A',
      parentName: 'Robert Doe',
      contactNumber: '555-0101'
    },
    {
      id: '2',
      studentId: 'STU002',
      name: 'Jane Smith',
      grade: '10',
      section: 'B',
      parentName: 'Mary Smith',
      contactNumber: '555-0102'
    }
  ];

  const handleImportStudents = (students: Omit<Student, 'id'>[]) => {
    console.log('Importing students:', students);
  };

  const handleImportGrades = (grades: GradeEntry[]) => {
    console.log('Importing grades:', grades);
  };

  return (
    <DataToolsPage
      students={mockStudents}
      onImportStudents={handleImportStudents}
      onImportGrades={handleImportGrades}
    />
  );
}
