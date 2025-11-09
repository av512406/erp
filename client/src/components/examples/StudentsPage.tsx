import { useState } from 'react';
import StudentsPage, { Student } from '../StudentsPage';

export default function StudentsPageExample() {
  const [students, setStudents] = useState<Student[]>([
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
    },
    {
      id: '3',
      studentId: 'STU003',
      name: 'Bob Johnson',
      grade: '9',
      section: 'A',
      parentName: 'James Johnson',
      contactNumber: '555-0103'
    }
  ]);

  const handleAdd = (student: Omit<Student, 'id'>) => {
    setStudents([...students, { ...student, id: Date.now().toString() }]);
  };

  const handleEdit = (id: string, student: Omit<Student, 'id'>) => {
    setStudents(students.map(s => s.id === id ? { ...student, id } : s));
  };

  const handleDelete = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  return (
    <StudentsPage
      students={students}
      onAddStudent={handleAdd}
      onEditStudent={handleEdit}
      onDeleteStudent={handleDelete}
    />
  );
}
