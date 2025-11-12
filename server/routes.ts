import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const DATA_DIR = path.resolve(__dirname, "data");
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");
const GRADES_FILE = path.join(DATA_DIR, "grades.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function readJson(file: string) {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

async function writeJson(file: string, data: any) {
  await ensureDataDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ensure data directory exists
  await ensureDataDir();

  // Students APIs
  app.get("/api/students", async (_req, res) => {
    const students = (await readJson(STUDENTS_FILE)) || [];
    res.json(students);
  });

  app.post("/api/students", async (req, res) => {
    const students = (await readJson(STUDENTS_FILE)) || [];
    const student = req.body;
    if (!student || !student.admissionNumber) return res.status(400).json({ message: 'admissionNumber required' });
    const exists = students.find((s: any) => s.admissionNumber === student.admissionNumber);
    if (exists) return res.status(409).json({ message: 'admissionNumber exists' });
    const id = randomUUID();
    const newStudent = { ...student, id };
    students.push(newStudent);
    await writeJson(STUDENTS_FILE, students);
    res.status(201).json(newStudent);
  });

  app.put("/api/students/:admissionNumber", async (req, res) => {
    const admissionNumber = req.params.admissionNumber;
    const students = (await readJson(STUDENTS_FILE)) || [];
    const idx = students.findIndex((s: any) => s.admissionNumber === admissionNumber);
    if (idx === -1) return res.status(404).json({ message: 'not found' });
    const updated = { ...students[idx], ...req.body };
    students[idx] = updated;
    await writeJson(STUDENTS_FILE, students);
    res.json(updated);
  });

  app.delete("/api/students/:id", async (req, res) => {
    const id = req.params.id;
    const students = (await readJson(STUDENTS_FILE)) || [];
    const filtered = students.filter((s: any) => s.id !== id);
    await writeJson(STUDENTS_FILE, filtered);
    res.json({ deleted: id });
  });

  // bulk import: supports strategy=skip|upsert
  app.post("/api/students/import", async (req, res) => {
    const { students: imported, strategy } = req.body as { students: any[]; strategy?: string };
    if (!Array.isArray(imported)) return res.status(400).json({ message: 'students array required' });
    const stored = (await readJson(STUDENTS_FILE)) || [];
    const byAdmission = new Map(stored.map((s: any) => [s.admissionNumber, s]));
    const added: any[] = [];
    const skipped: string[] = [];
    let updated = 0;
    const now = Date.now();
    imported.forEach((row, idx) => {
      const existing = byAdmission.get(row.admissionNumber);
      if (existing) {
        if (strategy === 'upsert') {
          Object.assign(existing, row);
          updated++;
        } else {
          skipped.push(row.admissionNumber);
        }
      } else {
        const id = randomUUID();
        const s = { ...row, id };
        added.push(s);
        stored.push(s);
        byAdmission.set(s.admissionNumber, s);
      }
    });
    await writeJson(STUDENTS_FILE, stored);
    res.json({ added: added.length, skipped: skipped.length, skippedAdmissionNumbers: skipped, updated });
  });

  // Grades APIs
  app.get("/api/grades", async (_req, res) => {
    const grades = (await readJson(GRADES_FILE)) || [];
    res.json(grades);
  });

  // upsert grades in bulk
  app.post("/api/grades", async (req, res) => {
    const incoming = req.body as any[];
    if (!Array.isArray(incoming)) return res.status(400).json({ message: 'grades array required' });
    const stored = (await readJson(GRADES_FILE)) || [];
    // replace matching studentId+subject+term or add
    incoming.forEach((g) => {
      const idx = stored.findIndex((x: any) => x.studentId === g.studentId && x.subject === g.subject && x.term === g.term);
      if (idx >= 0) stored[idx] = g;
      else stored.push(g);
    });
    await writeJson(GRADES_FILE, stored);
    res.json({ updated: incoming.length });
  });

  const httpServer = createServer(app);
  return httpServer;
}
