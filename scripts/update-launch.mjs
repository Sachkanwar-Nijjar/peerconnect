import {readFileSync,writeFileSync} from 'node:fs';
const p='scripts/launch.mjs';let s=readFileSync(p,'utf8');s=s.replace('  await database.$disconnect();\n  let appChild;',`  await database.$disconnect();
  for (const args of [["node_modules/prisma/build/index.js","migrate","deploy"],["node_modules/tsx/dist/cli.mjs","scripts/seed-learning.ts"]]) {
    const child=run(args);
    await new Promise((resolve,reject)=>child.on("exit",code=>code===0?resolve():reject(Error("Database upgrade failed."))));
  }
  let appChild;`);writeFileSync(p,s);
