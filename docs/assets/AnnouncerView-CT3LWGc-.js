const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/howler-BXccDGgb.js","assets/_commonjsHelpers-C4iS2aBk.js"])))=>i.map(i=>d[i]);
import{_ as Z,x as ae,y as ue,o as l,c as p,d as r,a as oe,j as q,z as le,r as R,A as se,B as ie,u,C as G,D as K,e as x,F as O,h as B,f as b,w as i,g as f,v as J,k as A,p as V,m as s,n as de,q as M,E as re,i as me}from"./index-2_fO7Ooi.js";import{u as $,C as W,x as ce,_ as fe}from"./super-vue3-tabs-C-TpYeRS.js";import{u as pe,_ as ve,a as _e}from"./TmsScheduleUploadSection-CqbJM5fY.js";import{_ as ye}from"./Chip-CusqVJnL.js";const he=["for"],Te={class:"title"},ge=["id"],Ve={__name:"InputText",props:ae(["identifier"],{modelValue:{},modelModifiers:{}}),emits:["update:modelValue"],setup(C){const v=ue(C,"modelValue");return(y,I)=>(l(),p("label",{class:"input",for:C.identifier},[r("div",Te,[oe(y.$slots,"default",{},void 0,!0)]),q(r("input",{type:"text",inputmode:"numeric",pattern:"[0-9]+",name:"",id:C.identifier,"onUpdate:modelValue":I[0]||(I[0]=D=>v.value=D)},null,8,ge),[[le,v.value,void 0,{number:!0}]])],8,he))}},Se=Z(Ve,[["__scopeId","data-v-0d8d5576"]]);function Y(C,{volume:v=1,playbackRate:y=1,soundEnabled:I=!0,interrupt:D=!1,autoplay:P=!1,onload:U,...E}={}){const T=R(null),_=R(!1),h=R(null),o=R(null);function c(){var d;typeof U=="function"&&U.call(this),h.value=(h.value||((d=o.value)==null?void 0:d.duration())||0)*1e3,P===!0&&(_.value=!0)}return se(async()=>{const d=await ie(()=>import("./howler-BXccDGgb.js").then(N=>N.h),__vite__mapDeps([0,1]));T.value=d.default.Howl,o.value=new T.value({src:u(C),volume:u(v),rate:u(y),onload:c,...E})}),G(()=>[C],()=>{T.value&&T.value&&o&&o.value&&(o.value=new T.value({src:u(C),volume:u(v),rate:u(y),onload:c,...E}))}),G(()=>[u(v),u(y)],()=>{o.value&&(o.value.volume(u(v)),o.value.rate(u(y)))}),{play:d=>{typeof d>"u"&&(d={}),!(!o.value||!I&&!d.forceSoundEnabled)&&(D&&o.value.stop(),d.playbackRate&&o.value.rate(d.playbackRate),o.value.play(d.id),o.value.once("end",()=>{o.value&&o.value&&!o.value.playing()&&(_.value=!1)}),_.value=!0)},sound:o,isPlaying:_,duration:h,pause:d=>{o.value&&(o.value.pause(typeof d=="number"?d:void 0),_.value=!1)},stop:d=>{o.value&&(o.value.stop(typeof d=="number"?d:void 0),_.value=!1)}}}const xe="/Pathe-Tools/assets/rosetta-DA6vQKhk.ogg",De="/Pathe-Tools/assets/gerwim-hi7crA_V.ogg",Ue={class:"container dark"},Ee={class:"flex",style:{"flex-wrap":"wrap"}},ke={key:0,style:{flex:"50% 1 1"}},Ce={id:"upcoming-announcements",class:"flex",style:{"flex-direction":"column",gap:"8px"}},Ie={class:"room"},Pe={class:"title"},Ae={class:"time"},Me={class:"flex chips"},$e=["onDblclick"],be={id:"parameters",style:{flex:"229px 1 1"}},Le={key:0},Oe={key:0,class:"small"},Re={key:0,class:"small"},Ne={class:"flex",style:{"flex-wrap":"wrap",gap:"8px","margin-top":"-4px"}},we={class:"queue"},Xe=["onClick"],Be={class:"clock"},Ge={__name:"AnnouncerView",setup(C){const v=pe(),y=R(()=>new Date);setInterval(I,1e3),I();function I(){y.value=new Date}const D=$("announcement-voice","rosetta"),P=$("announce-start",!1),U=$("announce-plf-start",!0),E=$("announce-plf-start-grace-period",15),T=$("announce-main-show",!1),_=$("announce-credits",!0),h=$("announce-credits-grace-period",60),o=$("announce-end",!1),c=K({rosetta:{sprite:{auditorium01:[0,1201.6326530612246],auditorium02:[3e3,1332.2448979591836],auditorium03:[6e3,1332.2448979591836],auditorium04:[9e3,1384.489795918368],auditorium05:[12e3,1436.7346938775504],auditorium06:[15e3,1436.7346938775504],auditorium07:[18e3,1515.102040816327],auditorium08:[21e3,1515.102040816327],auditorium09:[24e3,1488.9795918367347],auditorium10:[27e3,1306.1224489795932],auditorium11:[3e4,1462.8571428571427],auditorium12:[33e3,1515.1020408163233],auditorium13:[36e3,1488.9795918367383],auditorium14:[39e3,1488.9795918367383],auditorium15:[42e3,1567.3469387755076],auditorium16:[45e3,1488.9795918367383],auditorium17:[48e3,1515.1020408163233],auditorium18:[51e3,1462.8571428571463],auditorium19:[54e3,1724.0816326530605],auditorium20:[57e3,1593.4693877551],chime:[6e4,3084.51247165533],credits:[65e3,1501.6099773242645],end:[68e3,1563.7868480725672],mainshow:[71e3,1793.3333333333367],start:[74e3,989.9092970521508]}},gerwim:{sprite:{auditorium01:[0,824.9659863945578],auditorium02:[2e3,870.9070294784577],auditorium03:[4e3,790.2040816326528],auditorium04:[6e3,886.8253968253965],auditorium05:[8e3,838.5260770975051],auditorium06:[1e4,866.757369614513],auditorium07:[12e3,987.7777777777776],auditorium08:[14e3,665.6689342403635],credits:[16e3,936.5532879818588],start:[18e3,638.9342403628114]}}});({play:c.rosetta.play,isPlaying:c.rosetta.isPlaying}=Y(xe,{sprite:c.rosetta.sprite,preload:!0,onplay:async()=>{document.dispatchEvent(new CustomEvent("announcerSoundPlay"))},onend:async()=>{document.dispatchEvent(new CustomEvent("announcerSoundEnd"))}})),{play:c.gerwim.play,isPlaying:c.gerwim.isPlaying}=Y(De,{sprite:c.gerwim.sprite,preload:!0,onplay:async()=>{document.dispatchEvent(new CustomEvent("announcerSoundPlay"))},onend:async()=>{document.dispatchEvent(new CustomEvent("announcerSoundEnd"))}});let g=K([]);G(g,async t=>{var e;if(t[0]&&!c.rosetta.sprite[t[0].id]&&g.shift(),t[0]&&!Object.values(c).some(a=>a.isPlaying)){const a=g[0];(e=c[D.value])!=null&&e.sprite[a.id]?c[D.value].play(a):c.rosetta.play(a),document.addEventListener("announcerSoundEnd",()=>{g.shift()},{once:!0})}},{deep:!0});const L=R([]);G([v,P,U,E,T,_,h,o],([t])=>H(t)),H(v);function H(t){let e=[];P.value&&t.table.forEach(a=>{a.scheduledTime&&e.push({announceTime:a.scheduledTime,announcement:["chime","start",`auditorium${w(a.AUDITORIUM)}`],announcementType:"start",status:"unscheduled",...a})}),U.value&&t.table.filter(a=>{var k;return(k=a.AUDITORIUM)==null?void 0:k.includes("4DX")}).forEach(a=>{a.scheduledTime&&e.push({announceTime:new Date(a.scheduledTime.getTime()-E.value*6e4),announcement:["chime","start",`auditorium${w(a.AUDITORIUM)}`],status:"unscheduled",announcementType:"start4dx",...a})}),T.value&&t.table.forEach(a=>{a.scheduledTime&&e.push({announceTime:a.featureTime,announcement:["chime","mainshow",`auditorium${w(a.AUDITORIUM)}`],status:"unscheduled",announcementType:"mainshow",...a})}),_.value&&t.table.forEach(a=>{a.creditsTime&&e.push({announceTime:new Date(a.creditsTime.getTime()-h.value*1e3),announcement:["chime","credits",`auditorium${w(a.AUDITORIUM)}`],status:"unscheduled",announcementType:"credits",...a})}),o.value&&t.table.forEach(a=>{a.scheduledTime&&e.push({announceTime:a.endTime,announcement:["chime","end",`auditorium${w(a.AUDITORIUM)}`],status:"unscheduled",announcementType:"end",...a})}),L.value.filter(a=>a.status==="scheduled").forEach(a=>{const k=e.findIndex(S=>a.announceTime===S.announceTime&&a.announcement.join()===S.announcement.join());k&&e.splice(k,1),e.push(a)}),L.value=[...e.filter(a=>Date.now()-a.announceTime<1e4).sort((a,k)=>a.announceTime-k.announceTime)],I()}setInterval(j,3e4),G(L,j),j();function j(){L.value.filter(t=>t.announceTime-Date.now()<6e4&&t.status==="unscheduled").forEach(t=>{t.status!=="scheduled"&&(t.status="scheduled",setTimeout(()=>{t.status==="scheduled"&&(t.status="announcing",t.announcement.forEach(e=>{g.push({id:e})}))},t.announceTime-Date.now()))})}function d(t){return t<6e4?Math.floor(t/1e3)+" s":t<6e5?Math.floor(t/6e4)+":"+String(Math.floor(t%6e4/1e3)).padStart(2,"0")+" min":t<36e5?Math.floor(t/6e4)+" min":Math.floor(t/36e5)+":"+String(Math.floor(t%36e5/6e4)).padStart(2,"0")+" h"}function N(t){const e={start:"start",mainshow:"start hoofdfilm",credits:"aftiteling",end:"einde voorstelling",chime:"geluidje"};let a=t.match(/^(auditorium)([0-9]+)$/);return e[t]?e[t]:a?`zaal ${Number(a[2])}`:t}function ee(t){return t.charAt(0).toUpperCase()+t.slice(1)}function w(t){return t!=null&&t.toLowerCase().includes("rooftop")?"08":String(t==null?void 0:t.match(/\d+/)).padStart(2,"0")}return(t,e)=>{const a=ve,k=ye,S=re,X=_e,F=fe,ne=Se,te=me;return l(),p(O,null,[r("main",Ue,[x(a),r("section",null,[r("div",Ee,[u(v).table.length>0?(l(),p("div",ke,[e[16]||(e[16]=r("h2",null,"Geplande omroepen",-1)),r("div",Ce,[(l(!0),p(O,null,B(L.value,n=>q((l(),p("div",{class:A(["film",{announcing:n.status==="announcing"}])},[r("div",Ie,f(n.AUDITORIUM==="PULR 8"||n.AUDITORIUM==="Rooftop"?"RT":n.AUDITORIUM.replace(/^\w+\s/,"")),1),r("div",Pe,f(n.title),1),r("div",Ae,f(n.scheduledTime.toLocaleTimeString("nl-NL"))+" – "+f(n.endTime.toLocaleTimeString("nl-NL")),1),r("div",Me,[(l(!0),p(O,null,B(n.extras,m=>(l(),V(k,{class:A({"translucent-white":!(n.announcementType==="start4dx"&&m==="4DX")})},{default:i(()=>[s(f(m),1)]),_:2},1032,["class"]))),256))]),r("div",{class:A(["announcement",n.announcement]),onDblclick:m=>n.announcement.forEach(z=>{u(g).push({id:z})}),style:{display:"grid","grid-template-columns":"64px 130px 1fr"}},[n.status==="announcing"?(l(),V(S,{key:0,fill:""},{default:i(()=>e[8]||(e[8]=[s("graphic_eq")])),_:1})):n.announcementType==="start"||n.announcementType==="start4dx"?(l(),V(S,{key:1,fill:"",class:A({pulsate:n.status==="scheduled"})},{default:i(()=>e[9]||(e[9]=[s("play_arrow")])),_:2},1032,["class"])):n.announcementType==="mainshow"?(l(),V(S,{key:2,fill:"",class:A({pulsate:n.status==="scheduled"})},{default:i(()=>e[10]||(e[10]=[s("play_circle")])),_:2},1032,["class"])):n.announcementType==="credits"?(l(),V(S,{key:3,fill:"",class:A({pulsate:n.status==="scheduled"})},{default:i(()=>e[11]||(e[11]=[s("stop_circle")])),_:2},1032,["class"])):n.announcementType==="end"?(l(),V(S,{key:4,fill:"",class:A({pulsate:n.status==="scheduled"})},{default:i(()=>e[12]||(e[12]=[s("stop")])),_:2},1032,["class"])):(l(),V(S,{key:5,fill:""},{default:i(()=>e[13]||(e[13]=[s("schedule")])),_:1})),r("div",null,f(n.announceTime.toLocaleTimeString("nl-NL"))+" ("+f(d(n.announceTime-y.value))+") ",1),r("div",{style:de({opacity:n.status==="announcing"?1:.35})},[e[14]||(e[14]=s(" '")),(l(!0),p(O,null,B(n.announcement,(m,z)=>{var Q;return q((l(),p("span",{class:A(["word",{announcing:n.announceTime<=y.value&&((Q=u(g)[0])==null?void 0:Q.id)===m}])},f(N(m))+f(z<n.announcement.length-1?" ":""),3)),[[J,m!=="chime"]])}),256)),e[15]||(e[15]=s("' "))],4)],42,$e)],2)),[[J,y.value-n.announceTime<1e4]])),256))])])):b("",!0),r("div",be,[x(u(ce),{themeColor:"#ffc426"},{default:i(()=>[x(u(W),{value:"Opties"},{default:i(()=>[x(X,{modelValue:u(P),"onUpdate:modelValue":e[0]||(e[0]=n=>M(P)?P.value=n:null),identifier:"announceStart"},{default:i(()=>e[17]||(e[17]=[s(" 'Start' omroepen ")])),_:1},8,["modelValue"]),u(v).table.some(n=>{var m;return(m=n.AUDITORIUM)==null?void 0:m.includes("4DX")})?(l(),V(X,{key:0,modelValue:u(U),"onUpdate:modelValue":e[1]||(e[1]=n=>M(U)?U.value=n:null),identifier:"announcePlfStart"},{default:i(()=>[r("span",null,[e[18]||(e[18]=s("'Start' ")),u(P)?(l(),p("b",Le,"extra")):b("",!0),e[19]||(e[19]=s(" omroepen bij 4DX"))])]),_:1},8,["modelValue"])):b("",!0),u(U)&&u(v).table.some(n=>{var m;return(m=n.AUDITORIUM)==null?void 0:m.includes("4DX")})?(l(),V(F,{key:1,modelValue:u(E),"onUpdate:modelValue":e[2]||(e[2]=n=>M(E)?E.value=n:null),modelModifiers:{number:!0},identifier:"announcePlfStartGracePeriod",min:"0",max:"30",unit:"min"},{default:i(()=>[e[20]||(e[20]=s(" Voorlooptijd 'start' bij 4DX ")),u(h)>0?(l(),p("div",Oe," De 4DX-inloop wordt "+f(u(E))+" min van tevoren omgeroepen. ",1)):b("",!0)]),_:1},8,["modelValue"])):b("",!0),x(X,{modelValue:u(T),"onUpdate:modelValue":e[3]||(e[3]=n=>M(T)?T.value=n:null),identifier:"announceMainShow"},{default:i(()=>e[21]||(e[21]=[s(" 'Start hoofdfilm' omroepen ")])),_:1},8,["modelValue"]),x(X,{modelValue:u(_),"onUpdate:modelValue":e[4]||(e[4]=n=>M(_)?_.value=n:null),identifier:"announceCredits"},{default:i(()=>e[22]||(e[22]=[s(" 'Aftiteling' omroepen ")])),_:1},8,["modelValue"]),u(_)?(l(),V(F,{key:2,modelValue:u(h),"onUpdate:modelValue":e[5]||(e[5]=n=>M(h)?h.value=n:null),modelModifiers:{number:!0},identifier:"announceCreditsGracePeriod",step:"15",min:"0",max:"240",unit:"s"},{default:i(()=>[e[23]||(e[23]=s(" Voorlooptijd 'aftiteling' ")),u(h)>0?(l(),p("div",Re," De aftiteling wordt "+f(u(h))+" s van tevoren omgeroepen. ",1)):b("",!0)]),_:1},8,["modelValue"])):b("",!0),x(X,{modelValue:u(o),"onUpdate:modelValue":e[6]||(e[6]=n=>M(o)?o.value=n:null),identifier:"announceEnd"},{default:i(()=>e[24]||(e[24]=[s(" 'Einde voorstelling' omroepen ")])),_:1},8,["modelValue"]),x(ne,{modelValue:u(D),"onUpdate:modelValue":e[7]||(e[7]=n=>M(D)?D.value=n:null),identifier:"voice"},{default:i(()=>e[25]||(e[25]=[s("Naam stem")])),_:1},8,["modelValue"])]),_:1}),x(u(W),{value:"Handmatig"},{default:i(()=>[r("div",Ne,[(l(!0),p(O,null,B(Object.keys(c.rosetta.sprite),n=>(l(),V(te,{onClick:m=>u(g).push({id:n})},{default:i(()=>[s(f(N(n)),1)]),_:2},1032,["onClick"]))),256))]),r("div",we,[(l(!0),p(O,null,B(u(g),(n,m)=>(l(),p("div",{onClick:z=>u(g).splice(m,1)},[x(S,{fill:!0},{default:i(()=>e[26]||(e[26]=[s("graphic_eq")])),_:1}),s(" "+f(ee(N(n.id,!0))),1)],8,Xe))),256))])]),_:1})]),_:1})])])])]),r("div",Be,f(y.value.toLocaleTimeString("nl-NL")),1)],64)}}},Fe=Z(Ge,[["__scopeId","data-v-95a5ee15"]]);export{Fe as default};
