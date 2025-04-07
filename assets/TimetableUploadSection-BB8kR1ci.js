import{u as z,h,_ as Y,a as Q}from"./server-B_AbROc7.js";import{K as X,r as D,D as Z,d as q,G as j,c as v,g as s,e as S,u as n,k as l,p as R,i as c,w as y,f as M,T as F,m as B,h as k,s as ee,C as te,o as m,x as ne}from"./index-CyVwY3Wf.js";import{_ as se}from"./FileUploadBlock-BVqFoQJB.js";import{n as C}from"./nl-4DAbi5Re.js";const oe=X("tmsSchedule",()=>{const A=D([]),r=D({}),d=D("no-connection"),g=D([]),p=z();Z(O);async function O(){var t;if(p.username.length>0)try{d.value="receiving";const o=await e();(t=Object.values(o))!=null&&t[0]&&await I(o),d.value="received"}catch(o){d.value=p.url==="http://localhost:3541"?"no-connection":"receive-error",console.error(o)}else d.value="no-connection"}async function e(){return new Promise(async(t,o)=>{try{const a=await fetch(`${p.url}/users/${p.username}/timetable`,{headers:{"ngrok-skip-browser-warning":"true"}});if(!a.ok)throw new Error(`Server responded with ${a.status} ${a.statusText}`);const i=await a.json();if(!i)throw new Error("No data found");t(i)}catch(a){console.error("Error getting data from server:",a),o(a)}})}async function U(t){return new Promise(async(o,a)=>{try{const i=await fetch(`${p.url}/users/${p.username}/timetable`,{method:"POST",headers:{Authorization:"Basic "+btoa(`${p.username}:${p.password}`),"Content-Type":"application/json","ngrok-skip-browser-warning":"true"},body:JSON.stringify(t)});if(!i.ok)throw new Error(`Server responded with ${i.status} ${i.statusText}`);o(await i.json())}catch(i){console.error("Error sending data to server:",i),a(i)}})}async function x(t){try{const o=Array.isArray(t)?t[0]:t.item(0);if(!o)throw new Error("No file provided");const a=await $(o);if(await I(a),p.username.length>0&&p.password.length>0)try{d.value="sending",await U(a),d.value="sent"}catch(i){throw d.value=p.url==="http://localhost:3541"?"no-connection":"send-error",i}else d.value="no-credentials"}catch(o){throw console.error("Error processing file:",o),o}}async function I(t){return new Promise((o,a)=>{var w;if(!t||!((w=Object.values(t))!=null&&w[0])||!("timetable"in t)||!("metadata"in t))return a(new Error("Invalid JSON format"));const i=t.timetable.map(T=>({...T,scheduledTime:new Date(T.scheduledTime),showTime:new Date(T.showTime),mainShowTime:new Date(T.mainShowTime),creditsTime:new Date(T.creditsTime),endTime:new Date(T.endTime)}));A.value=i,r.value=t.metadata,o()})}async function $(t){return new Promise(async(o,a)=>{if(g.value=[],!t||!(_(t)||f(t)))return a(new Error("Invalid file type"));const w=(await t.text()).split(`
`),T=V(w[0]),K=w.slice(1).map(u=>{const P=V(u);return T.reduce((E,H,W)=>{var L;return E[H.trim()]=(L=P[W])==null?void 0:L.trim(),E},{})}).filter(u=>!u.PLAYLIST.includes("TMS-BLACK")).map(u=>{var P,E;return{title:N(u.PLAYLIST).title,extras:N(u.PLAYLIST).extras,playlist:u.PLAYLIST,feature:u.FEATURE,featureRating:u.FEATURE_RATING,auditorium:u.AUDITORIUM,auditoriumNumber:parseInt((E=(P=u.AUDITORIUM)==null?void 0:P.replace(/^\w+\s/,""))==null?void 0:E.split(" ")[0])||0,scheduledTime:b(u.SCHEDULED_TIME),showTime:b(u.SHOW_TIME),mainShowTime:b(u.FEATURE_TIME),creditsTime:b(u.CREDITS_TIME),endTime:b(u.END_TIME),duration:u.DURATION}});o({timetable:K,metadata:{name:t.name,type:t.type,lastModified:t.lastModified,uploadedDate:Date.now(),size:t.size,flags:g.value}})})}function _(t){return t.type==="text/csv"||t.name.endsWith(".csv")}function f(t){return t.type==="text/tsv"||t.name.endsWith(".tsv")}function G(t){const o=/"([^"]*)"/g;let a;const i=[];for(;(a=o.exec(t))!==null;)i.push(a[1]);return i}function J(t){const o=[];let a="",i=!1;for(const w of t)w==='"'?i=!i:w===","&&!i?(o.push(a.trim()),a=""):a+=w;return o.push(a.trim()),o}function V(t){return/"[^"]*"\t"[^"]*"/.test(t)?G(t):J(t)}function b(t){try{if(!t)return new Date(0);const o=new Date(t);if(o.getTime()>0)return o;{g.value.includes("times-only")||g.value.push("times-only");const a=new Date;a.getHours()<6&&a.setDate(a.getDate()-1);const i=new Date(`${a.toDateString()} ${t}`);return i.getHours()<6&&i.setDate(i.getDate()+1),i}}catch(o){return console.error("Error converting time string to date:",o),new Date(0)}}function N(t){var a;let o=((a=t.match(/(\s((4DX)|(ATMOS)|(IMX)|(3D)|(Music)|(ROOFTOP)|(PrideNight)|(Ladies)|(Premiere)|(\([A-Z]+\))))+/))==null?void 0:a[0].slice(1))||"";return{extras:o.length>0?o.split(" "):[],title:t.replace(o,"").trim()}}return{table:A,metadata:r,filesUploaded:x,status:d,connect:O}}),re={id:"upload"},ae={class:"floating"},le=["title"],ie={key:0,style:{"flex-grow":"1"}},ue={key:0},de={key:1},pe={key:1,style:{"flex-grow":"1"}},me={id:"server-options"},ve={class:"server-options-container"},ge={class:"server-options-container"},fe={style:{float:"right",opacity:".5"}},we={key:0,style:{display:"block","margin-block":"12px"}},ce={id:"file-upload-notice"},ye={key:0},Te={key:1},ke={key:2},Se={key:3},De={key:0},be=q({__name:"TimetableUploadSection",setup(A){const r=oe(),d=z(),g=D(!1),p=D(!1);return j(r,()=>p.value=!1,{deep:!0}),(O,e)=>{const U=se,x=Y,I=te,$=ee,_=Q;return m(),v("section",re,[s("div",ae,[s("button",{id:"upload-status",onClick:e[0]||(e[0]=f=>g.value=!0),title:n(h)[n(r).status].long||n(r).status+`
Klik om serveropties te wijzigen`},[s("div",{id:"upload-status-light",class:R(n(r).status)},null,2),l(" "+c(n(h)[n(r).status].short||n(r).status),1)],8,le)]),S(U,{onFilesUploaded:n(r).filesUploaded,accept:"text/csv,.csv,text/tsv,.tsv"},{default:y(()=>["name"in n(r).metadata?(m(),v("p",ie,[l(c(n(r).metadata.name)+" ",1),e[6]||(e[6]=s("br",null,null,-1)),s("small",null,[l(c(n(r).table.length)+" voorstellingen ",1),n(r).metadata.flags.includes("times-only")?(m(),v("span",ue,"zonder datum")):(m(),v("span",de,"op "+c(n(M)(n(r).table[0].scheduledTime,"PP",{locale:n(C)})),1)),l(" • Laatst gewijzigd op "+c(n(M)(n(r).metadata.lastModified,"PPpp",{locale:n(C)}))+" • Geüpload op "+c(n(M)(n(r).metadata.uploadedDate,"PPpp",{locale:n(C)})),1)])])):(m(),v("p",pe,e[7]||(e[7]=[l(" Geen gegevens "),s("br",null,null,-1),s("small",null,[l("Upload een "),s("b",null,"TSV"),l("-bestand uit RosettaBridge (optie "),s("b",null,"Dates - ISO"),l(") met de knop of door hem hierheen te slepen.")],-1)])))]),_:1},8,["onFilesUploaded"]),S(F,null,{default:y(()=>[g.value?(m(),B(_,{key:0,onDismiss:e[4]||(e[4]=f=>g.value=!1)},{default:y(()=>[e[15]||(e[15]=s("h3",null,"Opslag op server",-1)),e[16]||(e[16]=s("p",null,[l(" Als je een geldige gebruikersnaam en wachtwoord hebt opgegeven, dan worden de door jou ingelezen gegevens bewaard op de server. "),s("br"),s("br"),l(" Je kunt vervolgens later (eventueel vanaf een ander apparaat) de gegevens downloaden als je daar ook je gebruikersnaam opgeeft. "),s("br"),s("br"),l(" Er is altijd maar één set gegevens op de server beschikbaar. Als je dus nieuwe gegevens inleest, dan worden de oude gewist. ")],-1)),s("div",me,[e[13]||(e[13]=s("em",{class:"label"},"Status",-1)),s("div",ve,[s("p",null,[s("span",{id:"upload-status-light",class:R(n(r).status)},null,2),s("strong",null,c(n(h)[n(r).status].short||n(r).status),1)]),s("p",null,c(n(h)[n(r).status].long),1)]),e[14]||(e[14]=s("em",{class:"label"},"Configuratie",-1)),s("div",ge,[s("p",null,[e[8]||(e[8]=l("Serveradres")),s("span",fe,c(n(d).url),1)]),S(x,{modelValue:n(d).username,"onUpdate:modelValue":e[1]||(e[1]=f=>n(d).username=f),identifier:"username"},{default:y(()=>e[9]||(e[9]=[s("span",null,"Gebruikersnaam",-1)])),_:1},8,["modelValue"]),S(x,{modelValue:n(d).password,"onUpdate:modelValue":e[2]||(e[2]=f=>n(d).password=f),identifier:"password"},{default:y(()=>e[10]||(e[10]=[s("span",null,"Wachtwoord",-1)])),_:1},8,["modelValue"])]),["send-error","no-credentials","no-connection"].includes(n(r).status)?(m(),v("small",we,"Let op: als je gegevens vernieuwt, dan gaan niet-geüploade wijzigingen verloren.")):k("",!0),S($,{class:"primary full",onClick:e[3]||(e[3]=f=>{g.value=!1,n(r).connect()})},{default:y(()=>[S(I,null,{default:y(()=>e[11]||(e[11]=[l("check")])),_:1}),e[12]||(e[12]=l("Vernieuwen "))]),_:1})])]),_:1})):k("",!0)]),_:1}),S(F,null,{default:y(()=>[("type"in n(r).metadata&&n(r).metadata.type.includes("csv")||"flags"in n(r).metadata&&n(r).metadata.flags.includes("times-only"))&&!p.value?(m(),B(_,{key:0,onDismiss:e[5]||(e[5]=f=>p.value=!0)},{default:y(()=>[e[37]||(e[37]=s("h3",null,"Opmerking",-1)),s("p",ce,[e[25]||(e[25]=l(" Je hebt een ")),n(r).metadata.type.includes("csv")?(m(),v("span",ye,e[17]||(e[17]=[s("b",null,"CSV",-1),l("-")]))):k("",!0),e[26]||(e[26]=l("bestand ")),n(r).metadata.flags.includes("times-only")?(m(),v("span",Te,e[18]||(e[18]=[l("met de optie "),s("b",null,"Times only",-1)]))):k("",!0),e[27]||(e[27]=l(" geüpload. Meestal werkt dat prima, maar soms kunnen er problemen optreden. ")),e[28]||(e[28]=s("br",null,null,-1)),e[29]||(e[29]=s("br",null,null,-1)),e[30]||(e[30]=l("Kies in RosettaBridge liever ")),n(r).metadata.flags.includes("times-only")?(m(),v("span",ke,e[19]||(e[19]=[s("em",null,"Dates - ISO",-1),l(" in plaats van "),s("i",null,"Dates - Times only",-1),l(". ")]))):k("",!0),n(r).metadata.type.includes("csv")?(m(),v("span",Se,[n(r).metadata.flags.includes("times-only")?(m(),v("span",De,e[20]||(e[20]=[s("br",null,null,-1),l("Klik dan op ")]))):k("",!0),e[21]||(e[21]=s("em",null,"TSV",-1)),e[22]||(e[22]=l(" in plaats van ")),e[23]||(e[23]=s("i",null,"CSV",-1)),e[24]||(e[24]=l(". "))])):k("",!0),e[31]||(e[31]=l(" Dankjewel! ")),e[32]||(e[32]=s("br",null,null,-1)),e[33]||(e[33]=s("br",null,null,-1)),e[34]||(e[34]=l(" Groetjes, ")),e[35]||(e[35]=s("br",null,null,-1)),e[36]||(e[36]=l(" Quinten "))])]),_:1})):k("",!0)]),_:1})])}}}),Pe=ne(be,[["__scopeId","data-v-71f68de5"]]);export{Pe as _,oe as u};
