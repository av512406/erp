import { useState } from 'react';
import PayslipModal from '../PayslipModal';
import { Button } from '@/components/ui/button';
import type { FeeTransaction } from '../FeesPage';

export default function PayslipModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  const mockTransaction: FeeTransaction = {
    id: '1',
    studentId: '1',
    studentName: 'John Doe',
    amount: 500,
    date: '2024-01-15',
    transactionId: 'TXN001234'
  };

  return (
    <div className="p-6">
      <Button onClick={() => setIsOpen(true)}>View Payslip</Button>
      <PayslipModal
        transaction={mockTransaction}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
