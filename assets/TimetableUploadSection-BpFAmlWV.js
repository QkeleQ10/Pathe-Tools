import{d as R,y as Y,z as K,c as S,h as r,A as W,a as X,J as q,o as h,x as B,K as Q,r as $,D as Z,e as _,k as p,u as o,q as C,i as T,w,f as V,T as j,p as ee,g as L,m as te,C as se}from"./index-C_ZHNiyK.js";import{u as z,h as x,_ as ne,a as ae,b as oe}from"./server-C5iWb6-P.js";import{n as N}from"./nl-BWzt2fFA.js";const re=["for"],ie={class:"title"},le=["id"],ue=R({__name:"InputCheckbox",props:Y({identifier:{}},{modelValue:{type:Boolean},modelModifiers:{}}),emits:["update:modelValue"],setup(m){const a=K(m,"modelValue");return(l,u)=>(h(),S("label",{class:"input",for:l.identifier},[r("div",ie,[X(l.$slots,"default",{},void 0,!0)]),W(r("input",{type:"checkbox",id:l.identifier,"onUpdate:modelValue":u[0]||(u[0]=y=>a.value=y)},null,8,le),[[q,a.value]])],8,re))}}),De=B(ue,[["__scopeId","data-v-fa1944bc"]]),de=Q("tmsSchedule",()=>{const m=$([]),a=$({}),l=$("no-connection"),u=z();Z(f);const y=new Date,e=new Date;e.setHours(5,0,0,0),y>e&&e.setDate(e.getDate()+1),setTimeout(()=>{f(),setInterval(f,24*60*60*1e3)},e.getTime()-y.getTime());async function f(){var t;for(;m.value.length;)m.value.pop();for(;Object.keys(a.value).length;)delete a.value[Object.keys(a.value)[0]];if(u.username.length>0)try{l.value="receiving";const s=await b();(t=Object.values(s))!=null&&t[0]&&await E(s),l.value="received"}catch(s){l.value="receive-error",console.error(s)}else l.value="no-connection"}async function b(){return new Promise(async(t,s)=>{try{const n=await fetch(`${u.url}/users/${u.username}/timetable`,{headers:{"ngrok-skip-browser-warning":"true"}});if(!n.ok)throw new Error(`Server responded with ${n.status} ${n.statusText}`);const i=await n.json();if(!i)throw new Error("No data found");t(i)}catch(n){console.error("Error getting data from server:",n),s(n)}})}async function A(t){return new Promise(async(s,n)=>{try{const i=await fetch(`${u.url}/users/${u.username}/timetable`,{method:"POST",headers:{Authorization:"Basic "+btoa(`${u.username}:${u.password}`),"Content-Type":"application/json","ngrok-skip-browser-warning":"true"},body:JSON.stringify(t)});if(!i.ok)throw new Error(`Server responded with ${i.status} ${i.statusText}`);s(await i.json())}catch(i){console.error("Error sending data to server:",i),n(i)}})}async function M(t){try{const s=Array.isArray(t)?t[0]:t.item(0);if(!s)throw new Error("No file provided");const n=await v(s);if(await E(n),u.username.length>0&&u.password.length>0)try{l.value="sending",await A(n),l.value="sent"}catch(i){throw l.value="send-error",i}else l.value="no-credentials"}catch(s){throw console.error("Error processing file:",s),s}}async function E(t){return new Promise((s,n)=>{var c;if(!t||!((c=Object.values(t))!=null&&c[0])||!("timetable"in t)||!("metadata"in t))return n(new Error("Invalid JSON format"));for(;m.value.length;)m.value.pop();for(;Object.keys(a.value).length;)delete a.value[Object.keys(a.value)[0]];const i=t.timetable.map(g=>({...g,scheduledTime:new Date(g.scheduledTime),showTime:new Date(g.showTime),mainShowTime:new Date(g.mainShowTime),creditsTime:new Date(g.creditsTime),endTime:new Date(g.endTime)}));m.value.push(...i),Object.assign(a.value,t.metadata),s()})}async function v(t){return new Promise(async(s,n)=>{if(!t||!F(t))return n(new Error("Invalid file type"));const c=(await t.text()).split(`
`),g=O(c[0]),J=c.slice(1).map(d=>{const I=O(d);return g.reduce((D,G,H)=>{var U;return D[G.trim()]=(U=I[H])==null?void 0:U.trim(),D},{})}).filter(d=>!d.PLAYLIST.includes("TMS-BLACK")).map(d=>{var I,D;return{title:P(d.PLAYLIST).title,extras:P(d.PLAYLIST).extras,playlist:d.PLAYLIST,feature:d.FEATURE,featureRating:d.FEATURE_RATING,auditorium:d.AUDITORIUM,auditoriumNumber:parseInt((D=(I=d.AUDITORIUM)==null?void 0:I.replace(/^\w+\s/,""))==null?void 0:D.split(" ")[0])||0,scheduledTime:k(d.SCHEDULED_TIME),showTime:k(d.SHOW_TIME),mainShowTime:k(d.FEATURE_TIME),creditsTime:k(d.CREDITS_TIME),endTime:k(d.END_TIME),duration:d.DURATION}});s({timetable:J,metadata:{name:t.name,type:t.type,lastModified:t.lastModified,uploadedDate:Date.now(),size:t.size}})})}function F(t){return t.type==="text/csv"||t.type==="application/vnd.ms-excel"||t.name.endsWith(".csv")}function O(t){const s=[];let n="",i=!1;for(const c of t)c==='"'?i=!i:c===","&&!i?(s.push(n.trim()),n=""):n+=c;return s.push(n.trim()),s}function k(t){const s=new Date;s.getHours()<6&&s.setDate(s.getDate()-1);const n=new Date(`${s.toDateString()} ${t}`);return n.getHours()<6&&n.setDate(n.getDate()+1),n}function P(t){var n;let s=((n=t.match(/(\s((4DX)|(ATMOS)|(IMX)|(3D)|(Music)|(ROOFTOP)|(PrideNight)|(Ladies)|(Premiere)|(\([A-Z]+\))))+/))==null?void 0:n[0].slice(1))||"";return{extras:s.length>0?s.split(" "):[],title:t.replace(s,"").trim()}}return{table:m,metadata:a,filesUploaded:M,status:l,connect:f}}),pe={id:"upload"},me=["title"],ce={key:0,style:{"flex-grow":"1"}},ve={key:1,style:{"flex-grow":"1"}},ge={id:"server-options"},we={class:"server-options-container"},fe={class:"server-options-container"},_e={key:0,style:{display:"block","margin-block":"12px"}},Te=R({__name:"TimetableUploadSection",setup(m){const a=de(),l=z(),u=$(!1);return(y,e)=>{const f=ne,b=ae,A=se,M=te,E=oe;return h(),S("section",pe,[r("h2",null,[e[5]||(e[5]=p("Gegevensbestand ")),r("button",{id:"upload-status",onClick:e[0]||(e[0]=v=>u.value=!0),title:o(x)[o(a).status].long||o(a).status+`
Klik om serveropties te wijzigen`},[r("div",{id:"upload-status-light",class:C(o(a).status)},null,2),p(" "+T(o(x)[o(a).status].short||o(a).status),1)],8,me)]),_(f,{onFilesUploaded:o(a).filesUploaded,accept:"text/csv,.csv"},{default:w(()=>["name"in o(a).metadata?(h(),S("p",ce,[p(T(o(a).metadata.name)+" ",1),e[7]||(e[7]=r("br",null,null,-1)),r("small",null,[p(" Laatst gewijzigd op "+T(o(V)(new Date(o(a).metadata.lastModified),"PPPpp",{locale:o(N)}))+" ",1),e[6]||(e[6]=r("br",null,null,-1)),p(" Geüpload op "+T(o(V)(new Date(o(a).metadata.uploadedDate),"PPPpp",{locale:o(N)})),1)])])):(h(),S("p",ve,e[8]||(e[8]=[p(" Geen gegevens "),r("br",null,null,-1),r("small",null,"Upload een CSV-bestand uit RosettaBridge (met optie 'times only')",-1)])))]),_:1},8,["onFilesUploaded"]),_(j,null,{default:w(()=>[u.value?(h(),ee(E,{key:0,onDismiss:e[4]||(e[4]=v=>u.value=!1)},{default:w(()=>[e[15]||(e[15]=r("h3",null,"Opslag op server",-1)),e[16]||(e[16]=r("p",null,[p(" Als je een geldige gebruikersnaam en wachtwoord hebt opgegeven, dan worden de door jou ingelezen gegevens bewaard op de server. "),r("br"),r("br"),p(" Je kunt vervolgens later (eventueel vanaf een ander apparaat) de gegevens downloaden als je daar ook je gebruikersnaam opgeeft. "),r("br"),r("br"),p(" Er is altijd maar één set gegevens op de server beschikbaar. Als je dus nieuwe gegevens inleest, dan worden de oude gewist. ")],-1)),r("div",ge,[e[13]||(e[13]=r("em",{class:"label"},"Status",-1)),r("div",we,[r("p",null,[r("span",{id:"upload-status-light",class:C(o(a).status)},null,2),r("strong",null,T(o(x)[o(a).status].short||o(a).status),1)]),r("p",null,T(o(x)[o(a).status].long),1)]),e[14]||(e[14]=r("em",{class:"label"},"Configuratie",-1)),r("div",fe,[_(b,{modelValue:o(l).username,"onUpdate:modelValue":e[1]||(e[1]=v=>o(l).username=v),identifier:"username"},{default:w(()=>e[9]||(e[9]=[r("span",null,"Gebruikersnaam",-1)])),_:1},8,["modelValue"]),_(b,{modelValue:o(l).password,"onUpdate:modelValue":e[2]||(e[2]=v=>o(l).password=v),identifier:"password"},{default:w(()=>e[10]||(e[10]=[r("span",null,"Wachtwoord",-1)])),_:1},8,["modelValue"])]),["send-error","no-credentials","no-connection"].includes(o(a).status)?(h(),S("small",_e,"Let op: als je gegevens vernieuwt, dan gaan niet-geüploade wijzigingen verloren.")):L("",!0),_(M,{class:"full",onClick:e[3]||(e[3]=v=>{u.value=!1,o(a).connect()})},{default:w(()=>[_(A,null,{default:w(()=>e[11]||(e[11]=[p("check")])),_:1}),e[12]||(e[12]=p("Vernieuwen "))]),_:1})])]),_:1})):L("",!0)]),_:1})])}}}),Se=B(Te,[["__scopeId","data-v-c7a881b4"]]);export{Se as _,De as a,de as u};
