const https = require('https');
const VERIFY_TOKEN = 'cleanswift_bot_2026';
const PRICES = {
  standard: {'1bd1ba':135,'2bd1ba':160,'2bd2ba':190,'3bd2ba':225,'3bd3ba':250,'4bd2ba':270,'4bd3ba':295},
  deep:     {'1bd1ba':189,'2bd1ba':224,'2bd2ba':266,'3bd2ba':315,'3bd3ba':350,'4bd2ba':378,'4bd3ba':413},
  moveinout:{'1bd1ba':202,'2bd1ba':240,'2bd2ba':285,'3bd2ba':338,'3bd3ba':375,'4bd2ba':405,'4bd3ba':443},
};
const sessions = {};
function gs(id){if(!sessions[id])sessions[id]={step:'welcome',data:{}};return sessions[id];}
function rs(id){sessions[id]={step:'welcome',data:{}};}
function pk(bd,ba){
  if(bd>=4&&ba>=3)return'4bd3ba';if(bd>=4)return'4bd2ba';
  if(bd>=3&&ba>=3)return'3bd3ba';if(bd>=3)return'3bd2ba';
  if(bd>=2&&ba>=2)return'2bd2ba';if(bd>=2)return'2bd1ba';return'1bd1ba';
}
function pm(uid,text){
  const s=gs(uid);const msg=text.toLowerCase().trim();
  let r='';let qr=[];
  if(msg==='restart'||msg.includes('start over')||msg==='menu'||msg==='hi'||msg==='hello'||msg==='hey'){rs(uid);s.step='welcome';}
  switch(s.step){
    case 'welcome':
      r='Hi! 👋 Welcome to CleanSwift Edmonton!\n\nFlat-rate pricing — no surprises.\n\nWhat service do you need?';
      qr=[{t:'🏠 House Cleaning',p:'house'},{t:'🛋️ Carpet Cleaning',p:'carpet'},{t:'📦 Move In/Out',p:'move'},{t:'🏡 Airbnb/STR',p:'airbnb'},{t:'🏢 Commercial',p:'commercial'},{t:'🏗️ Garage',p:'garage'}];
      s.step='svc';break;
    case 'svc':
      if(msg.includes('house')||msg.includes('residential')){
        s.data.svc='res';r='What type of cleaning?';
        qr=[{t:'✨ Standard',p:'standard'},{t:'🧽 Deep Clean',p:'deep'},{t:'📦 Move In/Out',p:'move'}];s.step='type';
      }else if(msg.includes('carpet')){
        s.data.svc='carpet';r='How many rooms to clean?';
        qr=[{t:'1 room',p:'1'},{t:'2 rooms',p:'2'},{t:'3 rooms',p:'3'},{t:'4+ rooms',p:'4'}];s.step='crooms';
      }else if(msg.includes('move')){
        s.data.svc='res';s.data.type='moveinout';r='How many bedrooms?';
        qr=[{t:'1 bd',p:'1'},{t:'2 bd',p:'2'},{t:'3 bd',p:'3'},{t:'4 bd',p:'4'}];s.step='bds';
      }else if(msg.includes('airbnb')){
        s.data.svc='airbnb';r='What size is the unit?';
        qr=[{t:'Studio — $95',p:'95'},{t:'2bd/1ba — $135',p:'135'},{t:'2bd/2ba — $155',p:'155'},{t:'3bd/2ba — $185',p:'185'},{t:'3bd/3ba — $215',p:'215'},{t:'4bd+ — $249',p:'249'}];s.step='asize';
      }else if(msg.includes('commercial')){
        r='🏢 Commercial pricing is custom.\n\nWhatsApp us:\n👉 wa.me/13688855157\n\nTell us: size (sq ft), type of business, location.';
        qr=[{t:'🔄 Start over',p:'restart'}];s.step='welcome';
      }else if(msg.includes('garage')){
        r='🏗️ Garage Organization\n\nFREE 30-min assessment included.\n\nWhatsApp us:\n👉 wa.me/13688855157';
        qr=[{t:'🔄 Start over',p:'restart'}];s.step='welcome';
      }else{
        r='Please choose a service:';
        qr=[{t:'🏠 House Cleaning',p:'house'},{t:'🛋️ Carpet',p:'carpet'},{t:'📦 Move In/Out',p:'move'},{t:'🏡 Airbnb',p:'airbnb'}];
      }
      break;
    case 'type':
      if(msg.includes('standard'))s.data.type='standard';
      else if(msg.includes('deep'))s.data.type='deep';
      else if(msg.includes('move'))s.data.type='moveinout';
      else s.data.type='standard';
      r='How many bedrooms?';
      qr=[{t:'1 bd',p:'1'},{t:'2 bd',p:'2'},{t:'3 bd',p:'3'},{t:'4 bd',p:'4'}];s.step='bds';break;
    case 'bds':
      s.data.bd=parseInt(msg.match(/\d+/)?.[0]||'2');
      r='How many bathrooms?';
      qr=[{t:'1 ba',p:'1'},{t:'2 ba',p:'2'},{t:'3 ba',p:'3'}];s.step='bas';break;
    case 'bas':
      const ba=parseInt(msg.match(/\d+/)?.[0]||'1');
      const tp=s.data.type||'standard';
      const k=pk(s.data.bd,ba);
      const p=PRICES[tp]?.[k]||135;
      s.data.price=p;
      const tl={standard:'Standard Clean ✨',deep:'Deep Clean 🧽',moveinout:'Move In/Out 📦'};
      r=`Your CleanSwift Quote:\n\n━━━━━━━━━━━━━━\n${tl[tp]}\n🛏️ ${s.data.bd}bd / ${ba}ba\n💰 $${p}\n━━━━━━━━━━━━━━\n\n✅ Flat-rate pricing\n✅ Professional products\n✅ Before & after photos\n✅ On-time guarantee\n✅ Satisfaction guaranteed\n\nReady to book? 📅`;
      qr=[{t:'✅ Book now!',p:'book'},{t:'➕ Add extras',p:'extras'},{t:'🔄 New quote',p:'restart'}];s.step='price';break;
    case 'crooms':
      const rm=parseInt(msg.match(/\d+/)?.[0]||'1');
      const cp=Math.max(129,rm*85);s.data.price=cp;
      r=`Carpet Cleaning Quote:\n\n━━━━━━━━━━━━━━\n${rm} room${rm>1?'s':''} × $85\n💰 $${cp}${cp===129?' (min charge)':''}\n━━━━━━━━━━━━━━\n\n✅ Hot water extraction 210°F\n✅ Dry in 30-45 min\n✅ Before & after photos\n\nReady to book? 📅`;
      qr=[{t:'✅ Book now!',p:'book'},{t:'🐾 Add pet treatment',p:'pet'},{t:'🔄 New quote',p:'restart'}];s.step='price';break;
    case 'asize':
      const ap=parseInt(msg.match(/\d+/)?.[0]||'95');
      const al={95:'Studio/1bd',135:'2bd/1ba',155:'2bd/2ba',185:'3bd/2ba',215:'3bd/3ba',249:'4bd+'};
      const av=al[ap]||'Studio/1bd';s.data.price=ap;
      r=`Airbnb Turnover Quote:\n\n━━━━━━━━━━━━━━\n${av}\n💰 $${ap} per turnover\n━━━━━━━━━━━━━━\n\n✅ Full reset between guests\n✅ Condition photos sent to host\n✅ On-time guarantee\n\nReady to book? 📅`;
      qr=[{t:'✅ Book now!',p:'book'},{t:'🛏️ Add linen +$20/bed',p:'linen'},{t:'🔄 New quote',p:'restart'}];s.step='price';break;
    case 'price':
      if(msg.includes('book')){
        r=`Excellent! 🎉\n\nTo confirm your booking:\n👉 wa.me/13688855157\n\nPlease send:\n📍 Your address\n📅 Preferred date & time\n\nWe confirm in 5 minutes! ⚡\n\nThank you for choosing CleanSwift! 💚`;
        qr=[{t:'🔄 New quote',p:'restart'}];s.step='done';
      }else if(msg.includes('extra')){
        r=`Add-ons available:\n\n🔥 Inside Oven → +$35\n❄️ Inside Fridge → +$30\n🪟 Windows → +$5/window\n🗄️ Inside Cabinets → +$40\n🏠 Basement → +$40\n🧺 Laundry → +$35/load\n🛋️ Carpet → +$85/room\n\nAdd via WhatsApp:\n👉 wa.me/13688855157`;
        qr=[{t:'✅ Book now!',p:'book'},{t:'🔄 New quote',p:'restart'}];
      }else if(msg.includes('pet')){
        r=`🐾 Pet odour treatment: +$30/room\nUpdated: $${s.data.price+30}\n\nReady to book?`;
        qr=[{t:'✅ Book now!',p:'book'},{t:'🔄 New quote',p:'restart'}];
      }else if(msg.includes('linen')){
        r=`🛏️ Linen change: +$20/bed\n\nWhatsApp to confirm number of beds:\n👉 wa.me/13688855157`;
        qr=[{t:'✅ Book now!',p:'book'},{t:'🔄 New quote',p:'restart'}];
      }else{
        r='Would you like to book?';
        qr=[{t:'✅ Book now!',p:'book'},{t:'🔄 New quote',p:'restart'}];
      }
      break;
    default:rs(uid);return pm(uid,'hi');
  }
  return{r,qr};
}
function sndMsg(id,text,qr=[]){
  const d=JSON.stringify({recipient:{id},message:{text,...(qr.length>0&&{quick_replies:qr.slice(0,13).map(q=>({content_type:'text',title:q.t.substring(0,20),payload:q.p}))})}});
  const o={hostname:'graph.facebook.com',path:`/v18.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(d)}};
  const req=https.request(o,res=>{let x='';res.on('data',c=>x+=c);res.on('end',()=>console.log('FB:',x));});
  req.on('error',e=>console.error(e));req.write(d);req.end();
}
function sndWA(to,text){
  const d=JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{body:text}});
  const o={hostname:'graph.facebook.com',path:`/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,method:'POST',headers:{'Authorization':`Bearer ${process.env.WHATSAPP_TOKEN}`,'Content-Type':'application/json','Content-Length':Buffer.byteLength(d)}};
  const req=https.request(o,res=>{let x='';res.on('data',c=>x+=c);res.on('end',()=>console.log('WA:',x));});
  req.on('error',e=>console.error(e));req.write(d);req.end();
}
module.exports=function(req,res){
  if(req.method==='GET'){
    const{['hub.mode']:mode,['hub.verify_token']:token,['hub.challenge']:challenge}=req.query;
    if(mode==='subscribe'&&token===VERIFY_TOKEN)return res.status(200).send(challenge);
    return res.status(403).send('Forbidden');
  }
  if(req.method==='POST'){
    const data=req.body||{};
    if(data.object==='page'){
      (data.entry||[]).forEach(e=>{
        (e.messaging||[]).forEach(ev=>{
          const id=ev.sender?.id;if(!id)return;
          const txt=ev.message?.text||ev.postback?.payload||'';
          if(txt){const{r,qr}=pm(id,txt);sndMsg(id,r,qr);}
        });
      });
    }else if(data.object==='whatsapp_business_account'){
      (data.entry||[]).forEach(e=>{
        (e.changes||[]).forEach(c=>{
          (c.value?.messages||[]).forEach(m=>{
            const txt=m.text?.body||'';
            if(txt){const{r}=pm(m.from,txt);sndWA(m.from,r);}
          });
        });
      });
    }
    return res.status(200).send('EVENT_RECEIVED');
  }
  res.status(200).json({status:'CleanSwift Bot running 🚀',version:'2.0'});
};
