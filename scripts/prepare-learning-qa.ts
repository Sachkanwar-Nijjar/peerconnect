import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
const p=new PrismaClient();
try{await p.$executeRawUnsafe('CREATE DATABASE peerconnect_upgrade_qa_20261115');console.log('QA database created.');}catch(e){if(!String(e).includes('already exists'))throw e;}
await p.$disconnect();
