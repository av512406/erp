import DataToolsPage from '../DataToolsPage';
import type { Student } from '@shared/schema';
import type { GradeEntry } from '../GradesPage';

export default function DataToolsPageExample() {
  const mockStudents: Student[] = [
    {
      id: '1',
      admissionNumber: 'STU001',
      name: 'John Doe',
      dateOfBirth: '2010-01-01',
      admissionDate: '2020-04-01',
      aadharNumber: '',
      penNumber: '',
      aaparId: '',
      mobileNumber: '555-0101',
      address: '',
      grade: '10',
      section: 'A',
      yearlyFeeAmount: '25000'
    },
    {
      id: '2',
      admissionNumber: 'STU002',
      name: 'Jane Smith',
      dateOfBirth: '2010-02-01',
      admissionDate: '2020-04-01',
      aadharNumber: '',
      penNumber: '',
      aaparId: '',
      mobileNumber: '555-0102',
      address: '',
      grade: '10',
      section: 'B',
      yearlyFeeAmount: '25000'
    }
  ];

  const handleImportStudents = (students: Omit<Student, 'id'>[]) => {
    console.log('Importing students:', students);
    return { added: students.length, skipped: 0 };
  };

  const handleImportGrades = (grades: GradeEntry[]) => {
    console.log('Importing grades:', grades);
  };

  const handleUpsertStudents = (students: Omit<Student, 'id'>[]) => {
    console.log('Upserting students:', students);
    return { updated: students.length };
  };

  return (
    <DataToolsPage
      students={mockStudents}
      onImportStudents={handleImportStudents}
      onImportGrades={handleImportGrades}
      onUpsertStudents={handleUpsertStudents}
    />
  );
}
