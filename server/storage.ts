import { supabase } from "./supabase";
import { eq, desc } from "drizzle-orm";
import {
  users,
  topics,
  students,
  curriculumFiles,
  customizations,
  type User,
  type InsertUser,
  type Topic,
  type InsertTopic,
  type StudentRow,
  type InsertStudentRow,
  type CurriculumFile,
  type InsertCurriculumFile,
  type Customization,
} from "@shared/schema";
 

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  updateUserPassword(id: string, newPassword: string): Promise<void>;
  getTopics(): Promise<Topic[]>;
  addTopic(topic: InsertTopic): Promise<Topic>;
  deleteTopic(id: string): Promise<void>;
  addTopicsBulk(list: InsertTopic[]): Promise<number>;
  getStudents(): Promise<StudentRow[]>;
  getStudentById(id: string): Promise<StudentRow | undefined>;
  addStudent(student: InsertStudentRow): Promise<StudentRow>;
  addStudentsBulk(list: InsertStudentRow[]): Promise<number>;
  getCurriculumFiles(): Promise<CurriculumFile[]>;
  addCurriculumFile(file: InsertCurriculumFile): Promise<CurriculumFile>;
  addCustomization(studentId: string, selectedTopics: string[], parentTopics: string[]): Promise<string>;
  getLatestCustomizationByStudentId(studentId: string): Promise<Customization | undefined>;
}


export class PgStorage implements IStorage {
  private async getDb() {
    const mod = await import('./db');
    return mod.db;
  }
  async getUser(id: string): Promise<User | undefined> {
    const db = await this.getDb();
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await this.getDb();
    const rows = await db.select().from(users).where(eq(users.username, username));
    return rows[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const rows = await db.insert(users).values(insertUser).returning();
    return rows[0];
  }

  async getUsers(): Promise<User[]> {
    const db = await this.getDb();
    const rows = await db.select().from(users);
    return rows as any;
  }

  async deleteUser(id: string): Promise<void> {
    const db = await this.getDb();
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserPassword(id: string, newPassword: string): Promise<void> {
    const db = await this.getDb();
    await db.update(users).set({ password: newPassword as any }).where(eq(users.id, id));
  }

  async getTopics(): Promise<Topic[]> {
    const db = await this.getDb();
    return await db.select().from(topics);
  }

  async addTopic(topicData: InsertTopic): Promise<Topic> {
    const db = await this.getDb();
    const rows = await db.insert(topics).values({ name: topicData.name, grade: topicData.grade ?? null as any, category: topicData.category ?? null as any }).returning();
    return rows[0];
  }

  async deleteTopic(id: string): Promise<void> {
    const db = await this.getDb();
    await db.delete(topics).where(eq(topics.id, id));
  }

  async addTopicsBulk(list: InsertTopic[]): Promise<number> {
    if (!list.length) return 0;
    const db = await this.getDb();
    await db.insert(topics).values(list.map(t => ({ name: t.name, grade: t.grade ?? null as any, category: t.category ?? null as any })));
    return list.length;
  }

  async getStudents(): Promise<StudentRow[]> {
    const db = await this.getDb();
    return await db.select().from(students);
  }

  async getStudentById(id: string): Promise<StudentRow | undefined> {
    const db = await this.getDb();
    const rows = await db.select().from(students).where(eq(students.id, id));
    return rows[0];
  }

  async addStudent(student: InsertStudentRow): Promise<StudentRow> {
    const db = await this.getDb();
    const rows = await db.insert(students).values(student).returning();
    return rows[0];
  }

  async addStudentsBulk(list: InsertStudentRow[]): Promise<number> {
    if (!list.length) return 0;
    const db = await this.getDb();
    await db.insert(students).values(list).returning();
    return list.length;
  }

  async getCurriculumFiles(): Promise<CurriculumFile[]> {
    const db = await this.getDb();
    return await db.select().from(curriculumFiles);
  }

  async addCurriculumFile(file: InsertCurriculumFile): Promise<CurriculumFile> {
    const db = await this.getDb();
    const rows = await db.insert(curriculumFiles).values(file).returning();
    return rows[0];
  }

  async addCustomization(studentId: string, selectedTopics: string[], parentTopics: string[]): Promise<string> {
    const db = await this.getDb();
    const rows = await db
      .insert(customizations)
      .values({ studentId, selectedTopics, parentTopics })
      .returning();
    return rows[0]?.id as string;
  }

  async getLatestCustomizationByStudentId(studentId: string): Promise<Customization | undefined> {
    const db = await this.getDb();
    const rows = await db
      .select()
      .from(customizations)
      .where(eq(customizations.studentId, studentId))
      .orderBy(desc(customizations.createdAt))
      .limit(1);
    return rows[0];
  }
}

export class SupabaseStorage implements IStorage {
  private client = supabase!

  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await this.client!.from('users').select('*').eq('id', id).limit(1)
    if (error) throw error
    return (data as any)[0]
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.client!.from('users').select('*').eq('username', username).limit(1)
    if (error) throw error
    return (data as any)[0]
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await this.client!.from('users').insert(insertUser).select('*').limit(1)
    if (error) throw error
    return (data as any)[0]
  }

  async getUsers(): Promise<User[]> {
    const { data, error } = await this.client!.from('users').select('*')
    if (error) throw error
    return data as any
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.client!.from('users').delete().eq('id', id)
    if (error) throw error
  }

  async updateUserPassword(id: string, newPassword: string): Promise<void> {
    const { error } = await this.client!.from('users').update({ password: newPassword }).eq('id', id)
    if (error) throw error
  }

  async getTopics(): Promise<Topic[]> {
    const { data, error } = await this.client!.from('topics').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as any
  }

  async addTopic(topicData: InsertTopic): Promise<Topic> {
    const { data, error } = await this.client!.from('topics').insert({ name: topicData.name, grade: topicData.grade ?? null, category: topicData.category ?? null }).select('*').limit(1)
    if (error) throw error
    return (data as any)[0]
  }

  async deleteTopic(id: string): Promise<void> {
    const { error } = await this.client!.from('topics').delete().eq('id', id)
    if (error) throw error
  }

  async addTopicsBulk(list: InsertTopic[]): Promise<number> {
    const payload = list.map(t => ({ name: t.name, grade: t.grade ?? null, category: t.category ?? null }))
    const { error } = await this.client!.from('topics').insert(payload)
    if (error) throw error
    return list.length
  }

  async getStudents(): Promise<StudentRow[]> {
    const { data, error } = await this.client!.from('students').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data as any).map((r: any) => ({
      id: r.id,
      name: r.name,
      grade: r.grade,
      status: r.status,
      board: r.board,
      sapEligible: r.sap_eligible,
      createdAt: r.created_at,
    }))
  }

