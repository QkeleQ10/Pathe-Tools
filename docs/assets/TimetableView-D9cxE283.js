import{o as he,u as H,a as fe,C as te,x as ge,_ as ye,b as ve,c as be}from"./super-vue3-tabs-CoZNwtCx.js";import{r as $,o as d,c as p,a as _e,n as we,_ as Te,b as Ee,d as u,e as X,u as i,f as A,t as w,F as K,g as ne,w as L,T as ke,h as Se,i as xe,j as z,k as De,l as F,m as J,p as q,q as Ce,s as Ie,v as Ae,x as Me}from"./index-D0Xn_xV6.js";const Ne={__name:"ContextMenu",props:["x","y"],emits:["click-outside"],setup(e,{emit:t}){const n=t,c=$(null);return he(c,a=>n("click-outside",a)),(a,_)=>(d(),p("div",{class:"context-menu",ref_key:"target",ref:c,style:we({top:e.y+"px",left:e.x+"px"})},[_e(a.$slots,"default")],4))}};var Re=Object.defineProperty,oe=Object.getOwnPropertySymbols,Ue=Object.prototype.hasOwnProperty,Pe=Object.prototype.propertyIsEnumerable,se=(e,t,n)=>t in e?Re(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,le=(e,t)=>{for(var n in t||(t={}))Ue.call(t,n)&&se(e,n,t[n]);if(oe)for(var n of oe(t))Pe.call(t,n)&&se(e,n,t[n]);return e},Q=(e,t,n)=>new Promise((c,a)=>{var _=y=>{try{g(n.next(y))}catch(h){a(h)}},E=y=>{try{g(n.throw(y))}catch(h){a(h)}},g=y=>y.done?c(y.value):Promise.resolve(y.value).then(_,E);g((n=n.apply(e,t)).next())});function ee(e){return!!e.shadowRoot}let ie=!1;function Le(){if(ie)return;class e extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}}customElements.define("vue-to-print-shadow-dom",e),ie=!0}const je=`
  class VueToPrintShadowDom extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  }
  customElements.define('vue-to-print-shadow-dom', VueToPrintShadowDom);
`;function Ve(e){const t=e.createElement("script");t.setAttribute("type","text/javascript"),t.setAttribute("vue-to-print-custom-script","registry-shadow-dom"),t.innerHTML=je,e.body.appendChild(t)}const Oe=`
  function retrieveStyleSheets(styleSheetMap) {
    styleSheetMap.forEach((styleSheetStrings, tagName) => {
      const styleSheets = [];
      for (let i = styleSheetStrings.length; i--;) {
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styleSheetStrings[i]);
        styleSheets.push(styleSheet);
      }

      const elements = document.querySelectorAll('vue-to-print-shadow-dom[original-tag-name=' + tagName + ']');
      for (let i = elements.length; i--;) {
        const element = elements[i];
        element.shadowRoot.adoptedStyleSheets = styleSheets;
      }
    });
  }
`;function Fe(e){const t=e.createElement("script");t.setAttribute("type","text/javascript"),t.setAttribute("vue-to-print-custom-script","registry-retrieve-style-sheets-func"),t.innerHTML=Oe,e.body.appendChild(t)}const Z=new Map;function re(e){Le();const t=e.nodeName.toLowerCase(),n=e.shadowRoot.adoptedStyleSheets,c=document.createElement("vue-to-print-shadow-dom");c.setAttribute("original-tag-name",t),Z.has(t)||Z.set(t,new Set);const a=Z.get(t);for(let g=n.length;g--;)a.add(n[g]);const _=c.attributes,E=e.attributes;for(let g=E.length;g--;)_.setNamedItem(E[g].cloneNode());return c}function Xe(){const e=new Map,t=new Map,n=Array.from(Z.keys());for(let c=n.length;c--;){const a=[],_=n[c],E=Array.from(Z.get(_));for(let g=E.length;g--;){const y=E[g];if(!t.has(y)){let h="";const s=Array.from(y.cssRules);for(let f=s.length;f--;)h+=s[f].cssText;t.set(y,h)}a.push(t.get(y))}e.set(_,a)}return e}function Be(e){const t=e.contentWindow||null;if(!t)throw new Error("Cannot access print window");const n=t.document;if(!n)throw new Error("Cannot access print document");Ve(n),Fe(n);const c=Xe();t.retrieveStyleSheets(c)}function ae(e){return!!customElements.get(e.nodeName.toLowerCase())}let de=!1;function $e(){if(de)return;class e extends HTMLElement{constructor(){super()}}customElements.define("vue-to-print-custom-element",e),de=!0}function ce(e){$e();const t=e.nodeName.toLowerCase(),n=document.createElement("vue-to-print-custom-element");n.setAttribute("original-tag-name",t);const c=n.attributes,a=e.attributes;for(let _=a.length;_--;)c.setNamedItem(a[_].cloneNode());return n}function pe(e){return Q(this,null,function*(){e.getAttribute("src")&&(e.complete||(yield new Promise((t,n)=>{e.addEventListener("load",t,{once:!0}),e.addEventListener("error",c=>n(c.error),{once:!0})})))})}function He(e){return Q(this,null,function*(){e.readyState>=2||(yield new Promise((t,n)=>{e.addEventListener("loadeddata",t,{once:!0}),e.addEventListener("error",c=>n(c.error),{once:!0}),e.addEventListener("stalled",()=>n(new Error("Loading video stalled, skipping")),{once:!0})}))})}function We(e){const t=e.cloneNode(),n=t.getContext("2d");return n&&n.drawImage(e,0,0),t}function Ge(e,t){const n=e.cloneNode();return t.push(pe(n)),n}function Ye(e,t){const n=e.cloneNode();n.preload="auto";const c=n.getAttribute("poster");if(c){const a=new Image;a.src=c,t.push(pe(a))}else t.push(He(n));return n}function ze(e){const t=e.cloneNode();switch(e.type){case"checkbox":case"radio":t.checked=e.checked;break;default:t.value=e.value;break}return t}function qe(e){const t=e.cloneNode();return t.value=e.value,t}function Ze(e){const t=e.cloneNode();return t.selected=e.selected,t}const ue=new Map([["canvas",We],["img",Ge],["video",Ye],["input",ze],["select",qe],["option",Ze]]);function Qe(e){return e.cloneNode()}function Je(e,t=[]){const n=e.nodeName.toLowerCase();return(ue.has(n)?ue.get(n):Qe)(e,t)}function Ke(e){var t;if(e.nodeName.toLowerCase()==="slot"){const n=e.assignedNodes();return n.length>0?n:Array.from(e.childNodes)}else return Array.from(((t=e.shadowRoot)!=null?t:e).childNodes)}function et(e){return Q(this,null,function*(){const t=new Map,n=[];let c;ee(e)?c=re(e):ae(e)?c=ce(e):c=e.cloneNode(),t.set(e,c);const a=[e];for(;a.length;){const _=a.shift(),E=Ke(_);if(E.length<=0)continue;const g=t.get(_),y=ee(g)?g.shadowRoot:g;for(let h=0;h<E.length;h++){const s=E[h];let f;ee(s)?f=re(s):ae(s)?f=ce(s):f=Je(s,n),t.set(s,f),a.push(s),y.appendChild(f)}}return yield Promise.all(n),c})}const tt={copyStyles:!0,pageStyle:`
        @page {
            /* Remove browser default header (title) and footer (url) */
            margin: 0;
        }
        @media print {
            body {
                /* Tell browsers to print background colors */
                -webkit-print-color-adjust: exact; /* Chrome/Safari/Edge/Opera */
                color-adjust: exact; /* Firefox */
            }
        }
    `,removeAfterPrint:!1,suppressErrors:!1};function nt(e){e=le(le({},tt),e);let t=0,n=[],c=[];const a=s=>{const{onAfterPrint:f,onPrintError:S,print:x,documentTitle:U}=e;setTimeout(()=>{var P,N;if(s.contentWindow)if(s.contentWindow.focus(),x)x(s).then(()=>f==null?void 0:f()).then(()=>y()).catch(v=>{S?S("print",v):h(["An error was thrown by the specified `print` function"])});else{if(s.contentWindow.print){const v=(N=(P=s.contentDocument)==null?void 0:P.title)!=null?N:"",W=s.ownerDocument.title;U&&(s.ownerDocument.title=U,s.contentDocument&&(s.contentDocument.title=U)),s.contentWindow.print(),U&&(s.ownerDocument.title=W,s.contentDocument&&(s.contentDocument.title=v))}else h(["Printing for this browser is not currently possible: the browser does not have a `print` method available for iframes."]);f==null||f(),y()}else h(["Printing failed because the `contentWindow` of the print iframe did not load. This is possibly an error with `vue-to-print`. Please file an issue: https://github.com/gregnb/react-to-print/issues/"])},500)},_=s=>{const{onBeforePrint:f,onPrintError:S}=e;if(f){const x=f();x&&typeof x.then=="function"?x.then(()=>{a(s)}).catch(U=>{S&&S("onBeforePrint",U)}):a(s)}else a(s)},E=()=>{const{onBeforeGetContent:s,onPrintError:f}=e;if(s){const S=s();S&&typeof S.then=="function"?S.then(g).catch(x=>{f&&f("onBeforeGetContent",x)}):g()}else g()},g=()=>Q(this,null,function*(){const{bodyClass:s,content:f,copyStyles:S,fonts:x,pageStyle:U,nonce:P}=e,N=f();if(N===void 0){h(["To print a functional component ensure it is wrapped with `React.forwardRef`, and ensure the forwarded ref is used. See the README for an example: https://github.com/gregnb/react-to-print#examples"]);return}if(N===null){h(['There is nothing to print because the "content" prop returned "null". Please ensure "content" is renderable before allowing "vue-to-print" to be called.']);return}const v=document.createElement("iframe");v.width=`${document.documentElement.clientWidth}px`,v.height=`${document.documentElement.clientHeight}px`,v.style.position="absolute",v.style.top=`-${document.documentElement.clientHeight+100}px`,v.style.left=`-${document.documentElement.clientWidth+100}px`,v.id="printWindow",v.srcdoc="<!DOCTYPE html>";const W=N;if(!W){h(['"vue-to-print" could not locate the DOM node corresponding with the `content` prop']);return}const G=yield et(W),O=document.querySelectorAll("link[rel~='stylesheet']"),Y=x?x.length:0;t=O.length+Y,n=[],c=[];const j=(B,k)=>{if(n.includes(B)){h(["Tried to mark a resource that has already been handled",B],"debug");return}k?(h(['"vue-to-print" was unable to load a resource but will continue attempting to print the page',...k]),c.push(B)):n.push(B),n.length+c.length===t&&_(v)};v.onload=()=>Q(this,null,function*(){var B,k;v.onload=null;const l=v.contentDocument||((B=v.contentWindow)==null?void 0:B.document);if(l){l.body.appendChild(G),x&&((k=v.contentDocument)!=null&&k.fonts&&typeof FontFace<"u"?x.forEach(r=>{const b=new FontFace(r.family,r.source,{weight:r.weight,style:r.style});v.contentDocument.fonts.add(b),b.loaded.then(()=>{j(b)}).catch(V=>{j(b,["Failed loading the font:",b,"Load error:",V])})}):(x.forEach(r=>j(r)),h(['"vue-to-print" is not able to load custom fonts because the browser does not support the FontFace API but will continue attempting to print the page'])));const D=typeof U=="function"?U():U;if(typeof D!="string")h([`"vue-to-print" expected a "string" from \`pageStyle\` but received "${typeof D}". Styles from \`pageStyle\` will not be applied.`]);else{const r=l.createElement("style");P&&(r.setAttribute("nonce",P),l.head.setAttribute("nonce",P)),r.appendChild(l.createTextNode(D)),l.head.appendChild(r)}if(s&&l.body.classList.add(...s.split(" ")),S){const r=document.querySelectorAll("style, link[rel~='stylesheet']");for(let b=0,V=r.length;b<V;++b){const T=r[b];if(T.tagName.toLowerCase()==="style"){const o=l.createElement(T.tagName),m=T.sheet;if(m){let M="";try{const C=m.cssRules.length;for(let I=0;I<C;++I)typeof m.cssRules[I].cssText=="string"&&(M+=`${m.cssRules[I].cssText}\r
`)}catch{h(["A stylesheet could not be accessed. This is likely due to the stylesheet having cross-origin imports, and many browsers block script access to cross-origin stylesheets. See https://github.com/gregnb/react-to-print/issues/429 for details. You may be able to load the sheet by both marking the stylesheet with the cross `crossorigin` attribute, and setting the `Access-Control-Allow-Origin` header on the server serving the stylesheet. Alternatively, host the stylesheet on your domain to avoid this issue entirely.",T],"warning")}o.setAttribute("id",`vue-to-print-${b}`),P&&o.setAttribute("nonce",P),o.appendChild(l.createTextNode(M)),l.head.appendChild(o)}}else if(T.getAttribute("href"))if(T.hasAttribute("disabled"))h(["`vue-to-print` encountered a <link> tag with a `disabled` attribute and will ignore it. Note that the `disabled` attribute is deprecated, and some browsers ignore it. You should stop using it. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-disabled. The <link> is:",T],"warning"),j(T);else{const o=l.createElement(T.tagName);for(let m=0,M=T.attributes.length;m<M;++m){const C=T.attributes[m];C&&o.setAttribute(C.nodeName,C.nodeValue||"")}o.onload=()=>j(o),o.onerror=(m,M,C,I,me)=>j(o,["Failed to load",o,"Error:",me]),P&&o.setAttribute("nonce",P),l.head.appendChild(o)}else h(["`vue-to-print` encountered a <link> tag with an empty `href` attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:",T],"warning"),j(T)}}}Be(v),(t===0||!S)&&_(v)}),y(!0),document.body.appendChild(v)}),y=s=>{const{removeAfterPrint:f}=e;if(s||f){const S=document.getElementById("printWindow");S&&document.body.removeChild(S)}},h=(s,f="error")=>{const{suppressErrors:S}=e;S||(f==="error"?console.error(s):f==="warning"?console.warn(s):f==="debug"&&console.debug(s))};return{handlePrint:E}}const R=e=>(Ce("data-v-a943966d"),e=e(),Ie(),e),ot={class:"container dark"},st=R(()=>u("h2",null,"Tijdenlijstje bewerken",-1)),lt={class:"flex",style:{"flex-wrap":"wrap"}},it={spellcheck:"false"},rt=R(()=>u("col",{span:"1",style:{width:"0"}},null,-1)),at=R(()=>u("col",{span:"1",style:{width:"0"}},null,-1)),dt=R(()=>u("col",{span:"1",style:{width:"16%"}},null,-1)),ct={key:0,span:"1",style:{width:"0"}},ut=R(()=>u("col",{span:"1",style:{width:"28%"}},null,-1)),pt={key:1,span:"1",style:{width:"0"}},mt={key:2,span:"1",style:{width:"0"}},ht=R(()=>u("col",{span:"1",style:{width:"50%"}},null,-1)),ft=R(()=>u("col",{span:"1",style:{width:"0"}},null,-1)),gt=R(()=>u("td",{nowrap:"",contenteditable:"",width:"1px"},"Zaal",-1)),yt=R(()=>u("td",{nowrap:"",contenteditable:""},"Inloop",-1)),vt={key:0,nowrap:"",contenteditable:""},bt=R(()=>u("td",{nowrap:"",contenteditable:""},null,-1)),_t=R(()=>u("td",{nowrap:"",contenteditable:""},"Aftiteling",-1)),wt={key:1,nowrap:"",contenteditable:""},Tt={key:2,nowrap:"",contenteditable:""},Et=R(()=>u("td",{nowrap:"",contenteditable:""},"Film",-1)),kt=R(()=>u("td",{nowrap:"",contenteditable:""},null,-1)),St=["onContextmenu"],xt={nowrap:"",contenteditable:""},Dt={nowrap:"",contenteditable:""},Ct={key:0,nowrap:"",contenteditable:"",class:"translucent"},It=["onDblclick"],At={key:2},Mt={nowrap:""},Nt={key:0,class:"double-usherout"},Rt={key:1,class:"long-gap"},Ut={key:2,class:"plf-overlap"},Pt={contenteditable:"",style:{position:"absolute",inset:"0",padding:"2px 6px",display:"flex","align-items":"center"}},Lt={key:0,style:{opacity:".35","font-weight":"normal","font-style":"normal","margin-left":"4px"}},jt={key:3,nowrap:"",contenteditable:"",class:"translucent"},Vt={key:4,nowrap:"",contenteditable:"",class:"translucent",style:{"font-weight":"normal","font-style":"normal"}},Ot={key:5,nowrap:"",contenteditable:""},Ft={style:{float:"right"}},Xt={key:6,nowrap:"",contenteditable:""},Bt=R(()=>u("div",{class:"custom-content",contenteditable:""},null,-1)),$t={class:"footer"},Ht={id:"parameters",style:{display:"flex","flex-direction":"column",flex:"229px 1 1"}},Wt={key:0,class:"small"},Gt={key:1,class:"small"},Yt={key:0,class:"small"},zt={key:1,class:"small"},qt={key:0,class:"small"},Zt={key:1,class:"small"},Qt={key:0,class:"small"},Jt={key:1,class:"small"},Kt={key:0,class:"small"},en={key:1,class:"small"},tn={class:"buttons",style:{display:"flex","flex-direction":"column",gap:"16px","align-items":"stretch","margin-top":"auto",position:"sticky",bottom:"16px","padding-inline":"16px"}},nn={__name:"TimetableView",setup(e){const t={mainTime:{header:"Start",title:"Start hoofdfilm",optional:!0},endTime:{header:"Einde",title:"Einde voorstelling",optional:!0},nextStartTime:{header:"Volgende",title:"Volgende inloop",optional:!0}},n=Object.fromEntries(Object.entries(t).filter(([k,l])=>l.optional)),c=$(!0),a=H("optional-columns",{mainTime:!1,endTime:!1,nextStartTime:!1}),_=H("plf-time-before",17),E=H("plf-time-after",16),g=H("short-gap-interval",10),y=H("long-gap-interval",35),h=H("calculate-post-credits",!0),s=H("post-credits-films",new Set);for(;s.value.size>20;)console.log(s.value),s.value.delete(Array.from(s.value)[0]);const f=$(null),S=$(null),x=$(!1),U=$(0),P=$(0),N=$({}),v=$(0),W=(k,l,D)=>{k.preventDefault(),document.activeElement.blur(),x.value=!0,N.value=l,v.value=D,U.value=k.clientX,P.value=k.clientY},G=()=>{Ae(()=>x.value=!1)},O=fe(),Y=Ee(()=>{let k=O.table.map((l,D)=>{var b,V,T,o,m,M;let r={...l};return r.extra=(T=(V=(b=l.PLAYLIST)==null?void 0:b.match(/(\s((4DX)|(ATMOS)|(IMX)|(3D)|(Music)|(ROOFTOP)|(PrideNight)|(Ladies)|(Premiere)|(\([A-Z]+\))))+/))==null?void 0:V[0])==null?void 0:T.slice(1),r.title=(o=l.PLAYLIST)==null?void 0:o.replace(r.extra,""),r.overlapWithPlf=O.table.filter(C=>{var I;return(I=C.AUDITORIUM)==null?void 0:I.includes("4DX")}).some(C=>j(C.SCHEDULED_TIME,l.CREDITS_TIME)>=_.value*-6e4&&j(C.SCHEDULED_TIME,l.CREDITS_TIME)<=E.value*6e4),r.hasPostCredits=s.value.has(r.title),r.assumedEndTime=r.hasPostCredits&&h.value?l.END_TIME:l.CREDITS_TIME,r.timeToNextUsherout=j(r.assumedEndTime,(m=O.table.at(D+1))==null?void 0:m.CREDITS_TIME),r.nextStartTime=(M=O.table.find((C,I)=>I>D&&C.AUDITORIUM===l.AUDITORIUM))==null?void 0:M.SCHEDULED_TIME,r});return k.filter(l=>{var D;return(D=l.AUDITORIUM)==null?void 0:D.includes("4DX")}).slice(1).forEach(l=>{let D;for(let r=0;r<k.length;r++){const b=k[r];if(j(l.SCHEDULED_TIME,b.CREDITS_TIME)>0){D=r-1;break}}k.at(D).isNearPlf=!0}),k||[]});function j(k,l){function D(o){const[m,M,C]=o.split(":").map(Number),I=new Date;return new Date(I.getFullYear(),I.getMonth(),I.getDate(),m,M,C)}if(!k||!l)return;const r=D(k),b=D(l),V=b-r;b.setDate(b.getDate()+1);const T=b-r;return Math.abs(V)<Math.abs(T)?V:T}const{handlePrint:B}=nt({content:()=>f.value,documentTitle:"Tijdenlijstje "+new Date().toLocaleDateString("nl-NL")});return(k,l)=>{const D=ye,r=ve,b=be,V=Se,T=Ne;return d(),p(K,null,[u("div",ot,[X(D),i(O).table.length>0?(d(),p("section",{key:0,id:"edit",ref_key:"editSection",ref:S},[st,u("div",lt,[u("div",{id:"print-component",ref_key:"printComponent",ref:f},[u("table",it,[u("colgroup",null,[rt,at,dt,i(a).mainTime?(d(),p("col",ct)):A("",!0),ut,i(a).endTime?(d(),p("col",pt)):A("",!0),i(a).nextStartTime?(d(),p("col",mt)):A("",!0),ht,ft]),u("thead",null,[gt,yt,i(a).mainTime?(d(),p("td",vt,w(t.mainTime.header),1)):A("",!0),bt,_t,i(a).endTime?(d(),p("td",wt,w(t.endTime.header),1)):A("",!0),i(a).nextStartTime?(d(),p("td",Tt,w(t.nextStartTime.header),1)):A("",!0),Et,kt]),(d(!0),p(K,null,ne(Y.value,(o,m)=>{var M,C;return xe((d(),p("tr",{class:z({targeting:x.value&&v.value===m,italic:(M=o.AUDITORIUM)==null?void 0:M.includes("4DX"),bold:o.FEATURE_RATING==="16"||o.FEATURE_RATING==="18"}),onContextmenu:De(I=>W(I,o,m),["prevent"])},[u("td",xt,w(o.AUDITORIUM==="PULR 8"?"RT":o.AUDITORIUM.replace(/^\w+\s/,"")),1),u("td",Dt,w(o.SCHEDULED_TIME.replace(/(:00)$/,"")),1),i(a).mainTime?(d(),p("td",Ct,w(o.FEATURE_TIME),1)):A("",!0),m!==Y.value.length-1?(d(),p("td",{key:1,nowrap:"",contenteditable:"",class:z(["special-cell",{"toilet-round":!!o.preferToiletRound}]),onDblclick:I=>i(O).table.at(m).preferToiletRound=!o.preferToiletRound},w(o.isNearPlf?"4DX":" "),43,It)):(d(),p("td",At)),u("td",Mt,[o.timeToNextUsherout<=i(g)*6e4?(d(),p("div",Nt)):A("",!0),o.timeToNextUsherout>=i(y)*6e4&&i(y)>0?(d(),p("div",Rt)):A("",!0),o.overlapWithPlf?(d(),p("div",Ut)):A("",!0),u("span",Pt,[F(w(o.CREDITS_TIME)+" ",1),o.hasPostCredits?(d(),p("span",Lt,"+")):A("",!0)])]),i(a).endTime?(d(),p("td",jt,w(o.END_TIME),1)):A("",!0),i(a).nextStartTime?(d(),p("td",Vt,w(((C=o.nextStartTime)==null?void 0:C.replace(/(:00)$/,""))||"-"),1)):A("",!0),c.value?(d(),p("td",Ot,[u("span",null,w(o.title),1),u("span",Ft,w(o.extra),1)])):(d(),p("td",Xt,w(o.PLAYLIST),1)),u("td",{nowrap:"",contenteditable:"",style:{"text-align":"end"},class:z({translucent:o.FEATURE_RATING!=="16"&&o.FEATURE_RATING!=="18"})},w(o.FEATURE_RATING),3)],42,St)),[[Me,m!=0]])}),256))]),Bt,u("div",$t," gegenereerd op "+w(new Date().toLocaleDateString("nl-NL",{weekday:"short",day:"numeric",month:"short",year:"numeric"}))+" om "+w(new Date().toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"}))+" • Pathé Tools • Quinten Althues ",1)],512),u("div",Ht,[X(i(ge),{themeColor:"#ffc426"},{default:L(()=>[X(i(te),{value:"Opties"},{default:L(()=>[X(r,{modelValue:c.value,"onUpdate:modelValue":l[0]||(l[0]=o=>c.value=o),identifier:"splitExtra"},{default:L(()=>[F(" Extra informatie scheiden van filmtitel ")]),_:1},8,["modelValue"]),i(O).table.some(o=>{var m;return(m=o.AUDITORIUM)==null?void 0:m.includes("4DX")})?(d(),J(b,{key:0,modelValue:i(_),"onUpdate:modelValue":l[1]||(l[1]=o=>q(_)?_.value=o:null),modelModifiers:{number:!0},identifier:"plfTimeBefore",min:"0",max:"30",unit:"min"},{default:L(()=>[F(" Tijd vóór inloop 4DX "),i(_)>0?(d(),p("div",Wt,"Uitlopen vanaf "+w(i(_))+" minuten voor een 4DX-inloop krijgen een streeplijntje",1)):(d(),p("div",Gt,"Uitlopen vlak voor een 4DX-inloop worden niet gemarkeerd"))]),_:1},8,["modelValue"])):A("",!0),i(O).table.some(o=>{var m;return(m=o.AUDITORIUM)==null?void 0:m.includes("4DX")})?(d(),J(b,{key:1,modelValue:i(E),"onUpdate:modelValue":l[2]||(l[2]=o=>q(E)?E.value=o:null),modelModifiers:{number:!0},identifier:"plfTimeAfter",min:"0",max:"30",unit:"min"},{default:L(()=>[F(" Tijd na inloop 4DX "),i(E)>0?(d(),p("div",Yt,"Uitlopen tot "+w(i(E))+" minuten na een 4DX-inloop krijgen een streeplijntje",1)):(d(),p("div",zt,"Uitlopen vlak na een 4DX-inloop worden niet gemarkeerd"))]),_:1},8,["modelValue"])):A("",!0),X(b,{modelValue:i(g),"onUpdate:modelValue":l[3]||(l[3]=o=>q(g)?g.value=o:null),modelModifiers:{number:!0},identifier:"shortGapInterval",min:"0",max:"20",unit:"min"},{default:L(()=>[F("Interval voor dubbele uitloop "),i(g)>0?(d(),p("div",qt," Uitlopen met minder dan "+w(i(g))+" minuten ertussen krijgen een boogje ",1)):(d(),p("div",Zt,"Uitlopen met weinig tijd ertussen worden niet gemarkeerd"))]),_:1},8,["modelValue"]),X(b,{modelValue:i(y),"onUpdate:modelValue":l[4]||(l[4]=o=>q(y)?y.value=o:null),modelModifiers:{number:!0},identifier:"longGapInterval",min:"20",max:"80",unit:"min"},{default:L(()=>[F("Interval voor gat tussen uitlopen "),i(y)>0?(d(),p("div",Qt,"Gaten van meer dan "+w(i(y))+" minuten krijgen een stippellijntje ",1)):(d(),p("div",Jt,"Uitlopen met veel tijd ertussen worden niet gemarkeerd"))]),_:1},8,["modelValue"]),X(r,{modelValue:i(h),"onUpdate:modelValue":l[5]||(l[5]=o=>q(h)?h.value=o:null),identifier:"calculatePostCredits"},{default:L(()=>[F(" Post-credits-scènes meerekenen "),i(h)?(d(),p("div",Kt," Bij uitlopen met post-credits-scènes wordt de tijd 'Einde voorstelling' gebruikt voor het berekenen van de tijd tot de volgende uitloop. ")):(d(),p("div",en," Bij alle uitlopen wordt de tijd 'Aftiteling' wordt gebruikt voor het berekenen van de tijd tot de volgende uitloop. "))]),_:1},8,["modelValue"])]),_:1}),X(i(te),{value:"Kolommen"},{default:L(()=>[(d(!0),p(K,null,ne(i(n),(o,m)=>(d(),J(r,{modelValue:i(a)[m],"onUpdate:modelValue":M=>i(a)[m]=M,identifier:m},{default:L(()=>[F(w(t[m].title),1)]),_:2},1032,["modelValue","onUpdate:modelValue","identifier"]))),256))]),_:1})]),_:1}),u("div",tn,[X(V,{onClick:i(B)},{default:L(()=>[F(" Afdrukken")]),_:1},8,["onClick"])])])])],512)):A("",!0)]),X(ke,null,{default:L(()=>[x.value?(d(),J(T,{key:0,class:"dark",x:U.value,y:P.value,onClickOutside:G},{default:L(()=>[u("button",{onClick:l[6]||(l[6]=o=>{i(O).table.at(v.value).preferToiletRound=!N.value.preferToiletRound,G()})},[u("div",{class:z(["check",{empty:!Y.value.at(v.value).preferToiletRound}])},null,2),F(" Toiletronde na deze uitloop ")]),u("button",{onClick:l[7]||(l[7]=o=>{i(s).has(N.value.title)?i(s).delete(N.value.title):i(s).add(N.value.title),G()})},[u("div",{class:z(["check",{empty:!i(s).has(N.value.title)}])},null,2),F(" Post-credits-scène bij "+w(N.value.title),1)])]),_:1},8,["x","y"])):A("",!0)]),_:1})],64)}}},ln=Te(nn,[["__scopeId","data-v-a943966d"]]);export{ln as default};
