import{d as B,y as F,z as O,o as m,c as p,e as u,a as P,w as H,H as N,x as $,I as j,r as h,f as b,m as C,u as f,h as z,l as A,_ as R}from"./index-DGGmfViN.js";import{d as U}from"./DropZone-BUD8sr8v.js";const W=["for"],X={class:"title"},Y=["id"],Q=B({__name:"InputCheckbox",props:F(["identifier"],{modelValue:{},modelModifiers:{}}),emits:["update:modelValue"],setup(o){const n=O(o,"modelValue");return(s,e)=>(m(),p("label",{class:"input",for:o.identifier},[u("div",X,[P(s.$slots,"default",{},void 0,!0)]),H(u("input",{type:"checkbox",name:"",id:o.identifier,"onUpdate:modelValue":e[0]||(e[0]=a=>n.value=a)},null,8,Y),[[N,n.value]])],8,W))}}),te=$(Q,[["__scopeId","data-v-f075d497"]]),Z=j("tmsSchedule",()=>{const o=h([]),n=h({});async function s(e){var S,T,x,D,y,g;if(!(((S=e==null?void 0:e[0])==null?void 0:S.type)==="text/csv"||((T=e==null?void 0:e[0])==null?void 0:T.type)==="application/vnd.ms-excel"||(D=(x=e==null?void 0:e[0])==null?void 0:x.name)!=null&&D.endsWith(".csv")))return;const r=(await e[0].text()).split(`
`);let i=[];const d=V(r[0]);for(var v=0;v<r.length;v++){const t=V(r[v]);let _={};for(let l=0;l<t.length;l++)_[(y=d[l])==null?void 0:y.trim()]=(g=t[l])==null?void 0:g.trim();i.push(_)}i=i.map((t,_)=>{var l,I,M,k,E;return _===0||(t.extra=(M=(I=(l=t.PLAYLIST)==null?void 0:l.match(/(\s((4DX)|(ATMOS)|(IMX)|(3D)|(Music)|(ROOFTOP)|(PrideNight)|(Ladies)|(Premiere)|(\([A-Z]+\))))+/))==null?void 0:I[0])==null?void 0:M.slice(1),t.extras=(k=t.extra)==null?void 0:k.split(" "),t.title=(E=t.PLAYLIST)==null?void 0:E.replace(t.extra,""),t.scheduledTime=c(t.SCHEDULED_TIME),t.showTime=c(t.SHOW_TIME),t.featureTime=c(t.FEATURE_TIME),t.creditsTime=c(t.CREDITS_TIME),t.endTime=c(t.END_TIME)),t}),o.value=i,n.value={name:e[0].name,type:e[0].type,lastModified:e[0].lastModified,size:e[0].size}}return{table:o,metadata:n,addFiles:s}});function V(o){let n=[],s="",e=!1;for(let a of o)a==='"'?e=!e:a===","&&!e?(n.push(s.trim()),s=""):s+=a;return n.push(s.trim()),n}function c(o){let n=new Date;n.getHours()<6&&n.setDate(n.getDate()-1);let s=new Date(n.toDateString()+" "+o);return s.getHours()<6&&s.setDate(s.getDate()+1),s}const q={id:"upload"},G={key:0},J={key:1},K={key:2},w={__name:"TmsScheduleUploadSection",setup(o){const n=Z(),s=h(null);return(e,a)=>{const r=R,i=U;return m(),p("section",q,[a[4]||(a[4]=u("h2",null,"Bestand uploaden",-1)),b(i,{id:"drop-zone",onFilesDropped:f(n).addFiles,onClick:a[0]||(a[0]=d=>s.value.click()),style:{cursor:"pointer"}},{default:C(({dropZoneActive:d})=>[u("div",null,[d?(m(),p("div",G,"Laat los om te uploaden")):f(n).metadata.name?(m(),p("div",J,z(f(n).metadata.name),1)):(m(),p("div",K,"Sleep een bestand hierheen")),a[2]||(a[2]=u("div",{class:"small"},"CSV-bestand uit RosettaBridge (met optie 'times only')",-1))]),b(r,{"data-active":d},{default:C(()=>a[3]||(a[3]=[A("Bladeren...")])),_:2},1032,["data-active"])]),_:1},8,["onFilesDropped"]),u("input",{type:"file",ref_key:"fileInput",ref:s,accept:"text/csv,.csv",style:{display:"none"},onChange:a[1]||(a[1]=d=>f(n).addFiles(d.target.files))},null,544)])}}},ne=$(w,[["__scopeId","data-v-c9b361c4"]]);export{ne as _,te as a,Z as u};
