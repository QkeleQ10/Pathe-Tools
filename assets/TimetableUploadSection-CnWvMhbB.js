import{u as z,h as O,_ as Y,a as Q}from"./server-Dsn4IpdH.js";import{K as X,r as S,D as q,d as Z,G as j,c as w,h as n,e as k,u as s,k as l,q as L,i as D,w as T,f as R,T as F,p as B,g as c,m as ee,C as te,o as m,x as ne}from"./index-fEQ7AaRa.js";import{e as se}from"./FileUploadBlock-WSfuaRBZ.js";import{n as h}from"./nl-BrHMK7y0.js";const re=X("tmsSchedule",()=>{const U=S([]),a=S({}),d=S("no-connection"),v=S([]),p=z();q($);async function $(){var t;if(p.username.length>0)try{d.value="receiving";const r=await e();(t=Object.values(r))!=null&&t[0]&&await I(r),d.value="received"}catch(r){d.value="receive-error",console.error(r)}else d.value="no-connection"}async function e(){return new Promise(async(t,r)=>{try{const o=await fetch(`${p.url}/users/${p.username}/timetable`,{headers:{"ngrok-skip-browser-warning":"true"}});if(!o.ok)throw new Error(`Server responded with ${o.status} ${o.statusText}`);const i=await o.json();if(!i)throw new Error("No data found");t(i)}catch(o){console.error("Error getting data from server:",o),r(o)}})}async function M(t){return new Promise(async(r,o)=>{try{const i=await fetch(`${p.url}/users/${p.username}/timetable`,{method:"POST",headers:{Authorization:"Basic "+btoa(`${p.username}:${p.password}`),"Content-Type":"application/json","ngrok-skip-browser-warning":"true"},body:JSON.stringify(t)});if(!i.ok)throw new Error(`Server responded with ${i.status} ${i.statusText}`);r(await i.json())}catch(i){console.error("Error sending data to server:",i),o(i)}})}async function x(t){try{const r=Array.isArray(t)?t[0]:t.item(0);if(!r)throw new Error("No file provided");const o=await C(r);if(await I(o),p.username.length>0&&p.password.length>0)try{d.value="sending",await M(o),d.value="sent"}catch(i){throw d.value="send-error",i}else d.value="no-credentials"}catch(r){throw console.error("Error processing file:",r),r}}async function I(t){return new Promise((r,o)=>{var g;if(!t||!((g=Object.values(t))!=null&&g[0])||!("timetable"in t)||!("metadata"in t))return o(new Error("Invalid JSON format"));const i=t.timetable.map(y=>({...y,scheduledTime:new Date(y.scheduledTime),showTime:new Date(y.showTime),mainShowTime:new Date(y.mainShowTime),creditsTime:new Date(y.creditsTime),endTime:new Date(y.endTime)}));U.value=i,a.value=t.metadata,r()})}async function C(t){return new Promise(async(r,o)=>{if(v.value=[],!t||!(P(t)||f(t)))return o(new Error("Invalid file type"));const g=(await t.text()).split(`
`),y=V(g[0]),K=g.slice(1).map(u=>{const A=V(u);return y.reduce((E,H,W)=>{var N;return E[H.trim()]=(N=A[W])==null?void 0:N.trim(),E},{})}).filter(u=>!u.PLAYLIST.includes("TMS-BLACK")).map(u=>{var A,E;return{title:_(u.PLAYLIST).title,extras:_(u.PLAYLIST).extras,playlist:u.PLAYLIST,feature:u.FEATURE,featureRating:u.FEATURE_RATING,auditorium:u.AUDITORIUM,auditoriumNumber:parseInt((E=(A=u.AUDITORIUM)==null?void 0:A.replace(/^\w+\s/,""))==null?void 0:E.split(" ")[0])||0,scheduledTime:b(u.SCHEDULED_TIME),showTime:b(u.SHOW_TIME),mainShowTime:b(u.FEATURE_TIME),creditsTime:b(u.CREDITS_TIME),endTime:b(u.END_TIME),duration:u.DURATION}});r({timetable:K,metadata:{name:t.name,type:t.type,lastModified:t.lastModified,uploadedDate:Date.now(),size:t.size,flags:v.value}})})}function P(t){return t.type==="text/csv"||t.name.endsWith(".csv")}function f(t){return t.type==="text/tsv"||t.name.endsWith(".tsv")}function G(t){const r=/"([^"]*)"/g;let o;const i=[];for(;(o=r.exec(t))!==null;)i.push(o[1]);return i}function J(t){const r=[];let o="",i=!1;for(const g of t)g==='"'?i=!i:g===","&&!i?(r.push(o.trim()),o=""):o+=g;return r.push(o.trim()),r}function V(t){return/"[^"]*"\t"[^"]*"/.test(t)?G(t):J(t)}function b(t){try{if(!t)return new Date(0);const r=new Date(t);if(r.getTime()>0)return r;{v.value.includes("times-only")||v.value.push("times-only");const o=new Date;o.getHours()<6&&o.setDate(o.getDate()-1);const i=new Date(`${o.toDateString()} ${t}`);return i.getHours()<6&&i.setDate(i.getDate()+1),i}}catch(r){return console.error("Error converting time string to date:",r),new Date(0)}}function _(t){var o;let r=((o=t.match(/(\s((4DX)|(ATMOS)|(IMX)|(3D)|(Music)|(ROOFTOP)|(PrideNight)|(Ladies)|(Premiere)|(\([A-Z]+\))))+/))==null?void 0:o[0].slice(1))||"";return{extras:r.length>0?r.split(" "):[],title:t.replace(r,"").trim()}}return{table:U,metadata:a,filesUploaded:x,status:d,connect:$}}),oe={id:"upload"},ae={class:"floating"},le=["title"],ie={key:0,style:{"flex-grow":"1"}},ue={key:1,style:{"flex-grow":"1"}},de={id:"server-options"},pe={class:"server-options-container"},me={class:"server-options-container"},ve={style:{float:"right",opacity:".5"}},fe={key:0,style:{display:"block","margin-block":"12px"}},ge={id:"file-upload-notice"},we={key:0},Te={key:1},ye={key:2},ce={key:3},ke={key:0},De=Z({__name:"TimetableUploadSection",setup(U){const a=re(),d=z(),v=S(!1),p=S(!1);return j(a,()=>p.value=!1,{deep:!0}),($,e)=>{const M=se,x=Y,I=te,C=ee,P=Q;return m(),w("section",oe,[n("div",ae,[n("button",{id:"upload-status",onClick:e[0]||(e[0]=f=>v.value=!0),title:s(O)[s(a).status].long||s(a).status+`
Klik om serveropties te wijzigen`},[n("div",{id:"upload-status-light",class:L(s(a).status)},null,2),l(" "+D(s(O)[s(a).status].short||s(a).status),1)],8,le)]),k(M,{onFilesUploaded:s(a).filesUploaded,accept:"text/csv,.csv,text/tsv,.tsv"},{default:T(()=>["name"in s(a).metadata?(m(),w("p",ie,[l(D(s(a).metadata.name)+" ",1),e[7]||(e[7]=n("br",null,null,-1)),n("small",null,[l(" Laatst gewijzigd op "+D(s(R)(new Date(s(a).metadata.lastModified),"PPPpp",{locale:s(h)}))+" ",1),e[6]||(e[6]=n("br",null,null,-1)),l(" Geüpload op "+D(s(R)(new Date(s(a).metadata.uploadedDate),"PPPpp",{locale:s(h)})),1)])])):(m(),w("p",ue,e[8]||(e[8]=[l(" Geen gegevens "),n("br",null,null,-1),n("small",null,[l("Upload een "),n("b",null,"TSV"),l("-bestand uit RosettaBridge (optie "),n("b",null,"Dates - ISO"),l(") met de knop of door hem hierheen te slepen.")],-1)])))]),_:1},8,["onFilesUploaded"]),k(F,null,{default:T(()=>[v.value?(m(),B(P,{key:0,onDismiss:e[4]||(e[4]=f=>v.value=!1)},{default:T(()=>[e[16]||(e[16]=n("h3",null,"Opslag op server",-1)),e[17]||(e[17]=n("p",null,[l(" Als je een geldige gebruikersnaam en wachtwoord hebt opgegeven, dan worden de door jou ingelezen gegevens bewaard op de server. "),n("br"),n("br"),l(" Je kunt vervolgens later (eventueel vanaf een ander apparaat) de gegevens downloaden als je daar ook je gebruikersnaam opgeeft. "),n("br"),n("br"),l(" Er is altijd maar één set gegevens op de server beschikbaar. Als je dus nieuwe gegevens inleest, dan worden de oude gewist. ")],-1)),n("div",de,[e[14]||(e[14]=n("em",{class:"label"},"Status",-1)),n("div",pe,[n("p",null,[n("span",{id:"upload-status-light",class:L(s(a).status)},null,2),n("strong",null,D(s(O)[s(a).status].short||s(a).status),1)]),n("p",null,D(s(O)[s(a).status].long),1)]),e[15]||(e[15]=n("em",{class:"label"},"Configuratie",-1)),n("div",me,[n("p",null,[e[9]||(e[9]=l("Serveradres")),n("span",ve,D(s(d).url),1)]),k(x,{modelValue:s(d).username,"onUpdate:modelValue":e[1]||(e[1]=f=>s(d).username=f),identifier:"username"},{default:T(()=>e[10]||(e[10]=[n("span",null,"Gebruikersnaam",-1)])),_:1},8,["modelValue"]),k(x,{modelValue:s(d).password,"onUpdate:modelValue":e[2]||(e[2]=f=>s(d).password=f),identifier:"password"},{default:T(()=>e[11]||(e[11]=[n("span",null,"Wachtwoord",-1)])),_:1},8,["modelValue"])]),["send-error","no-credentials","no-connection"].includes(s(a).status)?(m(),w("small",fe,"Let op: als je gegevens vernieuwt, dan gaan niet-geüploade wijzigingen verloren.")):c("",!0),k(C,{class:"primary full",onClick:e[3]||(e[3]=f=>{v.value=!1,s(a).connect()})},{default:T(()=>[k(I,null,{default:T(()=>e[12]||(e[12]=[l("check")])),_:1}),e[13]||(e[13]=l("Vernieuwen "))]),_:1})])]),_:1})):c("",!0)]),_:1}),k(F,null,{default:T(()=>[("type"in s(a).metadata&&s(a).metadata.type.includes("csv")||"flags"in s(a).metadata&&s(a).metadata.flags.includes("times-only"))&&!p.value?(m(),B(P,{key:0,onDismiss:e[5]||(e[5]=f=>p.value=!0)},{default:T(()=>[e[38]||(e[38]=n("h3",null,"Opmerking",-1)),n("p",ge,[e[26]||(e[26]=l(" Je hebt een ")),s(a).metadata.type.includes("csv")?(m(),w("span",we,e[18]||(e[18]=[n("b",null,"CSV",-1),l("-")]))):c("",!0),e[27]||(e[27]=l("bestand ")),s(a).metadata.flags.includes("times-only")?(m(),w("span",Te,e[19]||(e[19]=[l("met de optie "),n("b",null,"Times only",-1)]))):c("",!0),e[28]||(e[28]=l(" geüpload. Meestal werkt dat prima, maar soms kunnen er problemen optreden. ")),e[29]||(e[29]=n("br",null,null,-1)),e[30]||(e[30]=n("br",null,null,-1)),e[31]||(e[31]=l("Kies in RosettaBridge liever ")),s(a).metadata.flags.includes("times-only")?(m(),w("span",ye,e[20]||(e[20]=[n("em",null,"Dates - ISO",-1),l(" in plaats van "),n("i",null,"Dates - Times only",-1),l(". ")]))):c("",!0),s(a).metadata.type.includes("csv")?(m(),w("span",ce,[s(a).metadata.flags.includes("times-only")?(m(),w("span",ke,e[21]||(e[21]=[n("br",null,null,-1),l("Klik dan op ")]))):c("",!0),e[22]||(e[22]=n("em",null,"TSV",-1)),e[23]||(e[23]=l(" in plaats van ")),e[24]||(e[24]=n("i",null,"CSV",-1)),e[25]||(e[25]=l(". "))])):c("",!0),e[32]||(e[32]=l(" Dankjewel! ")),e[33]||(e[33]=n("br",null,null,-1)),e[34]||(e[34]=n("br",null,null,-1)),e[35]||(e[35]=l(" Groetjes, ")),e[36]||(e[36]=n("br",null,null,-1)),e[37]||(e[37]=l(" Quinten "))])]),_:1})):c("",!0)]),_:1})])}}}),Ie=ne(De,[["__scopeId","data-v-e722d5ff"]]);export{Ie as _,re as u};
