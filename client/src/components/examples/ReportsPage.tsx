import ReportsPage from '../ReportsPage';
import type { Student } from '../StudentsPage';
import type { GradeEntry } from '../GradesPage';

export default function ReportsPageExample() {
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

  const mockGrades: GradeEntry[] = [
    { studentId: '1', subject: 'Mathematics', marks: 85, term: 'Term 1' },
    { studentId: '1', subject: 'Science', marks: 92, term: 'Term 1' },
    { studentId: '1', subject: 'English', marks: 78, term: 'Term 1' },
    { studentId: '1', subject: 'History', marks: 88, term: 'Term 1' },
    { studentId: '1', subject: 'Geography', marks: 90, term: 'Term 1' },
  ];

  return <ReportsPage students={mockStudents} grades={mockGrades} />;
}
