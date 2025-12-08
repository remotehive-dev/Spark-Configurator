import type { Express, Response as ExResponse, Request } from "express";
import { createServer, type Server } from "http";
import { PgStorage, SupabaseStorage, InMemoryStorage } from "./storage";
import { supabase } from "./supabase";
import multer from "multer";
import { topics, students } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const hasSupabase = !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY));
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const storage = hasSupabase ? new SupabaseStorage() : (hasDatabaseUrl ? new PgStorage() : new InMemoryStorage());

  const sessions: Record<string, { userId: string; username: string; issuedAt: number; lastActive: number }> = {};

  const parseCookie = (cookieHeader: string | undefined): Record<string, string> => {
    const out: Record<string, string> = {};
    if (!cookieHeader) return out;
    cookieHeader.split(/;\s*/).forEach((pair) => {
      const idx = pair.indexOf('=');
      if (idx > -1) {
        const k = pair.slice(0, idx).trim();
        const v = pair.slice(idx + 1).trim();
        out[k] = decodeURIComponent(v);
      }
    });
    return out;
  };

  const setSessionCookie = (res: ExResponse, token: string, maxAgeMs = 1000 * 60 * 60 * 8) => {
    const parts = [
      `c_session=${encodeURIComponent(token)}`,
      `Path=/`,
      `HttpOnly`,
      `SameSite=Lax`,
      `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    ];
    res.setHeader('Set-Cookie', parts.join('; '));
  };

  const clearSessionCookie = (res: ExResponse) => {
    res.setHeader('Set-Cookie', `c_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  };


  app.get("/api/health", async (_req, res) => {
    let supabaseConnectivity = false;
    if (hasSupabase && supabase) {
      try {
        const { error } = await supabase.from('topics').select('id').limit(1);
        supabaseConnectivity = !error;
      } catch {
        supabaseConnectivity = false;
      }
    }
    res.json({ status: "ok", supabase: hasSupabase, supabaseConnectivity, databaseUrl: hasDatabaseUrl, storage: hasSupabase ? "supabase" : (hasDatabaseUrl ? "postgres" : "memory") });
  });

  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const { username, password } = req.body || {};
      const u = await storage.getUserByUsername(String(username || ''));
      if (!u || String(u.password) !== String(password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = `${Date.now()}_${Math.random().toString(36).slice(2)}_${u.id}`;
      sessions[token] = { userId: u.id, username: String(u.username), issuedAt: Date.now(), lastActive: Date.now() };
      setSessionCookie(res, token);
      res.json({ username: u.username });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    const cookies = parseCookie(req.headers.cookie);
    const token = cookies['c_session'];
    if (token && sessions[token]) {
      delete sessions[token];
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.get('/api/auth/me', async (req, res) => {
    const cookies = parseCookie(req.headers.cookie);
    const token = cookies['c_session'];
    const sess = token ? sessions[token] : undefined;
    if (!sess) return res.status(401).json({ message: 'Not authenticated' });
    sess.lastActive = Date.now();
    res.json({ username: sess.username, userId: sess.userId });
  });

  // Simple payment status store (for demo/local dev)
  const latestPaymentStatus: { status: 'pending' | 'success' | 'failed'; txnId?: string; updatedAt?: number } = { status: 'pending' };

  app.get('/api/payments/status', async (_req, res) => {
    res.json({ status: latestPaymentStatus.status, txnId: latestPaymentStatus.txnId, updatedAt: latestPaymentStatus.updatedAt });
  });

  app.post('/api/webhooks/razorpay', async (req: Request, res: ExResponse) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
      const signature = String(req.headers['x-razorpay-signature'] || '');
      const payload = req.rawBody ? Buffer.from(req.rawBody as any) : Buffer.from(JSON.stringify(req.body || {}));
      let verified = false;
      if (secret && signature) {
        const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        verified = digest === signature;
      } else {
        verified = true; // allow in local dev when secret not configured
      }
      if (!verified) return res.status(403).json({ message: 'Invalid signature' });

      const body: any = req.body || {};
      const event: string = body.event || body.payload?.payment?.entity?.status || '';
      const paymentId: string | undefined = body.payload?.payment?.entity?.id || body.payload?.payment_link?.entity?.payment_id || body.payload?.payment_link?.entity?.id;
      const status: string | undefined = body.payload?.payment?.entity?.status || body.payload?.payment_link?.entity?.status;

      if ((event === 'payment.captured') || (status === 'captured') || (event === 'payment_link.paid') || (status === 'paid')) {
        latestPaymentStatus.status = 'success';
        latestPaymentStatus.txnId = paymentId;
        latestPaymentStatus.updatedAt = Date.now();
      }

      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: 'Webhook error' });
    }
  });

  const topicSubscribers: ExResponse[] = [];
  if (hasSupabase && supabase) {
    const channel = supabase.channel('topics_changes');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, async () => {
      try {
        const all = await storage.getTopics();
        const payload = JSON.stringify(all);
        topicSubscribers.forEach((s) => {
          (s as any).write(`data: ${payload}\n\n`);
        });
      } catch {}
    }).subscribe();
  }

  app.get("/api/topics/stream", (req, res: ExResponse) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    (res as any).flushHeaders?.();
    topicSubscribers.push(res);
    (async () => {
      try {
        const all = await storage.getTopics();
        (res as any).write(`data: ${JSON.stringify(all)}\n\n`);
      } catch {}
    })();
    req.on('close', () => {
      const idx = topicSubscribers.indexOf(res);
      if (idx >= 0) topicSubscribers.splice(idx, 1);
      res.end();
    });
  });

  app.get("/api/topics", async (_req, res, next) => {
    try {
      const all = await storage.getTopics();
      const grade = typeof _req.query.grade === 'string' ? _req.query.grade : undefined;
      const filtered = grade ? all.filter((t: any) => String(t.grade || '').toLowerCase() === grade.toLowerCase()) : all;
      res.json(filtered);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/topics/suggest", async (req, res, next) => {
    try {
      const grade = typeof req.query.grade === 'string' ? req.query.grade : undefined;
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : undefined;
      const all = await storage.getTopics();

      const order = [
        'Foundational Skills',
        'Primary Math',
        'Upper Primary',
        'Middle School',
        'High School',
        'Senior Secondary',
        'Mental Ability',
        'Application Skills',
        'School Syllabus (Board-Aligned Sections)',
        'Vedic Math',
        'Communication & Explanation Skills (PlanetSpark Style)'
      ];

      const score = (cat: string | null | undefined) => {
        const i = order.indexOf(String(cat || ''));
        return i >= 0 ? (order.length - i) : 0;
      };

      const byGrade = grade ? all.filter((t: any) => String(t.grade || '').toLowerCase() === grade.toLowerCase()) : [];
      const general = all.filter((t: any) => !t.grade);

      const ranked = [...byGrade, ...general]
        .map((t: any) => ({ ...t, _score: score(t.category) }))
        .sort((a, b) => (b._score - a._score) || String(a.name).localeCompare(String(b.name)));

      const unique: Record<string, boolean> = {};
      const deduped = ranked.filter((t: any) => {
        const key = `${String(t.name).toLowerCase()}::${String(t.grade || '')}`;
        if (unique[key]) return false;
        unique[key] = true;
        return true;
      });

      const out = typeof limit === 'number' && !Number.isNaN(limit) ? deduped.slice(0, Math.max(0, limit)) : deduped;
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/topics", async (req, res, next) => {
    try {
      const created = await storage.addTopic({ name: String(req.body?.name || ""), grade: req.body?.grade ? String(req.body.grade) : undefined, category: req.body?.category ? String(req.body.category) : undefined });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/topics/:id", async (req, res, next) => {
    try {
      await storage.deleteTopic(String(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/students", async (_req, res, next) => {
    try {
      const all = await storage.getStudents();
      res.json(all);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/students/:id", async (req, res, next) => {
    try {
      const s = await storage.getStudentById(String(req.params.id));
      if (!s) return res.status(404).json({ message: "Not Found" });
      res.json(s);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/students", async (req, res, next) => {
    try {
      const body = req.body || {};
      const created = await storage.addStudent({
        id: String(body.id || ""),
        name: String(body.name || ""),
        grade: body.grade ? String(body.grade) : null as any,
        status: body.status ? String(body.status) : null as any,
        board: body.board ? String(body.board) : null as any,
        sapEligible: Boolean(body.sapEligible),
      });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/students/import", async (req, res, next) => {
    try {
      const list = Array.isArray(req.body) ? req.body : [];
      const normalized = list.map((body: any) => ({
        id: String(body.id || body.leadId || ""),
        name: String(body.name || ""),
        grade: body.grade ? String(body.grade) : null as any,
        status: body.status ? String(body.status) : null as any,
        board: body.board ? String(body.board) : null as any,
        sapEligible: typeof body.sapEligible === 'string' ? body.sapEligible.toLowerCase() === 'yes' : Boolean(body.sapEligible),
      })).filter(r => r.id && r.name);

      const count = await storage.addStudentsBulk(normalized);
      res.status(201).json({ inserted: count });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/curriculum-files", async (_req, res, next) => {
    try {
      const all = await storage.getCurriculumFiles();
      const grade = typeof _req.query.grade === 'string' ? _req.query.grade : undefined;
      const filtered = grade ? all.filter((r: any) => String(r.grade).toLowerCase() === grade.toLowerCase()) : all;
      res.json(filtered);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/curriculum-files", async (req, res, next) => {
    try {
      const body = req.body || {};
      const created = await storage.addCurriculumFile({
        name: String(body.name || ""),
        grade: String(body.grade || ""),
        topic: body.topic ? String(body.topic) : null as any,
        url: String(body.url || ""),
      });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/customizations", async (req, res, next) => {
    try {
      const { studentId, selectedTopics, parentTopics } = req.body || {};
      const id = await storage.addCustomization(String(studentId || ""), Array.isArray(selectedTopics) ? selectedTopics : [], Array.isArray(parentTopics) ? parentTopics : []);
      res.status(201).json({ id });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/customizations/:studentId", async (req, res, next) => {
    try {
      const studentId = String(req.params.studentId || "");
      if (!studentId) return res.status(400).json({ message: "studentId required" });
      const latest = await storage.getLatestCustomizationByStudentId(studentId);
      if (!latest) return res.status(404).json({ message: "Not Found" });
      res.json(latest);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/topics/bulk", async (req, res, next) => {
    try {
      const list = Array.isArray(req.body) ? req.body : [];
      const normalized = list.map((t: any) => ({ name: String(t.name || ''), grade: t.grade ? String(t.grade) : undefined, category: t.category ? String(t.category) : undefined }))
        .filter((t: any) => t.name);
      const count = await storage.addTopicsBulk(normalized);
      res.status(201).json({ inserted: count });
    } catch (err) {
      next(err);
    }
  });

  const upload = multer();
  app.post("/api/upload-curriculum", upload.single("file"), async (req, res, next) => {
    try {
      if (!hasSupabase || !supabase) {
        return res.status(400).json({ message: "Supabase storage not configured" });
      }
      const file = (req as any).file as Express.Multer.File | undefined;
      const grade = String(req.body.grade || "");
      const topic = req.body.topic ? String(req.body.topic) : null as any;
      if (!file || !grade) {
        return res.status(400).json({ message: "file and grade are required" });
      }
      const bucket = "curriculum";
      // ensure bucket exists
      const buckets = await supabase.storage.listBuckets();
      if (!buckets.data?.find((b: any) => b.name === bucket)) {
        await supabase.storage.createBucket(bucket, { public: true });
      }
      const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const path = `${grade}/${Date.now()}_${safeName}`;
      const uploadRes = await supabase.storage.from(bucket).upload(path, file.buffer, {
        contentType: file.mimetype || "application/pdf",
        upsert: true,
      });
      if (uploadRes.error) throw uploadRes.error;
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      const record = await storage.addCurriculumFile({ name: safeName, grade, topic, url: pub.publicUrl });
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/admin/users', async (req, res, next) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : '';
      const all = await storage.getUsers();
      const filtered = q ? all.filter((u: any) => String(u.username).toLowerCase().includes(q)) : all;
      const redacted = filtered.map((u: any) => ({ id: u.id, username: u.username }));
      res.json(redacted);
    } catch (err) { next(err); }
  });

  app.post('/api/admin/users', async (req, res, next) => {
    try {
      const { username, password, adminPassword } = req.body || {};
      if (String(adminPassword) !== 'Ranjeet11$') return res.status(403).json({ message: 'Admin password required' });
      if (!username || !password) return res.status(400).json({ message: 'username and password required' });
      const created = await storage.createUser({ username: String(username), password: String(password) });
      res.status(201).json({ id: created.id, username: created.username });
    } catch (err) { next(err); }
  });

  app.delete('/api/admin/users/:id', async (req, res, next) => {
    try {
      const { adminPassword } = req.body || {};
      if (String(adminPassword) !== 'Ranjeet11$') return res.status(403).json({ message: 'Admin password required' });
      await storage.deleteUser(String(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  });

  app.post('/api/admin/users/:id/reset-password', async (req, res, next) => {
    try {
      const { newPassword, adminPassword } = req.body || {};
      if (String(adminPassword) !== 'Ranjeet11$') return res.status(403).json({ message: 'Admin password required' });
      if (!newPassword) return res.status(400).json({ message: 'newPassword required' });
      await storage.updateUserPassword(String(req.params.id), String(newPassword));
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  app.get('/api/admin/users/stats', async (_req, res, next) => {
    try {
      const all = await storage.getUsers();
      const total = all.length;
      const activeSet = new Set<string>(Object.values(sessions).map((s) => s.userId));
      const active = all.filter((u: any) => activeSet.has(u.id)).length;
      const inactive = Math.max(0, total - active);
      res.json({ total, active, inactive });
    } catch (err) { next(err); }
  });

  return httpServer;
}
