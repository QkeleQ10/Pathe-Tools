import{D as R,s as le,Q as se,G as x,R as ve,S as me,U as he,r as P,V as ge,W as oe,X as q,b as O,t as T,H as Q,u as ye,x as j,c as C,o as A,a as L,d as U,g as D,F as _e,j as we,q as ae,i as G,Y as J,Z as X,h as ie,y as be,z as Se,A as Ee,L as Fe,$ as ke,p as $e,w as Y,e as Ae,k as Z,C as Oe,v as z,m as Te}from"./index-DMGf9ZjD.js";function re(e){return ve()?(me(e),!0):!1}const K=typeof window<"u"&&typeof document<"u";typeof WorkerGlobalScope<"u"&&globalThis instanceof WorkerGlobalScope;const Ce=Object.prototype.toString,Me=e=>Ce.call(e)==="[object Object]",V=()=>{},Ve=De();function De(){var e,n;return K&&((e=window==null?void 0:window.navigator)==null?void 0:e.userAgent)&&(/iP(?:ad|hone|od)/.test(window.navigator.userAgent)||((n=window==null?void 0:window.navigator)==null?void 0:n.maxTouchPoints)>2&&/iPad|Macintosh/.test(window==null?void 0:window.navigator.userAgent))}function Pe(...e){if(e.length!==1)return he(...e);const n=e[0];return typeof n=="function"?se(ge(()=>({get:n,set:V}))):P(n)}function Ie(e,n){function t(...s){return new Promise((i,u)=>{Promise.resolve(e(()=>n.apply(this,s),{fn:n,thisArg:this,args:s})).then(i).catch(u)})}return t}const ue=e=>e();function Ne(e=ue,n={}){const{initialState:t="active"}=n,s=Pe(t==="active");function i(){s.value=!1}function u(){s.value=!0}const f=(...l)=>{s.value&&e(...l)};return{isActive:se(s),pause:i,resume:u,eventFilter:f}}function H(e){return Array.isArray(e)?e:[e]}function Re(e){return oe()}function xe(e,n,t={}){const{eventFilter:s=ue,...i}=t;return x(e,Ie(s,n),i)}function ce(e,n,t={}){const{eventFilter:s,initialState:i="active",...u}=t,{eventFilter:f,pause:l,resume:r,isActive:d}=Ne(s,{initialState:i});return{stop:xe(e,n,{...u,eventFilter:f}),pause:l,resume:r,isActive:d}}function je(e,n=!0,t){Re()?R(e,t):n?e():le(e)}function Le(e,n,t){return x(e,n,{...t,immediate:!0})}const I=K?window:void 0,ze=K?window.document:void 0;function M(e){var n;const t=T(e);return(n=t==null?void 0:t.$el)!=null?n:t}function F(...e){const n=[],t=()=>{n.forEach(l=>l()),n.length=0},s=(l,r,d,g)=>(l.addEventListener(r,d,g),()=>l.removeEventListener(r,d,g)),i=O(()=>{const l=H(T(e[0])).filter(r=>r!=null);return l.every(r=>typeof r!="string")?l:void 0}),u=Le(()=>{var l,r;return[(r=(l=i.value)==null?void 0:l.map(d=>M(d)))!=null?r:[I].filter(d=>d!=null),H(T(i.value?e[1]:e[0])),H(ye(i.value?e[2]:e[1])),T(i.value?e[3]:e[2])]},([l,r,d,g])=>{if(t(),!(l!=null&&l.length)||!(r!=null&&r.length)||!(d!=null&&d.length))return;const y=Me(g)?{...g}:g;n.push(...l.flatMap(S=>r.flatMap(p=>d.map(_=>s(S,p,_,y)))))},{flush:"post"}),f=()=>{u(),t()};return re(t),f}let ee=!1;function mt(e,n,t={}){const{window:s=I,ignore:i=[],capture:u=!0,detectIframe:f=!1,controls:l=!1}=t;if(!s)return l?{stop:V,cancel:V,trigger:V}:V;if(Ve&&!ee){ee=!0;const o={passive:!0};Array.from(s.document.body.children).forEach(c=>F(c,"click",V,o)),F(s.document.documentElement,"click",V,o)}let r=!0;const d=o=>T(i).some(c=>{if(typeof c=="string")return Array.from(s.document.querySelectorAll(c)).some(a=>a===o.target||o.composedPath().includes(a));{const a=M(c);return a&&(o.target===a||o.composedPath().includes(a))}});function g(o){const c=T(o);return c&&c.$.subTree.shapeFlag===16}function y(o,c){const a=T(o),v=a.$.subTree&&a.$.subTree.children;return v==null||!Array.isArray(v)?!1:v.some(h=>h.el===c.target||c.composedPath().includes(h.el))}const S=o=>{const c=M(e);if(o.target!=null&&!(!(c instanceof Element)&&g(e)&&y(e,o))&&!(!c||c===o.target||o.composedPath().includes(c))){if("detail"in o&&o.detail===0&&(r=!d(o)),!r){r=!0;return}n(o)}};let p=!1;const _=[F(s,"click",o=>{p||(p=!0,setTimeout(()=>{p=!1},0),S(o))},{passive:!0,capture:u}),F(s,"pointerdown",o=>{const c=M(e);r=!d(o)&&!!(c&&!o.composedPath().includes(c))},{passive:!0}),f&&F(s,"blur",o=>{setTimeout(()=>{var c;const a=M(e);((c=s.document.activeElement)==null?void 0:c.tagName)==="IFRAME"&&!(a!=null&&a.contains(s.document.activeElement))&&n(o)},0)},{passive:!0})].filter(Boolean),b=()=>_.forEach(o=>o());return l?{stop:b,cancel:()=>{r=!1},trigger:o=>{r=!0,S(o),r=!1}}:b}function Be(){const e=q(!1),n=oe();return n&&R(()=>{e.value=!0},n),e}function We(e){const n=Be();return O(()=>(n.value,!!e()))}const B=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},W="__vueuse_ssr_handlers__",qe=Ue();function Ue(){return W in B||(B[W]=B[W]||{}),B[W]}function Je(e,n){return qe[e]||n}function He(e){return e==null?"any":e instanceof Set?"set":e instanceof Map?"map":e instanceof Date?"date":typeof e=="boolean"?"boolean":typeof e=="string"?"string":typeof e=="object"?"object":Number.isNaN(e)?"any":"number"}const Ge={boolean:{read:e=>e==="true",write:e=>String(e)},object:{read:e=>JSON.parse(e),write:e=>JSON.stringify(e)},number:{read:e=>Number.parseFloat(e),write:e=>String(e)},any:{read:e=>e,write:e=>String(e)},string:{read:e=>e,write:e=>String(e)},map:{read:e=>new Map(JSON.parse(e)),write:e=>JSON.stringify(Array.from(e.entries()))},set:{read:e=>new Set(JSON.parse(e)),write:e=>JSON.stringify(Array.from(e))},date:{read:e=>new Date(e),write:e=>e.toISOString()}},te="vueuse-storage";function Ke(e,n,t,s={}){var i;const{flush:u="pre",deep:f=!0,listenToStorageChanges:l=!0,writeDefaults:r=!0,mergeDefaults:d=!1,shallow:g,window:y=I,eventFilter:S,onError:p=m=>{console.error(m)},initOnMounted:_}=s,b=(g?q:P)(typeof n=="function"?n():n),o=O(()=>T(e));if(!t)try{t=Je("getDefaultStorage",()=>{var m;return(m=I)==null?void 0:m.localStorage})()}catch(m){p(m)}if(!t)return b;const c=T(n),a=He(c),v=(i=s.serializer)!=null?i:Ge[a],{pause:h,resume:w}=ce(b,()=>fe(b.value),{flush:u,deep:f,eventFilter:S});x(o,()=>N(),{flush:u}),y&&l&&je(()=>{t instanceof Storage?F(y,"storage",N,{passive:!0}):F(y,te,pe),_&&N()}),_||N();function $(m,E){if(y){const k={key:o.value,oldValue:m,newValue:E,storageArea:t};y.dispatchEvent(t instanceof Storage?new StorageEvent("storage",k):new CustomEvent(te,{detail:k}))}}function fe(m){try{const E=t.getItem(o.value);if(m==null)$(E,null),t.removeItem(o.value);else{const k=v.write(m);E!==k&&(t.setItem(o.value,k),$(E,k))}}catch(E){p(E)}}function de(m){const E=m?m.newValue:t.getItem(o.value);if(E==null)return r&&c!=null&&t.setItem(o.value,v.write(c)),c;if(!m&&d){const k=v.read(E);return typeof d=="function"?d(k,c):a==="object"&&!Array.isArray(k)?{...c,...k}:k}else return typeof E!="string"?E:v.read(E)}function N(m){if(!(m&&m.storageArea!==t)){if(m&&m.key==null){b.value=c;return}if(!(m&&m.key!==o.value)){h();try{(m==null?void 0:m.newValue)!==v.write(b.value)&&(b.value=de(m))}catch(E){p(E)}finally{m?le(w):w()}}}}function pe(m){N(m.detail)}return b}function ht(e,n={}){const{initialValue:t=!1,focusVisible:s=!1,preventScroll:i=!1}=n,u=q(!1),f=O(()=>M(e)),l={passive:!0};F(f,"focus",d=>{var g,y;(!s||(y=(g=d.target).matches)!=null&&y.call(g,":focus-visible"))&&(u.value=!0)},l),F(f,"blur",()=>u.value=!1,l);const r=O({get:()=>u.value,set(d){var g,y;!d&&u.value?(g=f.value)==null||g.blur():d&&!u.value&&((y=f.value)==null||y.focus({preventScroll:i}))}});return x(f,()=>{r.value=t},{immediate:!0,flush:"post"}),{focused:r}}const ne=["fullscreenchange","webkitfullscreenchange","webkitendfullscreen","mozfullscreenchange","MSFullscreenChange"];function gt(e,n={}){const{document:t=ze,autoExit:s=!1}=n,i=O(()=>{var a;return(a=M(e))!=null?a:t==null?void 0:t.documentElement}),u=q(!1),f=O(()=>["requestFullscreen","webkitRequestFullscreen","webkitEnterFullscreen","webkitEnterFullScreen","webkitRequestFullScreen","mozRequestFullScreen","msRequestFullscreen"].find(a=>t&&a in t||i.value&&a in i.value)),l=O(()=>["exitFullscreen","webkitExitFullscreen","webkitExitFullScreen","webkitCancelFullScreen","mozCancelFullScreen","msExitFullscreen"].find(a=>t&&a in t||i.value&&a in i.value)),r=O(()=>["fullScreen","webkitIsFullScreen","webkitDisplayingFullscreen","mozFullScreen","msFullscreenElement"].find(a=>t&&a in t||i.value&&a in i.value)),d=["fullscreenElement","webkitFullscreenElement","mozFullScreenElement","msFullscreenElement"].find(a=>t&&a in t),g=We(()=>i.value&&t&&f.value!==void 0&&l.value!==void 0&&r.value!==void 0),y=()=>d?(t==null?void 0:t[d])===i.value:!1,S=()=>{if(r.value){if(t&&t[r.value]!=null)return t[r.value];{const a=i.value;if((a==null?void 0:a[r.value])!=null)return!!a[r.value]}}return!1};async function p(){if(!(!g.value||!u.value)){if(l.value)if((t==null?void 0:t[l.value])!=null)await t[l.value]();else{const a=i.value;(a==null?void 0:a[l.value])!=null&&await a[l.value]()}u.value=!1}}async function _(){if(!g.value||u.value)return;S()&&await p();const a=i.value;f.value&&(a==null?void 0:a[f.value])!=null&&(await a[f.value](),u.value=!0)}async function b(){await(u.value?p():_())}const o=()=>{const a=S();(!a||a&&y())&&(u.value=a)},c={capture:!1,passive:!0};return F(t,ne,o,c),F(()=>M(i),ne,o,c),s&&re(p),{isSupported:g,isFullscreen:u,enter:_,exit:p,toggle:b}}function yt(e,n,t={}){const{window:s=I}=t;return Ke(e,n,s==null?void 0:s.localStorage,t)}function _t(e="history",n={}){const{initialValue:t={},removeNullishValues:s=!0,removeFalsyValues:i=!1,write:u=!0,writeMode:f="replace",window:l=I}=n;if(!l)return Q(t);const r=Q({});function d(){if(e==="history")return l.location.search||"";if(e==="hash"){const v=l.location.hash||"",h=v.indexOf("?");return h>0?v.slice(h):""}else return(l.location.hash||"").replace(/^#/,"")}function g(v){const h=v.toString();if(e==="history")return`${h?`?${h}`:""}${l.location.hash||""}`;if(e==="hash-params")return`${l.location.search||""}${h?`#${h}`:""}`;const w=l.location.hash||"#",$=w.indexOf("?");return $>0?`${l.location.search||""}${w.slice(0,$)}${h?`?${h}`:""}`:`${l.location.search||""}${w}${h?`?${h}`:""}`}function y(){return new URLSearchParams(d())}function S(v){const h=new Set(Object.keys(r));for(const w of v.keys()){const $=v.getAll(w);r[w]=$.length>1?$:v.get(w)||"",h.delete(w)}Array.from(h).forEach(w=>delete r[w])}const{pause:p,resume:_}=ce(r,()=>{const v=new URLSearchParams("");Object.keys(r).forEach(h=>{const w=r[h];Array.isArray(w)?w.forEach($=>v.append(h,$)):s&&w==null||i&&!w?v.delete(h):v.set(h,w)}),b(v,!1)},{deep:!0});function b(v,h){p(),h&&S(v),f==="replace"?l.history.replaceState(l.history.state,l.document.title,l.location.pathname+g(v)):l.history.pushState(l.history.state,l.document.title,l.location.pathname+g(v)),_()}function o(){u&&b(y(),!0)}const c={passive:!0};F(l,"popstate",o,c),e!=="history"&&F(l,"hashchange",o,c);const a=y();return a.keys().next().value?S(a):Object.assign(r,t),r}const Qe={},Xe={class:"side-panel"};function Ye(e,n){return A(),C("aside",Xe,[L(e.$slots,"default")])}const wt=j(Qe,[["render",Ye]]),Ze={class:"tabs"},et=["onClick"],tt={class:"tab-content"},nt=U({__name:"Tabs",setup(e){const n=P([]),t=P(""),s=i=>{t.value=i};return J("tabs",n),J("activeTab",t),J("selectTab",s),R(()=>{n.value.length>0&&(t.value=n.value[0].value)}),(i,u)=>(A(),C("div",null,[D("div",Ze,[(A(!0),C(_e,null,we(n.value,f=>(A(),C("button",{key:f.value,class:ae({active:f.value===t.value}),onClick:l=>s(f.value)},G(f.label),11,et))),128))]),D("div",tt,[L(i.$slots,"default",{activeTab:t.value},void 0,!0)])]))}}),bt=j(nt,[["__scopeId","data-v-19959216"]]),lt={key:0},st=U({__name:"Tab",props:{value:{}},setup(e){const n=X("tabs"),t=X("activeTab"),s=e,i=P(!1);return R(()=>{n==null||n.value.push({value:s.value,label:s.value}),i.value=(t==null?void 0:t.value)===s.value}),x(t,u=>{i.value=u===s.value}),(u,f)=>i.value?(A(),C("div",lt,[L(u.$slots,"default",{},void 0,!0)])):ie("",!0)}}),St=j(st,[["__scopeId","data-v-5eacaa8c"]]),ot=["for"],at={class:"title"},it=["id","disabled"],rt={key:0,class:"unit"},ut=U({__name:"InputNumber",props:be({unit:{},identifier:{},disabled:{type:Boolean}},{modelValue:{},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const n=Se(e,"modelValue");return(t,s)=>(A(),C("label",{class:"input",for:t.identifier},[D("div",at,[L(t.$slots,"default",{},void 0,!0)]),D("div",{class:ae(["input",{"has-unit":!!t.unit}])},[Ee(D("input",{type:"number",inputmode:"numeric",pattern:"[0-9]+",id:t.identifier,disabled:t.disabled,"onUpdate:modelValue":s[0]||(s[0]=i=>n.value=i)},null,8,it),[[Fe,n.value,void 0,{number:!0}]]),t.unit?(A(),C("span",rt,G(t.unit),1)):ie("",!0)],2)],8,ot))}}),Et=j(ut,[["__scopeId","data-v-1bd1b838"]]),ct={key:0},ft={key:1},dt=["accept","multiple"],pt=U({__name:"FileUploadButton",props:{accept:{},multiple:{type:Boolean}},emits:["files-uploaded"],setup(e,{emit:n}){const t=e,s=n,i=P(null),u=P(!1);let f=null;function l(){u.value=!0,f&&clearTimeout(f)}function r(){f=setTimeout(()=>u.value=!1,50)}function d(p){u.value=!1,s("files-uploaded",p.dataTransfer.files)}function g(p){const _=p.target;_.files&&s("files-uploaded",_.files)}function y(p){p.preventDefault()}const S=["dragenter","dragover","dragleave","drop"];return R(()=>{S.forEach(p=>{document.body.addEventListener(p,y)})}),ke(()=>{S.forEach(p=>{document.body.removeEventListener(p,y)})}),(p,_)=>{const b=Oe,o=Te;return A(),$e(o,{class:"file-upload-area","data-drag-active":u.value,onDragenter:z(l,["prevent"]),onDragover:z(l,["prevent"]),onDragleave:z(r,["prevent"]),onDrop:z(d,["prevent"]),onClick:_[0]||(_[0]=c=>i.value.click())},{default:Y(()=>[D("div",null,[u.value?(A(),C("div",ft,"Laat los om te uploaden")):(A(),C("div",ct,[Ae(b,null,{default:Y(()=>_[1]||(_[1]=[Z("folder_open")])),_:1}),Z(" Bestand"+G(t.multiple?"en":"")+" uploaden",1)])),L(p.$slots,"default",{},void 0,!0)]),D("input",{type:"file",ref_key:"fileInput",ref:i,accept:t.accept,multiple:t.multiple||null,style:{display:"none"},onChange:g},null,40,dt)]),_:3},8,["data-drag-active"])}}}),Ft=j(pt,[["__scopeId","data-v-c34a0bc7"]]);export{wt as S,bt as _,St as a,Et as b,ht as c,_t as d,yt as e,Ft as f,gt as g,mt as o,Ke as u};
