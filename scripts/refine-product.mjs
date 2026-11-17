import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const p='components/workspace.tsx';let s=readFileSync(p,'utf8');s=s.replace('      <div className="campus-columns">','      <div className="campus-learning-strip"><Link href="/app/courses"><BookOpen size={22}/><span><strong>Know your courses</strong><small>Official schemes. Shared experience.</small></span><ArrowUpRight size={18}/></Link><Link href="/app/skills"><Users size={22}/><span><strong>Find your next mentor</strong><small>Get help from someone who has been there.</small></span><ArrowUpRight size={18}/></Link><Link href="/app/guidance"><MessageCircle size={22}/><span><strong>Keep the conversation going</strong><small>Your guidance requests and replies.</small></span><ArrowUpRight size={18}/></Link></div>\n      <div className="campus-columns">');
// Keep the main home destination first in the expanded navigation.
s=s.replace('  const nav = [','  const nav = [\n    { label: "Campus Home", href: "/app", icon: Home, key: "dashboard" },');s=s.replace('    { label: "Campus Home", href: "/app", icon: Home, key: "dashboard" },\n    {\n      label: "Discover Projects",','    {\n      label: "Discover Projects",');writeFileSync(p,s);
const a='app/api/auth/[action]/route.ts';s=readFileSync(a,'utf8');const marker='    if (action === "login") {';s=s.replace(marker,`    if (action === "forgot") {
      const {email}=z.object({email:z.email().transform(s=>s.trim().toLowerCase())}).parse(input);
      const dev=process.env.NODE_ENV!=="production"&&process.env.DEV_EMAIL_VERIFICATION==="true";
      if(!dev&&!process.env.SMTP_URL)throw new AppError("Email recovery is not configured. Contact the administrator.",503);
      const user=await db.user.findUnique({where:{email}});
      const response={message:"If this is an active account, a recovery link will be sent to its university email."};
      if(!user||!user.verified||user.disabled)return NextResponse.json(response);
      const raw=randomBytes(32).toString("hex");
      await db.$transaction(async tx=>{
        await tx.verificationToken.deleteMany({where:{userId:user.id,id:{startsWith:"reset:"}}});
        await tx.verificationToken.create({data:{id:"reset:"+digest(raw),userId:user.id,expiresAt:new Date(Date.now()+1800000)}});
      });
      const resetUrl=\`\$\{process.env.APP_URL||req.nextUrl.origin}/reset-password?token=\$\{raw}\`;
      if(!dev)try{await nodemailer.createTransport(process.env.SMTP_URL!).sendMail({from:process.env.EMAIL_FROM,to:email,subject:"Reset your PeerConnect password",text:"This link expires in 30 minutes: "+resetUrl});}catch{throw new AppError("Recovery email could not be sent. Please try again.",503);}
      return NextResponse.json({...response,...(dev?{resetUrl}:{})});
    }
    if(action==="reset"){
      const p=z.object({token:z.string().min(20).max(128),password:z.string().min(10).max(128)}).parse(input);
      const passwordHash=await hash(p.password,12);
      await db.$transaction(async tx=>{
        const id="reset:"+digest(p.token);
        const t=await tx.verificationToken.findUnique({where:{id}});
        if(!t||t.expiresAt<new Date())throw new AppError("Recovery link is invalid or expired.");
        const user=await tx.user.findUnique({where:{id:t.userId}});
        if(!user||user.disabled||!user.verified)throw new AppError("Account unavailable.",403);
        await tx.verificationToken.delete({where:{id}});
        await tx.user.update({where:{id:t.userId},data:{passwordHash}});
        await tx.session.deleteMany({where:{userId:t.userId}});
        await tx.verificationToken.deleteMany({where:{userId:t.userId,id:{startsWith:"reset:"}}});
      });
      return NextResponse.json({message:"Password updated. Please log in again."});
    }
`+marker);writeFileSync(a,s);
p='components/auth-form.tsx';s=readFileSync(p,'utf8').replace('New to PeerConnect?','New to PeerConnect?');s=s.replace('  return (','  return (');s=s.replace('      <aside className="auth-aside">','      <Link href="/reset-password" className="recovery-link">Forgot your password?</Link>\n      <aside className="auth-aside">');writeFileSync(p,s);
mkdirSync('app/reset-password',{recursive:true});writeFileSync('app/reset-password/page.tsx',`import {Suspense} from 'react';\nimport {RecoveryForm} from '@/components/recovery-form';\nexport default function Page(){return <Suspense><RecoveryForm/></Suspense>;}`);
