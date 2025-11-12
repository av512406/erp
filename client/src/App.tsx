import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/components/LoginPage";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import StudentsPage from "@/components/StudentsPage";
import FeesPage from "@/components/FeesPage";
import GradesPage from "@/components/GradesPage";
import ReportsPage from "@/components/ReportsPage";
import DataToolsPage from "@/components/DataToolsPage";
import type { Student } from "@shared/schema";
import type { FeeTransaction } from "@/components/FeesPage";
import type { GradeEntry } from "@/components/GradesPage";

interface User {
  email: string;
  role: 'admin' | 'teacher';
}

function Router({ user }: { user: User }) {
  const [, setLocation] = useLocation();
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const raw = localStorage.getItem('erp_students');
      if (raw) return JSON.parse(raw) as Student[];
    } catch (e) {
      // ignore parse errors
    }
    // start with an empty student list by default
    return [];
  });

  // persist students to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('erp_students', JSON.stringify(students));
    } catch (e) {
      // ignore storage errors
    }
  }, [students]);

  const [transactions, setTransactions] = useState<FeeTransaction[]>(() => {
    try {
      const raw = localStorage.getItem('erp_transactions');
      if (raw) return JSON.parse(raw) as FeeTransaction[];
    } catch (e) {
      // ignore parse errors
    }
    return [];
  });

  // persist transactions to localStorage so payments survive a hard reload
  useEffect(() => {
    try {
      localStorage.setItem('erp_transactions', JSON.stringify(transactions));
    } catch (e) {
      // ignore storage errors
    }
  }, [transactions]);

  const [grades, setGrades] = useState<GradeEntry[]>(() => {
    try {
      const raw = localStorage.getItem('erp_grades');
      if (raw) return JSON.parse(raw) as GradeEntry[];
    } catch (e) {
      // ignore
    }
    return [];
  });

  // (grades persisted via effect below)

  // persist grades to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('erp_grades', JSON.stringify(grades));
    } catch (e) {
      // ignore
    }
  }, [grades]);

  const handleAddStudent = (student: Omit<Student, 'id'>) => {
    setStudents([...students, { ...student, id: Date.now().toString() }]);
  };

  const handleEditStudent = (id: string, student: Omit<Student, 'id'>) => {
    setStudents(students.map(s => s.id === id ? { ...student, id } : s));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleAddTransaction = (transaction: Omit<FeeTransaction, 'id' | 'transactionId'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      transactionId: `TXN${Math.random().toString().slice(2, 8)}`
    };
    setTransactions([newTransaction, ...transactions]);
    return newTransaction;
  };
  const handleSaveGrades = (newGrades: GradeEntry[]) => {
    // Upsert grades by studentId + subject + term
    const updated = [...grades];
    newGrades.forEach(ng => {
      const idx = updated.findIndex(g => g.studentId === ng.studentId && g.subject === ng.subject && g.term === ng.term);
      if (idx >= 0) {
        updated[idx] = ng;
      } else {
        updated.push(ng);
      }
    });
    setGrades(updated);
  };

  const handleImportStudents = (imported: Omit<Student, 'id'>[]) => {
    // Synchronously detect duplicates by admissionNumber and append new students.
    const existing = new Set(students.map(s => s.admissionNumber));
    const skippedAdmissionNumbers: string[] = [];
    const toAdd: Student[] = [];
    const now = Date.now();
    let counter = 0;
    for (const row of imported) {
      if (!row.admissionNumber || !row.name) {
        // invalid row -> skip
        continue;
      }
      if (existing.has(row.admissionNumber)) {
        skippedAdmissionNumbers.push(row.admissionNumber);
        continue;
      }
      counter += 1;
      toAdd.push({ ...row, id: `${now}-${counter}` });
      existing.add(row.admissionNumber);
    }
    if (toAdd.length) setStudents([...students, ...toAdd]);
    return { added: toAdd.length, skipped: skippedAdmissionNumbers.length, skippedAdmissionNumbers };
  };

  const handleUpsertStudents = (imported: Omit<Student, 'id'>[]) => {
    // Update existing students by admissionNumber; insert new ones if not found.
    const byAdmission = new Map(students.map(s => [s.admissionNumber, s] as [string, Student]));
    let updatedCount = 0;
    const now = Date.now();
    let counter = 0;
    for (const row of imported) {
      const existing = byAdmission.get(row.admissionNumber);
      if (existing) {
        byAdmission.set(row.admissionNumber, { ...existing, ...row });
        updatedCount += 1;
      } else {
        counter += 1;
        byAdmission.set(row.admissionNumber, { ...row, id: `${now}-${counter}` });
      }
    }
    const newArray = Array.from(byAdmission.values());
    setStudents(newArray);
    return { updated: updatedCount };
  };

  const handleImportGrades = (imported: GradeEntry[]) => {
    handleSaveGrades(imported);
  };

  const handleLoadDemoData = (count = 50) => {
    // Generate demo students across grades 1-12 and sections A-C
    const gradesList = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const sections = ['A', 'B', 'C'];
    const demoStudents: Student[] = [];
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      const grade = gradesList[i % gradesList.length];
      const section = sections[i % sections.length];
      const admissionNumber = `S${new Date().getFullYear().toString().slice(-2)}-${String(i + 1).padStart(4, '0')}`;
      demoStudents.push({
        id: `${now}-${i}`,
        admissionNumber,
        name: `Student ${i + 1}`,
        dateOfBirth: '2012-01-01',
        admissionDate: new Date().toISOString().split('T')[0],
        aadharNumber: '',
        penNumber: '',
        aaparId: '',
        mobileNumber: '',
        address: '',
        grade,
        section,
        yearlyFeeAmount: (20000 + (parseInt(grade) * 1000)).toString()
      });
    }

    // simple demo transactions: a few payments per some students
    const demoTransactions: any[] = [];
    for (let i = 0; i < Math.min(80, count * 2); i++) {
      const stu = demoStudents[i % demoStudents.length];
      demoTransactions.push({
        id: `t-${now}-${i}`,
        studentId: stu.id,
        studentName: stu.name,
        amount: Math.floor(500 + Math.random() * 5000),
        date: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 180)).toISOString().split('T')[0],
        transactionId: `EX-${String(i + 1).padStart(6, '0')}`
      });
    }

    // demo grades: random marks for some students
    const demoGrades: GradeEntry[] = [];
    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
    const terms = ['Term 1', 'Term 2', 'Final'];
    for (let i = 0; i < Math.min(200, count * subjects.length); i++) {
      const stu = demoStudents[i % demoStudents.length];
      demoGrades.push({
        studentId: stu.id,
        subject: subjects[i % subjects.length],
        marks: Math.floor(40 + Math.random() * 60),
        term: terms[i % terms.length]
      });
    }

    setStudents(demoStudents);
    setTransactions(demoTransactions as any);
    setGrades(demoGrades);
  };

  const stats = {
    totalStudents: students.length,
    pendingFees: (() => {
      const totalYearly = students.reduce((s, st) => s + (parseFloat(st.yearlyFeeAmount || '0') || 0), 0);
      const paid = transactions.reduce((s, t) => s + (t.amount || 0), 0);
      return Math.max(Math.round(totalYearly - paid), 0);
    })(),
    gradesEntered: grades.length,
    avgAttendance: 95,
  };

  return (
    <Switch>
      <Route path="/">
        <Dashboard stats={stats} userRole={user.role} />
      </Route>
      <Route path="/students">
        <StudentsPage
          students={students}
          onAddStudent={handleAddStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      </Route>
      <Route path="/fees">
        <FeesPage
          students={students}
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
        />
      </Route>
      <Route path="/data-tools">
        <DataToolsPage
          students={students}
          onImportStudents={handleImportStudents}
          onUpsertStudents={handleUpsertStudents}
          onImportGrades={handleImportGrades}
        />
      </Route>
      <Route path="/grades">
        <GradesPage
          students={students}
          grades={grades}
          onSaveGrades={handleSaveGrades}
        />
      </Route>
      <Route path="/reports">
        <ReportsPage students={students} grades={grades} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (email: string, password: string) => {
    if (email === 'admin@school.edu' && password === 'admin123') {
      setUser({ email, role: 'admin' });
    } else if (email === 'teacher@school.edu' && password === 'teacher123') {
      setUser({ email, role: 'teacher' });
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LoginPage onLogin={handleLogin} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation userRole={user.role} userEmail={user.email} onLogout={handleLogout} />
          <Router user={user} />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
