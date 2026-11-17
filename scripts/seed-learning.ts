import 'dotenv/config';
import {db} from '../lib/db';
import {courseCatalog} from '../lib/learning-catalog';
for(const course of courseCatalog) await db.course.upsert({where:{code:course.code},create:course,update:course});
// Fictional demonstration accounts only. Preserve edited offers and course preferences.
for(const [email,skill,level] of [['student.b@thapar.edu','python','Advanced'],['student.c@thapar.edu','sql','Intermediate']] as const){
 const u=await db.user.findUnique({where:{email}});
 if(!u||!['student-b','student-c'].includes(u.id))continue;
 await db.helpOffer.upsert({where:{userId_skill:{userId:u.id,skill}},create:{userId:u.id,skill,category:'Technical',level,available:true},update:{}});
 await db.profileCourse.upsert({where:{userId_courseCode:{userId:u.id,courseCode:'UCS301'}},create:{userId:u.id,courseCode:'UCS301',status:'TAKEN',available:true},update:{}});
}
console.log('Official course starter catalog updated:',courseCatalog.length);
await db.$disconnect();