  async getStudentById(id: string): Promise<StudentRow | undefined> {
    const { data, error } = await this.client!.from('students').select('*').eq('id', id).limit(1)
    if (error) throw error
    const r = (data as any)[0]
    if (!r) return undefined
    return {
      id: r.id,
      name: r.name,
      grade: r.grade,
      status: r.status,
      board: r.board,
      sapEligible: r.sap_eligible,
      createdAt: r.created_at,
    }
  }

  async addStudent(student: InsertStudentRow): Promise<StudentRow> {
    const payload = {
      id: student.id,
      name: student.name,
      grade: student.grade ?? null,
      status: student.status ?? null,
      board: student.board ?? null,
      sap_eligible: student.sapEligible ?? false,
    }
    const { data, error } = await this.client!.from('students').insert(payload).select('*').limit(1)
    if (error) throw error
    const r = (data as any)[0]
    return {
      id: r.id,
      name: r.name,
      grade: r.grade,
      status: r.status,
      board: r.board,
      sapEligible: r.sap_eligible,
      createdAt: r.created_at,
    }
  }

  async addStudentsBulk(list: InsertStudentRow[]): Promise<number> {
    const payload = list.map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade ?? null,
      status: s.status ?? null,
      board: s.board ?? null,
      sap_eligible: s.sapEligible ?? false,
    }))
    const { error } = await this.client!.from('students').insert(payload)
    if (error) throw error
    return list.length
  }

  async getCurriculumFiles(): Promise<CurriculumFile[]> {
    const { data, error } = await this.client!.from('curriculum_files').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as any
  }

  async addCurriculumFile(file: InsertCurriculumFile): Promise<CurriculumFile> {
    const { data, error } = await this.client!.from('curriculum_files').insert(file).select('*').limit(1)
    if (error) throw error
    return (data as any)[0]
  }

  async addCustomization(studentId: string, selectedTopics: string[], parentTopics: string[]): Promise<string> {
    const { data, error } = await this.client!.from('customizations').insert({
      student_id: studentId,
      selected_topics: selectedTopics,
      parent_topics: parentTopics,
    }).select('id').limit(1)
    if (error) throw error
    return (data as any)[0]?.id
  }

  async getLatestCustomizationByStudentId(studentId: string): Promise<Customization | undefined> {
    const { data, error } = await this.client!.from('customizations')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) throw error
    const r = (data as any)[0]
    if (!r) return undefined
    return {
      id: r.id,
      studentId: r.student_id,
      selectedTopics: r.selected_topics,
      parentTopics: r.parent_topics,
      createdAt: r.created_at,
    } as any
  }
}

