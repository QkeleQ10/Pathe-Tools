import{D as J,s as le,R as se,G as z,S as me,U as he,V as _e,r as P,W as ge,X as ae,Y as R,b as T,t as A,H as Z,u as oe,x,c as V,o as O,a as N,d as j,h as D,F as ye,j as be,q as re,i as ie,Z as G,$ as Q,g as ue,y as we,z as Se,A as Fe,M as ke,p as Ee,w as X,e as ce,k as Y,C as $e,m as Te}from"./index-BIuMXRZi.js";function fe(e){return me()?(he(e),!0):!1}const H=typeof window<"u"&&typeof document<"u";typeof WorkerGlobalScope<"u"&&globalThis instanceof WorkerGlobalScope;const Ae=Object.prototype.toString,Oe=e=>Ae.call(e)==="[object Object]",I=()=>{},Ce=Me();function Me(){var e,s;return H&&((e=window==null?void 0:window.navigator)==null?void 0:e.userAgent)&&(/iP(?:ad|hone|od)/.test(window.navigator.userAgent)||((s=window==null?void 0:window.navigator)==null?void 0:s.maxTouchPoints)>2&&/iPad|Macintosh/.test(window==null?void 0:window.navigator.userAgent))}function Ve(...e){if(e.length!==1)return _e(...e);const s=e[0];return typeof s=="function"?se(ge(()=>({get:s,set:I}))):P(s)}function De(e,s){function t(...r){return new Promise((i,c)=>{Promise.resolve(e(()=>s.apply(this,r),{fn:s,thisArg:this,args:r})).then(i).catch(c)})}return t}const de=e=>e();function Ie(e=de,s={}){const{initialState:t="active"}=s,r=Ve(t==="active");function i(){r.value=!1}function c(){r.value=!0}const f=(...l)=>{r.value&&e(...l)};return{isActive:se(r),pause:i,resume:c,eventFilter:f}}function K(e){return Array.isArray(e)?e:[e]}function Ne(e){return ae()}function Pe(e,s,t={}){const{eventFilter:r=de,...i}=t;return z(e,De(r,s),i)}function pe(e,s,t={}){const{eventFilter:r,initialState:i="active",...c}=t,{eventFilter:f,pause:l,resume:a,isActive:p}=Ie(r,{initialState:i});return{stop:Pe(e,s,{...c,eventFilter:f}),pause:l,resume:a,isActive:p}}function Re(e,s=!0,t){Ne()?J(e,t):s?e():le(e)}function Be(e,s,t){return z(e,s,{...t,immediate:!0})}const B=H?window:void 0,xe=H?window.document:void 0;function M(e){var s;const t=A(e);return(s=t==null?void 0:t.$el)!=null?s:t}function w(...e){const s=[],t=()=>{s.forEach(l=>l()),s.length=0},r=(l,a,p,h)=>(l.addEventListener(a,p,h),()=>l.removeEventListener(a,p,h)),i=T(()=>{const l=K(A(e[0])).filter(a=>a!=null);return l.every(a=>typeof a!="string")?l:void 0}),c=Be(()=>{var l,a;return[(a=(l=i.value)==null?void 0:l.map(p=>M(p)))!=null?a:[B].filter(p=>p!=null),K(A(i.value?e[1]:e[0])),K(oe(i.value?e[2]:e[1])),A(i.value?e[3]:e[2])]},([l,a,p,h])=>{if(t(),!(l!=null&&l.length)||!(a!=null&&a.length)||!(p!=null&&p.length))return;const _=Oe(h)?{...h}:h;s.push(...l.flatMap(F=>a.flatMap(b=>p.map(k=>r(F,b,k,_)))))},{flush:"post"}),f=()=>{c(),t()};return fe(t),f}let ee=!1;function mt(e,s,t={}){const{window:r=B,ignore:i=[],capture:c=!0,detectIframe:f=!1,controls:l=!1}=t;if(!r)return l?{stop:I,cancel:I,trigger:I}:I;if(Ce&&!ee){ee=!0;const n={passive:!0};Array.from(r.document.body.children).forEach(u=>w(u,"click",I,n)),w(r.document.documentElement,"click",I,n)}let a=!0;const p=n=>A(i).some(u=>{if(typeof u=="string")return Array.from(r.document.querySelectorAll(u)).some(o=>o===n.target||n.composedPath().includes(o));{const o=M(u);return o&&(n.target===o||n.composedPath().includes(o))}});function h(n){const u=A(n);return u&&u.$.subTree.shapeFlag===16}function _(n,u){const o=A(n),d=o.$.subTree&&o.$.subTree.children;return d==null||!Array.isArray(d)?!1:d.some(v=>v.el===u.target||u.composedPath().includes(v.el))}const F=n=>{const u=M(e);if(n.target!=null&&!(!(u instanceof Element)&&h(e)&&_(e,n))&&!(!u||u===n.target||n.composedPath().includes(u))){if("detail"in n&&n.detail===0&&(a=!p(n)),!a){a=!0;return}s(n)}};let b=!1;const k=[w(r,"click",n=>{b||(b=!0,setTimeout(()=>{b=!1},0),F(n))},{passive:!0,capture:c}),w(r,"pointerdown",n=>{const u=M(e);a=!p(n)&&!!(u&&!n.composedPath().includes(u))},{passive:!0}),f&&w(r,"blur",n=>{setTimeout(()=>{var u;const o=M(e);((u=r.document.activeElement)==null?void 0:u.tagName)==="IFRAME"&&!(o!=null&&o.contains(r.document.activeElement))&&s(n)},0)},{passive:!0})].filter(Boolean),y=()=>k.forEach(n=>n());return l?{stop:y,cancel:()=>{a=!1},trigger:n=>{a=!0,F(n),a=!1}}:y}function ze(){const e=R(!1),s=ae();return s&&J(()=>{e.value=!0},s),e}function je(e){const s=ze();return T(()=>(s.value,!!e()))}const L=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},q="__vueuse_ssr_handlers__",Ue=We();function We(){return q in L||(L[q]=L[q]||{}),L[q]}function Le(e,s){return Ue[e]||s}function qe(e){return e==null?"any":e instanceof Set?"set":e instanceof Map?"map":e instanceof Date?"date":typeof e=="boolean"?"boolean":typeof e=="string"?"string":typeof e=="object"?"object":Number.isNaN(e)?"any":"number"}const Je={boolean:{read:e=>e==="true",write:e=>String(e)},object:{read:e=>JSON.parse(e),write:e=>JSON.stringify(e)},number:{read:e=>Number.parseFloat(e),write:e=>String(e)},any:{read:e=>e,write:e=>String(e)},string:{read:e=>e,write:e=>String(e)},map:{read:e=>new Map(JSON.parse(e)),write:e=>JSON.stringify(Array.from(e.entries()))},set:{read:e=>new Set(JSON.parse(e)),write:e=>JSON.stringify(Array.from(e))},date:{read:e=>new Date(e),write:e=>e.toISOString()}},te="vueuse-storage";function He(e,s,t,r={}){var i;const{flush:c="pre",deep:f=!0,listenToStorageChanges:l=!0,writeDefaults:a=!0,mergeDefaults:p=!1,shallow:h,window:_=B,eventFilter:F,onError:b=m=>{console.error(m)},initOnMounted:k}=r,y=(h?R:P)(typeof s=="function"?s():s),n=T(()=>A(e));if(!t)try{t=Le("getDefaultStorage",()=>{var m;return(m=B)==null?void 0:m.localStorage})()}catch(m){b(m)}if(!t)return y;const u=A(s),o=qe(u),d=(i=r.serializer)!=null?i:Je[o],{pause:v,resume:g}=pe(y,()=>U(y.value),{flush:c,deep:f,eventFilter:F});z(n,()=>C(),{flush:c}),_&&l&&Re(()=>{t instanceof Storage?w(_,"storage",C,{passive:!0}):w(_,te,ve),k&&C()}),k||C();function E(m,S){if(_){const $={key:n.value,oldValue:m,newValue:S,storageArea:t};_.dispatchEvent(t instanceof Storage?new StorageEvent("storage",$):new CustomEvent(te,{detail:$}))}}function U(m){try{const S=t.getItem(n.value);if(m==null)E(S,null),t.removeItem(n.value);else{const $=d.write(m);S!==$&&(t.setItem(n.value,$),E(S,$))}}catch(S){b(S)}}function W(m){const S=m?m.newValue:t.getItem(n.value);if(S==null)return a&&u!=null&&t.setItem(n.value,d.write(u)),u;if(!m&&p){const $=d.read(S);return typeof p=="function"?p($,u):o==="object"&&!Array.isArray($)?{...u,...$}:$}else return typeof S!="string"?S:d.read(S)}function C(m){if(!(m&&m.storageArea!==t)){if(m&&m.key==null){y.value=u;return}if(!(m&&m.key!==n.value)){v();try{(m==null?void 0:m.newValue)!==d.write(y.value)&&(y.value=W(m))}catch(S){b(S)}finally{m?le(g):g()}}}}function ve(m){C(m.detail)}return y}function ht(e,s={}){var t,r;const i=R(!1),c=R(null);let f=0,l=!0;if(H){const a=typeof s=="function"?{onDrop:s}:s,p=(t=a.multiple)!=null?t:!0,h=(r=a.preventDefaultForUnhandled)!=null?r:!1,_=n=>{var u,o;const d=Array.from((o=(u=n.dataTransfer)==null?void 0:u.files)!=null?o:[]);return d.length===0?null:p?d:[d[0]]},F=n=>{const u=oe(a.dataTypes);return typeof u=="function"?u(n):u!=null&&u.length?n.length===0?!1:n.every(o=>u.some(d=>o.includes(d))):!0},b=n=>{const u=Array.from(n??[]).map(v=>v.type),o=F(u),d=p||n.length<=1;return o&&d},k=()=>/^(?:(?!chrome|android).)*safari/i.test(navigator.userAgent)&&!("chrome"in window),y=(n,u)=>{var o,d,v,g,E,U;const W=(o=n.dataTransfer)==null?void 0:o.items;if(l=(d=W&&b(W))!=null?d:!1,h&&n.preventDefault(),!k()&&!l){n.dataTransfer&&(n.dataTransfer.dropEffect="none");return}n.preventDefault(),n.dataTransfer&&(n.dataTransfer.dropEffect="copy");const C=_(n);switch(u){case"enter":f+=1,i.value=!0,(v=a.onEnter)==null||v.call(a,null,n);break;case"over":(g=a.onOver)==null||g.call(a,null,n);break;case"leave":f-=1,f===0&&(i.value=!1),(E=a.onLeave)==null||E.call(a,null,n);break;case"drop":f=0,i.value=!1,l&&(c.value=C,(U=a.onDrop)==null||U.call(a,C,n));break}};w(e,"dragenter",n=>y(n,"enter")),w(e,"dragover",n=>y(n,"over")),w(e,"dragleave",n=>y(n,"leave")),w(e,"drop",n=>y(n,"drop"))}return{files:c,isOverDropZone:i}}function _t(e,s={}){const{initialValue:t=!1,focusVisible:r=!1,preventScroll:i=!1}=s,c=R(!1),f=T(()=>M(e)),l={passive:!0};w(f,"focus",p=>{var h,_;(!r||(_=(h=p.target).matches)!=null&&_.call(h,":focus-visible"))&&(c.value=!0)},l),w(f,"blur",()=>c.value=!1,l);const a=T({get:()=>c.value,set(p){var h,_;!p&&c.value?(h=f.value)==null||h.blur():p&&!c.value&&((_=f.value)==null||_.focus({preventScroll:i}))}});return z(f,()=>{a.value=t},{immediate:!0,flush:"post"}),{focused:a}}const ne=["fullscreenchange","webkitfullscreenchange","webkitendfullscreen","mozfullscreenchange","MSFullscreenChange"];function gt(e,s={}){const{document:t=xe,autoExit:r=!1}=s,i=T(()=>{var o;return(o=M(e))!=null?o:t==null?void 0:t.documentElement}),c=R(!1),f=T(()=>["requestFullscreen","webkitRequestFullscreen","webkitEnterFullscreen","webkitEnterFullScreen","webkitRequestFullScreen","mozRequestFullScreen","msRequestFullscreen"].find(o=>t&&o in t||i.value&&o in i.value)),l=T(()=>["exitFullscreen","webkitExitFullscreen","webkitExitFullScreen","webkitCancelFullScreen","mozCancelFullScreen","msExitFullscreen"].find(o=>t&&o in t||i.value&&o in i.value)),a=T(()=>["fullScreen","webkitIsFullScreen","webkitDisplayingFullscreen","mozFullScreen","msFullscreenElement"].find(o=>t&&o in t||i.value&&o in i.value)),p=["fullscreenElement","webkitFullscreenElement","mozFullScreenElement","msFullscreenElement"].find(o=>t&&o in t),h=je(()=>i.value&&t&&f.value!==void 0&&l.value!==void 0&&a.value!==void 0),_=()=>p?(t==null?void 0:t[p])===i.value:!1,F=()=>{if(a.value){if(t&&t[a.value]!=null)return t[a.value];{const o=i.value;if((o==null?void 0:o[a.value])!=null)return!!o[a.value]}}return!1};async function b(){if(!(!h.value||!c.value)){if(l.value)if((t==null?void 0:t[l.value])!=null)await t[l.value]();else{const o=i.value;(o==null?void 0:o[l.value])!=null&&await o[l.value]()}c.value=!1}}async function k(){if(!h.value||c.value)return;F()&&await b();const o=i.value;f.value&&(o==null?void 0:o[f.value])!=null&&(await o[f.value](),c.value=!0)}async function y(){await(c.value?b():k())}const n=()=>{const o=F();(!o||o&&_())&&(c.value=o)},u={capture:!1,passive:!0};return w(t,ne,n,u),w(()=>M(i),ne,n,u),r&&fe(b),{isSupported:h,isFullscreen:c,enter:k,exit:b,toggle:y}}function yt(e,s,t={}){const{window:r=B}=t;return He(e,s,r==null?void 0:r.localStorage,t)}function bt(e="history",s={}){const{initialValue:t={},removeNullishValues:r=!0,removeFalsyValues:i=!1,write:c=!0,writeMode:f="replace",window:l=B}=s;if(!l)return Z(t);const a=Z({});function p(){if(e==="history")return l.location.search||"";if(e==="hash"){const d=l.location.hash||"",v=d.indexOf("?");return v>0?d.slice(v):""}else return(l.location.hash||"").replace(/^#/,"")}function h(d){const v=d.toString();if(e==="history")return`${v?`?${v}`:""}${l.location.hash||""}`;if(e==="hash-params")return`${l.location.search||""}${v?`#${v}`:""}`;const g=l.location.hash||"#",E=g.indexOf("?");return E>0?`${l.location.search||""}${g.slice(0,E)}${v?`?${v}`:""}`:`${l.location.search||""}${g}${v?`?${v}`:""}`}function _(){return new URLSearchParams(p())}function F(d){const v=new Set(Object.keys(a));for(const g of d.keys()){const E=d.getAll(g);a[g]=E.length>1?E:d.get(g)||"",v.delete(g)}Array.from(v).forEach(g=>delete a[g])}const{pause:b,resume:k}=pe(a,()=>{const d=new URLSearchParams("");Object.keys(a).forEach(v=>{const g=a[v];Array.isArray(g)?g.forEach(E=>d.append(v,E)):r&&g==null||i&&!g?d.delete(v):d.set(v,g)}),y(d,!1)},{deep:!0});function y(d,v){b(),v&&F(d),f==="replace"?l.history.replaceState(l.history.state,l.document.title,l.location.pathname+h(d)):l.history.pushState(l.history.state,l.document.title,l.location.pathname+h(d)),k()}function n(){c&&y(_(),!0)}const u={passive:!0};w(l,"popstate",n,u),e!=="history"&&w(l,"hashchange",n,u);const o=_();return o.keys().next().value?F(o):Object.assign(a,t),a}const Ge={},Ke={class:"side-panel"};function Ze(e,s){return O(),V("aside",Ke,[N(e.$slots,"default")])}const wt=x(Ge,[["render",Ze]]),Qe={class:"tabs"},Xe=["onClick"],Ye={class:"tab-content"},et=j({__name:"Tabs",setup(e){const s=P([]),t=P(""),r=i=>{t.value=i};return G("tabs",s),G("activeTab",t),G("selectTab",r),J(()=>{s.value.length>0&&(t.value=s.value[0].value)}),(i,c)=>(O(),V("div",null,[D("div",Qe,[(O(!0),V(ye,null,be(s.value,f=>(O(),V("button",{key:f.value,class:re({active:f.value===t.value}),onClick:l=>r(f.value)},ie(f.label),11,Xe))),128))]),D("div",Ye,[N(i.$slots,"default",{activeTab:t.value},void 0,!0)])]))}}),St=x(et,[["__scopeId","data-v-19959216"]]),tt={key:0},nt=j({__name:"Tab",props:{value:{}},setup(e){const s=Q("tabs"),t=Q("activeTab"),r=e,i=P(!1);return J(()=>{s==null||s.value.push({value:r.value,label:r.value}),i.value=(t==null?void 0:t.value)===r.value}),z(t,c=>{i.value=c===r.value}),(c,f)=>i.value?(O(),V("div",tt,[N(c.$slots,"default",{},void 0,!0)])):ue("",!0)}}),Ft=x(nt,[["__scopeId","data-v-5eacaa8c"]]),lt=["for"],st={class:"title"},at=["id","disabled"],ot={key:0,class:"unit"},rt=j({__name:"InputNumber",props:we({unit:{},identifier:{},disabled:{type:Boolean}},{modelValue:{},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const s=Se(e,"modelValue");return(t,r)=>(O(),V("label",{class:"input",for:t.identifier},[D("div",st,[N(t.$slots,"default",{},void 0,!0)]),D("div",{class:re(["input",{"has-unit":!!t.unit}])},[Fe(D("input",{type:"number",inputmode:"numeric",pattern:"[0-9]+",id:t.identifier,disabled:t.disabled,"onUpdate:modelValue":r[0]||(r[0]=i=>s.value=i)},null,8,at),[[ke,s.value,void 0,{number:!0}]]),t.unit?(O(),V("span",ot,ie(t.unit),1)):ue("",!0)],2)],8,lt))}}),kt=x(rt,[["__scopeId","data-v-1bd1b838"]]),it=["accept","multiple"],ut=j({__name:"FileUploadButton",props:{accept:{},multiple:{type:Boolean},dropzone:{type:Boolean}},emits:["files-uploaded"],setup(e,{emit:s}){const t=e,r=s,i=P(null);function c(f){const l=f.target;l.files&&r("files-uploaded",l.files),l.value=""}return(f,l)=>{const a=$e,p=Te;return O(),Ee(p,{class:"secondary file-upload-area",onClick:l[0]||(l[0]=h=>i.value.click())},{default:X(()=>[ce(a,null,{default:X(()=>l[1]||(l[1]=[Y("folder_open")])),_:1}),l[2]||(l[2]=Y(" Bladeren ")),N(f.$slots,"default",{},void 0,!0),D("input",{type:"file",ref_key:"fileInput",ref:i,accept:t.accept,multiple:t.multiple||null,style:{display:"none"},onChange:c},null,40,it)]),_:3})}}}),ct=x(ut,[["__scopeId","data-v-d8948afc"]]),ft={class:"flex block blur"},dt={class:"buttons"},pt=j({__name:"FileUploadBlock",props:{accept:{},multiple:{type:Boolean}},emits:["files-uploaded"],setup(e,{emit:s}){const t=s,r=e;return(i,c)=>{const f=ct;return O(),V("div",ft,[N(i.$slots,"default",{},void 0,!0),D("div",dt,[ce(f,{id:"file-upload-area",onFilesUploaded:c[0]||(c[0]=l=>t("files-uploaded",l)),accept:r.accept,multiple:r.multiple},null,8,["accept","multiple"]),N(i.$slots,"buttons",{},()=>[c[1]||(c[1]=D("small",null,"Of sleep een bestand naar deze pagina",-1))],!0)])])}}}),Et=x(pt,[["__scopeId","data-v-a55685fb"]]);export{St as _,ht as a,Ft as b,kt as c,wt as d,_t as e,Et as f,yt as g,gt as h,bt as i,mt as o,He as u};
