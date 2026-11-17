import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const p='components/auth-form.tsx';writeFileSync(p,readFileSync(p,'utf8').replace('      <aside className="auth-aside">','      <Link href="/reset-password" className="recovery-link">Forgot your password?</Link>\n      <aside className="auth-aside">'));
mkdirSync('app/reset-password',{recursive:true});writeFileSync('app/reset-password/page.tsx',`import {Suspense} from 'react';\nimport {RecoveryForm} from '@/components/recovery-form';\nexport default function Page(){return <Suspense><RecoveryForm/></Suspense>;}`);
const b='scripts/build.mjs';writeFileSync(b,readFileSync(b,'utf8').replace('  "login",','  "reset-password",\n  "login",').replace('["login", "register",','["reset-password", "login", "register",'));