export class InMemoryStorage implements IStorage {
  private _users: User[] = [] as any;
  private _topics: Topic[] = [] as any;
  private _students: StudentRow[] = [] as any;
  private _files: CurriculumFile[] = [] as any;
  private _customizations: Customization[] = [] as any;

  async getUser(id: string): Promise<User | undefined> {
    return this._users.find(u => u.id === id);
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this._users.find(u => (u as any).username === username);
  }
  async createUser(user: InsertUser): Promise<User> {
    const created = { id: crypto.randomUUID(), ...user } as any;
    this._users.push(created);
    return created;
  }
  async getUsers(): Promise<User[]> { return this._users; }
  async deleteUser(id: string): Promise<void> { this._users = this._users.filter(u => u.id !== id); }
  async updateUserPassword(id: string, newPassword: string): Promise<void> {
    const u = this._users.find((x) => x.id === id) as any;
    if (u) u.password = newPassword;
  }
  async getTopics(): Promise<Topic[]> { return this._topics; }
  async addTopic(topicData: InsertTopic): Promise<Topic> {
    const created = { id: crypto.randomUUID(), name: topicData.name, grade: topicData.grade ?? null as any, category: topicData.category ?? null as any, createdAt: new Date() } as any;
    this._topics.push(created);
    return created;
  }
  async deleteTopic(id: string): Promise<void> {
    this._topics = this._topics.filter(t => (t as any).id !== id);
  }
  async addTopicsBulk(list: InsertTopic[]): Promise<number> {
    list.forEach(t => { this._topics.push({ id: crypto.randomUUID(), name: t.name, grade: t.grade ?? null as any, category: t.category ?? null as any, createdAt: new Date() } as any); });
    return list.length;
  }
  async getStudents(): Promise<StudentRow[]> { return this._students; }
  async getStudentById(id: string): Promise<StudentRow | undefined> { return this._students.find(s => s.id === id); }
  async addStudent(student: InsertStudentRow): Promise<StudentRow> {
    const created = { ...student, createdAt: new Date() } as any;
    this._students.push(created);
    return created;
  }
  async addStudentsBulk(list: InsertStudentRow[]): Promise<number> {
    list.forEach(s => this._students.push({ ...s, createdAt: new Date() } as any));
    return list.length;
  }
  async getCurriculumFiles(): Promise<CurriculumFile[]> { return this._files; }
  async addCurriculumFile(file: InsertCurriculumFile): Promise<CurriculumFile> {
    const created = { id: crypto.randomUUID(), ...file, createdAt: new Date() } as any;
    this._files.push(created);
    return created;
  }
  async addCustomization(studentId: string, selectedTopics: string[], parentTopics: string[]): Promise<string> {
    const id = crypto.randomUUID();
    const created = { id, studentId, selectedTopics, parentTopics, createdAt: new Date() } as any;
    this._customizations.push(created);
    return id;
  }
  async getLatestCustomizationByStudentId(studentId: string): Promise<Customization | undefined> {
    const list = this._customizations.filter(c => c.studentId === studentId).sort((a: any, b: any) => (b.createdAt as any) - (a.createdAt as any));
    return list[0];
  }
}
