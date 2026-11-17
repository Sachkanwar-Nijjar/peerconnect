import {readFileSync,writeFileSync} from 'node:fs';
let p='components/campus-life.tsx',s=readFileSync(p,'utf8').replace(' <section id="society-updates"',' <CampusResources/>\n <section id="society-updates"');writeFileSync(p,s);
p='components/workspace.tsx';s=readFileSync(p,'utf8').replace('{CampusLife,CampusResources}','{CampusLife}').replace('          <CampusResources/>\n','');writeFileSync(p,s);
