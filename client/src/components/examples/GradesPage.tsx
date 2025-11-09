import { useState } from 'react';
import GradesPage, { GradeEntry } from '../GradesPage';
import type { Student } from '../StudentsPage';

export default function GradesPageExample() {
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
      section: 'A',
      parentName: 'Mary Smith',
      contactNumber: '555-0102'
    },
    {
      id: '3',
      studentId: 'STU003',
      name: 'Bob Johnson',
      grade: '10',
      section: 'B',
      parentName: 'James Johnson',
      contactNumber: '555-0103'
    }
  ];

  const [grades, setGrades] = useState<GradeEntry[]>([
    {
      studentId: '1',
      subject: 'Mathematics',
      marks: 85,
      term: 'Term 1'
    }
  ]);

  const handleSaveGrades = (newGrades: GradeEntry[]) => {
    setGrades([...grades, ...newGrades]);
    console.log('Grades saved:', newGrades);
  };

  return (
    <GradesPage
      students={mockStudents}
      grades={grades}
      onSaveGrades={handleSaveGrades}
    />
  );
}
