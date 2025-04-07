import{_ as ne,a as se,b as te,c as oe}from"./InputNumber-C-3sLF-3.js";import{K as ae,r as $,D as le,d as P,c as v,g as n,e as d,u as s,k as m,p as A,i as x,w as l,F as I,j as L,m as N,h as F,C as O,T as re,s as R,o as i,x as G,L as ie,_ as ue,I as de,l as ce,A as me,B as pe}from"./index-CyVwY3Wf.js";import{u as K,h as j,_ as fe,a as ge}from"./server-B_AbROc7.js";import{_ as ve,d as _e,e as we,c as ke,a as be}from"./FileUploadBlock-BVqFoQJB.js";const Z=ae("slideshowImages",()=>{const y=$([]),c=$("no-connection"),_=K();le(o);async function o(){var f;for(;y.value.length;)y.value.pop();if(_.username.length>0)try{c.value="receiving";const p=await u();(f=Object.values(p))!=null&&f[0]&&y.value.push(...p),c.value="received"}catch(p){c.value="receive-error",console.error(p)}else c.value="no-connection"}async function u(){return new Promise(async(f,p)=>{try{const a=await fetch(`http://localhost:3541/users/${_.username}/pictures`,{headers:{"ngrok-skip-browser-warning":"true"}});if(!a.ok)throw new Error(`Server responded with ${a.status} ${a.statusText}`);const g=await a.json();if(!g)throw new Error("No data found");const w=await Promise.all(g.map(async r=>await e(r)));f(w)}catch(a){console.error("Error getting data from server:",a),p(a)}})}async function k(f){return new Promise(async(p,a)=>{try{c.value="sending";const g=new FormData;for(const b of f)g.append("pictures",b);const w=await fetch(`http://localhost:3541/users/${_.username}/pictures`,{method:"POST",headers:{Authorization:"Basic "+btoa(`${_.username}:${_.password}`),"ngrok-skip-browser-warning":"true"},body:g});if(!w.ok)throw new Error(`Server responded with ${w.status} ${w.statusText}`);const r=await w.json();if(!r)throw new Error("No data found");c.value="receiving",y.value=[...y.value,...await Promise.all(r.files.map(async b=>await e(b)))].sort((b,S)=>b.localeCompare(S)),c.value="sent",p()}catch(g){c.value="send-error",console.error(g),a(g)}})}async function T(){return new Promise(async(f,p)=>{try{c.value="sending";const a=await fetch(`http://localhost:3541/users/${_.username}/pictures`,{method:"DELETE",headers:{Authorization:"Basic "+btoa(`${_.username}:${_.password}`),"ngrok-skip-browser-warning":"true"}});if(!a.ok)throw new Error(`Server responded with ${a.status} ${a.statusText}`);y.value=[],c.value="sent",f()}catch(a){c.value="send-error",p(a)}})}async function e(f){const a=await(await fetch(`http://localhost:3541/users/${_.username}/pictures/${f}`,{headers:{"ngrok-skip-browser-warning":"true"}})).blob();return URL.createObjectURL(a)}return{images:y,filesUploaded:k,deleteAll:T,fetchImage:e,status:c,connect:o}}),he={id:"upload"},ye={class:"floating"},$e=["title"],Se={key:0,class:"pictures",style:{"flex-grow":"1"}},Te=["src","onClick"],Ce={key:1,style:{"flex-grow":"1"}},Ee={id:"server-options"},xe={class:"server-options-container"},Ue={class:"server-options-container"},De={style:{float:"right",opacity:".5"}},Ve=P({__name:"SlideshowUploadSection",emits:["slide-clicked"],setup(y,{emit:c}){const _=c,o=Z(),u=K(),k=$(!1);return(T,e)=>{const f=O,p=R,a=ve,g=fe,w=ge;return i(),v("section",he,[n("div",ye,[n("button",{id:"upload-status",onClick:e[0]||(e[0]=r=>k.value=!0),title:s(j)[s(o).status].long||s(o).status+`
Klik om serveropties te wijzigen`},[n("div",{id:"upload-status-light",class:A(s(o).status)},null,2),m(" "+x(s(j)[s(o).status].short||s(o).status),1)],8,$e)]),d(a,{onFilesUploaded:s(o).filesUploaded,accept:"image/*",multiple:""},{buttons:l(()=>{var r;return[(r=s(o).images)!=null&&r.length?(i(),N(p,{key:0,class:"secondary",onClick:s(o).deleteAll},{default:l(()=>[d(f,null,{default:l(()=>e[6]||(e[6]=[m("delete_forever")])),_:1}),e[7]||(e[7]=m("Alles verwijderen "))]),_:1},8,["onClick"])):F("",!0)]}),default:l(()=>{var r;return[(r=s(o).images)!=null&&r.length?(i(),v("div",Se,[(i(!0),v(I,null,L(s(o).images,(b,S)=>(i(),v("img",{src:b,onClick:U=>_("slide-clicked",S)},null,8,Te))),256))])):(i(),v("p",Ce,e[5]||(e[5]=[m(" Geen afbeeldingen "),n("br",null,null,-1),n("small",null,"Upload afbeeldingen met de knop of door ze hierheen te slepen.",-1)])))]}),_:1},8,["onFilesUploaded"]),d(re,null,{default:l(()=>[k.value?(i(),N(w,{key:0,onDismiss:e[4]||(e[4]=r=>k.value=!1)},{default:l(()=>[e[15]||(e[15]=n("h3",null,"Opslag op server",-1)),e[16]||(e[16]=n("p",null,[m(" Als je een geldige gebruikersnaam en wachtwoord hebt opgegeven, dan worden de door jou ingelezen afbeeldingen bewaard op de server. "),n("br"),n("br"),m(" Je kunt vervolgens later (eventueel vanaf een ander apparaat) de afbeeldingen terugzien als je daar ook je gebruikersnaam opgeeft. "),n("br"),n("br"),m(" Afbeeldingen worden gesorteerd op bestandsnaam. Er kan maar één afbeelding met dezelfde bestandsnaam zijn. Als je een afbeelding overschrijft of alle afbeeldingen wist, dan kan dat niet ongedaan worden gemaakt. "),n("br"),n("br")],-1)),n("div",Ee,[e[13]||(e[13]=n("em",{class:"label"},"Status",-1)),n("div",xe,[n("p",null,[n("span",{id:"upload-status-light",class:A(s(o).status)},null,2),n("strong",null,x(s(j)[s(o).status].short||s(o).status),1)]),n("p",null,x(s(j)[s(o).status].long),1)]),e[14]||(e[14]=n("em",{class:"label"},"Configuratie",-1)),n("div",Ue,[n("p",null,[e[8]||(e[8]=m("Serveradres")),n("span",De,x(s(u).url),1)]),d(g,{modelValue:s(u).username,"onUpdate:modelValue":e[1]||(e[1]=r=>s(u).username=r),identifier:"username"},{default:l(()=>e[9]||(e[9]=[n("span",null,"Gebruikersnaam",-1)])),_:1},8,["modelValue"]),d(g,{modelValue:s(u).password,"onUpdate:modelValue":e[2]||(e[2]=r=>s(u).password=r),identifier:"password"},{default:l(()=>e[10]||(e[10]=[n("span",null,"Wachtwoord",-1)])),_:1},8,["modelValue"])]),d(p,{class:"primary full",onClick:e[3]||(e[3]=r=>{k.value=!1,s(o).connect()})},{default:l(()=>[d(f,null,{default:l(()=>e[11]||(e[11]=[m("check")])),_:1}),e[12]||(e[12]=m("Vernieuwen "))]),_:1})])]),_:1})):F("",!0)]),_:1})])}}}),je=G(Ve,[["__scopeId","data-v-defa657e"]]),Ae={id:"pictures"},Ne={class:"grid"},Fe=["src"],Ie={key:0,class:"message"},Le={key:1,class:"message"},Me={class:"control dotnav"},ze=["onClick"],Be={key:0},Pe={key:1},Oe={key:0,class:"dropzone"},Re=P({__name:"SlideshowView",setup(y){const c=$(null),_=$(null),o=Z(),u=$(0),k=_e("slideshow-duration",60),{isFullscreen:T,enter:e,exit:f}=we(c),p=ke("history"),a=$(p.fullscreen==="true");function g(){T.value||a.value?(a.value=!1,f()):e()}const w=$(!1);let r,b;function S(){w.value=!0,clearTimeout(r),r=setTimeout(()=>{w.value=!1},2e3)}S();function U(){u.value=(u.value+1)%o.images.length||0}function M(){u.value=(u.value-1+o.images.length)%o.images.length||0}function D(){clearTimeout(b),b=setTimeout(()=>{U(),D()},k.value*1e3)}D();function z(C){if(!(document.activeElement&&(document.activeElement.tagName==="INPUT"||document.activeElement.tagName==="TEXTAREA")))switch(C.key){case"ArrowLeft":M();break;case"ArrowRight":U();break;case"Escape":case"F11":case"F5":case"f":C.preventDefault(),g();break;default:if(!isNaN(Number(C.key))){const t=Number(C.key)-1;t>=0&&t<o.images.length&&(u.value=t)}break}}window.addEventListener("keydown",z),ie(()=>{window.removeEventListener("keydown",z)});const{isOverDropZone:H}=be(_,{onDrop:o.filesUploaded,dataTypes:["image/png","image/jpeg","image/webp","image/gif","image/*"],multiple:!0});return(C,t)=>{var B;const J=ue,W=je,E=O,X=te,q=R,Q=se,Y=ne,ee=oe;return i(),v("main",{ref_key:"main",ref:_},[d(J),d(W,{onSlideClicked:t[0]||(t[0]=h=>u.value=h)}),n("section",Ae,[n("div",Ne,[n("div",null,[t[9]||(t[9]=n("h2",null,"Diavoorstelling",-1)),n("div",{class:A(["carousel",{"mouse-moving":w.value,"fake-fullscreen":a.value}]),ref_key:"carousel",ref:c,onMousemove:S,onMouseenter:t[1]||(t[1]=h=>w.value=!0),onMouseleave:t[2]||(t[2]=h=>w.value=!1)},[d(de,{name:"slide"},{default:l(()=>[(i(!0),v(I,null,L(s(o).images,(h,V)=>me((i(),v("img",{key:h,src:h},null,8,Fe)),[[pe,V===u.value]])),128))]),_:1}),["sending","receiving"].includes(s(o).status)?(i(),v("p",Ie,"Laden...")):(B=s(o).images)!=null&&B.length?F("",!0):(i(),v("p",Le,"Leeg")),n("button",{class:"control fullscreen",onClick:g},[s(T)||a.value?(i(),N(E,{key:0},{default:l(()=>t[5]||(t[5]=[m("fullscreen_exit")])),_:1})):(i(),N(E,{key:1},{default:l(()=>t[6]||(t[6]=[m("fullscreen")])),_:1}))]),n("button",{class:"control previous",onClick:M},[d(E,null,{default:l(()=>t[7]||(t[7]=[m("chevron_left")])),_:1})]),n("button",{class:"control next",onClick:U},[d(E,null,{default:l(()=>t[8]||(t[8]=[m("chevron_right")])),_:1})]),n("div",Me,[(i(!0),v(I,null,L(s(o).images,(h,V)=>(i(),v("button",{onClick:Ge=>u.value=V,class:A({active:V===u.value})},null,10,ze))),256))])],34)]),d(ee,null,{default:l(()=>[d(Y,null,{default:l(()=>[d(Q,{value:"Opties"},{default:l(()=>[n("fieldset",null,[t[13]||(t[13]=n("legend",null,"Automatische weergave",-1)),d(X,{modelValue:s(k),"onUpdate:modelValue":t[3]||(t[3]=h=>ce(k)?k.value=h:null),modelModifiers:{number:!0},onChange:D,identifier:"slideDuration",step:"1",min:"1",max:"240",unit:"s"},{default:l(()=>[t[10]||(t[10]=m(" Seconden per dia ")),s(k)>0?(i(),v("small",Be," Elke "+x(s(k))+" seconden wordt de volgende dia getoond. ",1)):(i(),v("small",Pe," De automatische weergave is uitgeschakeld. "))]),_:1},8,["modelValue"]),d(q,{class:"secondary full",onClick:t[4]||(t[4]=h=>{u.value=0,D(),g()})},{default:l(()=>[d(E,null,{default:l(()=>t[11]||(t[11]=[m("play_arrow")])),_:1}),t[12]||(t[12]=m("Automatische weergave starten "))]),_:1})])]),_:1})]),_:1})]),_:1})])]),s(H)?(i(),v("div",Oe," Laat los om bestand(en) te uploaden ")):F("",!0)],512)}}}),We=G(Re,[["__scopeId","data-v-24e85bc5"]]);export{We as default};
