// Portable local-project snapshot. Active sessions and verification tokens are intentionally excluded.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
const require = createRequire(resolve('package.json'));
require('dotenv').config({ quiet: true });
const { PrismaClient, Prisma } = require('@prisma/client');
const db = new PrismaClient();
const models = Prisma.dmmf.datamodel.models.filter(m => !['Session', 'VerificationToken'].includes(m.name));
const delegate = name => name[0].toLowerCase() + name.slice(1);
const [mode, target] = process.argv.slice(2);
try {
  if (!target || !['export', 'restore'].includes(mode)) throw Error('Usage: node scripts/portable-data.mjs export|restore PATH.json (from the project directory)');
  if (mode === 'export') {
    const rows = await db.$transaction(models.map(m => db[delegate(m.name)].findMany()), { isolationLevel: 'RepeatableRead' });
    const tables = Object.fromEntries(models.map((m, i) => [m.name, rows[i]]));
    writeFileSync(target, JSON.stringify({ format: 1, createdAt: new Date().toISOString(), excluded: ['Session', 'VerificationToken'], tables }, null, 2));
    console.log('Snapshot saved:', Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, v.length])));
  } else {
    const snapshot = JSON.parse(readFileSync(target, 'utf8'));
    if (snapshot.format !== 1) throw Error('Unsupported snapshot format.');
    const remaining = [...models], ordered = [], added = new Set();
    while (remaining.length) {
      const index = remaining.findIndex(m => m.fields.filter(f => f.kind === 'object' && f.relationFromFields?.length).every(f => added.has(f.type) || !models.some(x => x.name === f.type)));
      if (index < 0) throw Error('Schema dependency cycle; restore needs a reviewed migration.');
      const [m] = remaining.splice(index, 1); ordered.push(m); added.add(m.name);
    }
    await db.$transaction(async tx => {
      for (const m of Prisma.dmmf.datamodel.models) {
        if (await tx[delegate(m.name)].count()) throw Error('Restore requires an EMPTY application database. Nothing was changed. Do not erase the existing database to bypass this check.');
      }
      for (const m of ordered) {
        const rows = snapshot.tables[m.name];
        if (!Array.isArray(rows)) throw Error(`Missing table ${m.name}`);
        const data = rows.map(row => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, m.fields.some(f => f.name === k && f.type === 'DateTime') && v !== null ? new Date(v) : v])));
        if (data.length) await tx[delegate(m.name)].createMany({ data });
      }
    }, { timeout: 60000 });
    console.log('Snapshot restored. Sign in again; prior browser sessions were not transferred.');
  }
} finally { await db.$disconnect(); }
