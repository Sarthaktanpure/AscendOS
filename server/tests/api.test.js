import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

let authToken = '';

describe('AscendOS Server API Test Suite', () => {
  it('GET /api/health should return 200 and online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.database).toBe('connected');
  });

  it('POST /api/auth/login should authenticate Sarthak Tanpure and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sarthak.tanpure@pravara.edu',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Sarthak Tanpure');
    expect(res.body.user.reportedCGPA).toBe(9.0);
    expect(res.body.user.primaryLanguageDSA).toBe('Java');

    authToken = res.body.token;
  });

  it('GET /api/tasks without auth should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/dashboard/summary with valid token should return aggregated metrics', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nextAction).toBeDefined();
    expect(res.body.data.todaySchedule).toBeDefined();
    expect(res.body.data.dsaStats.total).toBeGreaterThan(0);
    expect(res.body.data.mentorAdvice.headline).toBeDefined();
  });

  it('POST /api/tasks should create a task and allow MIT toggle', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Master Dijkstra Algorithm in Java',
        category: 'dsa',
        priority: 'P1_CRITICAL',
        estimatedMinutes: 60,
        isMIT: true
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    const taskId = createRes.body.task._id;

    // Toggle MIT
    const mitRes = await request(app)
      .patch(`/api/tasks/${taskId}/mit`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(mitRes.status).toBe(200);
    expect(mitRes.body.task.isMIT).toBe(false);

    // Clean up
    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);
  });

  it('GET /api/dsa/problems should return canonical DSA problems with topic mastery', async () => {
    const res = await request(app)
      .get('/api/dsa/problems')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.problems.length).toBeGreaterThan(0);
    expect(res.body.topics.length).toBe(16);
  });

  it('GET /api/projects should return 4 preconfigured projects with quality audit data', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.projects.length).toBe(4);

    const hospitalOS = res.body.projects.find(p => p.name === 'HospitalOS');
    expect(hospitalOS).toBeDefined();
    expect(hospitalOS.qualityAudit.databaseIndexes).toBe(true);
  });

  it('GET /api/jobs should return verified opportunities with candidate eligibility', async () => {
    const res = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.jobs.length).toBeGreaterThan(0);

    const firstJob = res.body.jobs[0];
    expect(firstJob.eligibility).toBeDefined();
    expect(['Likely match', 'Needs review', 'Does not match stated requirements']).toContain(firstJob.eligibility.verdict);
  });

  it('POST /api/mentor/chat should provide evidence-based rule mentorship response', async () => {
    const res = await request(app)
      .post('/api/mentor/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message: 'What should I do for my resume?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reply).toContain('HospitalOS');
    expect(res.body.reply).toContain('9');
  });
});
