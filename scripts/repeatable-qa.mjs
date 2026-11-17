import {readFileSync,writeFileSync} from 'node:fs';
let p='scripts/check-learning.ts',s=readFileSync(p,'utf8');s=s.replace('let passed=0;',`if(!process.env.DATABASE_URL!.includes('/peerconnect_upgrade_qa_20261115'))throw Error('QA database required');
await db.guidanceRequest.deleteMany({where:{senderId:{in:[a.id,c.id]}}});
let passed=0;`);writeFileSync(p,s);
