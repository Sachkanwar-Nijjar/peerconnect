import {readFileSync,writeFileSync} from 'node:fs';
let p='components/learning-hub.tsx',s=readFileSync(p,'utf8').replace("'All categories / statuses'","'All categories / statuses'");s=s.replace("{section==='courses'?'semesters':'categories / statuses'}","{section==='courses'?'semesters':section==='skills'?'categories':'statuses'}");writeFileSync(p,s);
