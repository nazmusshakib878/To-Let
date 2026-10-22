import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/db';

describe('To-Let API Integration Tests', () => {
  before(async () => {
    // Seed demo data if database is empty
    const count = await prisma.listing.count();
    if (count === 0) {
      await import('../prisma/seed');
    }
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health should return ok and database status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.database, 'connected');
  });

  it('GET /api/areas should return 6 supported areas', async () => {
    const res = await request(app).get('/api/areas');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 6);
    assert.ok(res.body.data.includes('সোনাডাঙ্গা'));
  });

  it('GET /api/listings should retrieve demo listings', async () => {
    const res = await request(app).get('/api/listings');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.count >= 6);
  });

  it('GET /api/listings?maxRent=2500 should filter correctly', async () => {
    const res = await request(app).get('/api/listings?maxRent=2500');
    assert.equal(res.status, 200);
    for (const item of res.body.data) {
      assert.ok(item.rent <= 2500);
    }
  });

  it('POST /api/listings and DELETE /api/listings/:id lifecycle with secure token', async () => {
    // 1. Create a listing
    const newListing = {
      name: 'পরীক্ষামূলক মালিক',
      phone: '01799887766',
      loc: 'সোনাডাঙ্গা',
      addr: 'টেস্ট রোড ৫, ব্লক সি',
      rent: 4200,
      rooms: 3,
      floor: 2,
      maxOccupants: 6,
      tenantType: 'family',
      rules: ['বিদ্যুৎ বিল আলাদা', 'ধূমপান নিষেধ'],
    };

    const createRes = await request(app)
      .post('/api/listings')
      .send(newListing);

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.success, true);
    assert.ok(createRes.body.deletionToken, 'Must provide deletionToken upon creation');
    const createdId = createRes.body.data.id;
    const token = createRes.body.deletionToken;

    // Verify deletionHash is NOT exposed in public response
    assert.equal(createRes.body.data.deletionHash, undefined);

    // 2. Try deleting with wrong token (must fail with 403)
    const badDeleteRes = await request(app)
      .delete(`/api/listings/${createdId}`)
      .set('x-deletion-token', 'invalid-token-12345');

    assert.equal(badDeleteRes.status, 403);

    // 3. Delete with valid token (must succeed)
    const goodDeleteRes = await request(app)
      .delete(`/api/listings/${createdId}`)
      .set('x-deletion-token', token);

    assert.equal(goodDeleteRes.status, 200);
    assert.equal(goodDeleteRes.body.success, true);

    // 4. Verify listing no longer exists
    const checkRes = await request(app).get(`/api/listings/${createdId}`);
    assert.equal(checkRes.status, 404);
  });

  it('GET /api/locations should return all verified locations', async () => {
    const res = await request(app).get('/api/locations');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.count >= 50);
  });

  it('GET /api/locations/wards should return all 31 KCC wards', async () => {
    const res = await request(app).get('/api/locations/wards');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 31);
    assert.equal(res.body.data[0].ward, 1);
    assert.equal(res.body.data[30].ward, 31);
  });

  it('GET /api/locations/search should support Bengali and English queries', async () => {
    const resEn = await request(app).get('/api/locations/search?q=Nirala');
    assert.equal(resEn.status, 200);
    assert.ok(resEn.body.data.some((d: any) => d.nameEn.includes('Nirala') || d.nameBn.includes('নিরালা')));

    const resBn = await request(app).get('/api/locations/search?q=সোনাডাঙ্গা');
    assert.equal(resBn.status, 200);
    assert.ok(resBn.body.data.some((d: any) => d.nameBn.includes('সোনাডাঙ্গা')));

    const resWard = await request(app).get('/api/locations/search?q=Ward 24');
    assert.equal(resWard.status, 200);
    assert.ok(resWard.body.data.some((d: any) => d.ward === 24));
  });
});
