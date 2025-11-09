import { useState } from 'react';
import FeesPage, { FeeTransaction } from '../FeesPage';
import type { Student } from '../StudentsPage';

export default function FeesPageExample() {
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

  const [transactions, setTransactions] = useState<FeeTransaction[]>([
    {
      id: '1',
      studentId: '1',
      studentName: 'John Doe',
      amount: 500,
      date: '2024-01-15',
      transactionId: 'TXN001234'
    },
    {
      id: '2',
      studentId: '2',
      studentName: 'Jane Smith',
      amount: 750,
      date: '2024-01-18',
      transactionId: 'TXN001235'
    }
  ]);

  const handleAddTransaction = (transaction: Omit<FeeTransaction, 'id' | 'transactionId'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      transactionId: `TXN${Math.random().toString().slice(2, 8)}`
    };
    setTransactions([newTransaction, ...transactions]);
  };

  return (
    <FeesPage
      students={mockStudents}
      transactions={transactions}
      onAddTransaction={handleAddTransaction}
    />
  );
}
