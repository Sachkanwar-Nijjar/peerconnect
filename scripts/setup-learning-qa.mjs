import 'dotenv/config';
import {spawnSync} from 'node:child_process';
process.env.DATABASE_URL=process.env.DATABASE_URL.replace('/peerconnect?','/peerconnect_upgrade_qa_20261115?').replace(/\/peerconnect$/,'/peerconnect_upgrade_qa_20261115');
for(const args of [['node_modules/prisma/build/index.js','migrate','deploy'],['node_modules/tsx/dist/cli.mjs','prisma/seed.ts'],['node_modules/tsx/dist/cli.mjs','scripts/seed-learning.ts']]){
const r=spawnSync(process.execPath,args,{env:process.env,stdio:'inherit'});if(r.status)process.exit(r.status);
}
