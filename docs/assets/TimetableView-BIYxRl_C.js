import{r as U,o as ge,a as be,b as f,c as v,d as ee,u as K,w as Y,_ as te,m as me,e as he,f as l,g as Z,v as ye,h as _e,t as x,i as H,n as z,j as we,k as V,l as $,p as ne,F as Te,q as Ee,B as oe,s as Se,x as O,y as ke,z as De}from"./index-Dh-BnQGr.js";var xe=Object.defineProperty,se=Object.getOwnPropertySymbols,Ie=Object.prototype.hasOwnProperty,Ae=Object.prototype.propertyIsEnumerable,ie=(e,t,o)=>t in e?xe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,le=(e,t)=>{for(var o in t||(t={}))Ie.call(t,o)&&ie(e,o,t[o]);if(se)for(var o of se(t))Ae.call(t,o)&&ie(e,o,t[o]);return e},X=(e,t,o)=>new Promise((i,a)=>{var p=h=>{try{m(o.next(h))}catch(d){a(d)}},y=h=>{try{m(o.throw(h))}catch(d){a(d)}},m=h=>h.done?i(h.value):Promise.resolve(h.value).then(p,y);m((o=o.apply(e,t)).next())});function J(e){return!!e.shadowRoot}let re=!1;function Ce(){if(re)return;class e extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}}customElements.define("vue-to-print-shadow-dom",e),re=!0}const Ne=`
  class VueToPrintShadowDom extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  }
  customElements.define('vue-to-print-shadow-dom', VueToPrintShadowDom);
`;function Me(e){const t=e.createElement("script");t.setAttribute("type","text/javascript"),t.setAttribute("vue-to-print-custom-script","registry-shadow-dom"),t.innerHTML=Ne,e.body.appendChild(t)}const Re=`
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
`;function Ue(e){const t=e.createElement("script");t.setAttribute("type","text/javascript"),t.setAttribute("vue-to-print-custom-script","registry-retrieve-style-sheets-func"),t.innerHTML=Re,e.body.appendChild(t)}const G=new Map;function ae(e){Ce();const t=e.nodeName.toLowerCase(),o=e.shadowRoot.adoptedStyleSheets,i=document.createElement("vue-to-print-shadow-dom");i.setAttribute("original-tag-name",t),G.has(t)||G.set(t,new Set);const a=G.get(t);for(let m=o.length;m--;)a.add(o[m]);const p=i.attributes,y=e.attributes;for(let m=y.length;m--;)p.setNamedItem(y[m].cloneNode());return i}function Pe(){const e=new Map,t=new Map,o=Array.from(G.keys());for(let i=o.length;i--;){const a=[],p=o[i],y=Array.from(G.get(p));for(let m=y.length;m--;){const h=y[m];if(!t.has(h)){let d="";const s=Array.from(h.cssRules);for(let c=s.length;c--;)d+=s[c].cssText;t.set(h,d)}a.push(t.get(h))}e.set(p,a)}return e}function Le(e){const t=e.contentWindow||null;if(!t)throw new Error("Cannot access print window");const o=t.document;if(!o)throw new Error("Cannot access print document");Me(o),Ue(o);const i=Pe();t.retrieveStyleSheets(i)}function de(e){return!!customElements.get(e.nodeName.toLowerCase())}let ce=!1;function je(){if(ce)return;class e extends HTMLElement{constructor(){super()}}customElements.define("vue-to-print-custom-element",e),ce=!0}function ue(e){je();const t=e.nodeName.toLowerCase(),o=document.createElement("vue-to-print-custom-element");o.setAttribute("original-tag-name",t);const i=o.attributes,a=e.attributes;for(let p=a.length;p--;)i.setNamedItem(a[p].cloneNode());return o}function fe(e){return X(this,null,function*(){e.getAttribute("src")&&(e.complete||(yield new Promise((t,o)=>{e.addEventListener("load",t,{once:!0}),e.addEventListener("error",i=>o(i.error),{once:!0})})))})}function Ve(e){return X(this,null,function*(){e.readyState>=2||(yield new Promise((t,o)=>{e.addEventListener("loadeddata",t,{once:!0}),e.addEventListener("error",i=>o(i.error),{once:!0}),e.addEventListener("stalled",()=>o(new Error("Loading video stalled, skipping")),{once:!0})}))})}function $e(e){const t=e.cloneNode(),o=t.getContext("2d");return o&&o.drawImage(e,0,0),t}function Fe(e,t){const o=e.cloneNode();return t.push(fe(o)),o}function Oe(e,t){const o=e.cloneNode();o.preload="auto";const i=o.getAttribute("poster");if(i){const a=new Image;a.src=i,t.push(fe(a))}else t.push(Ve(o));return o}function Be(e){const t=e.cloneNode();switch(e.type){case"checkbox":case"radio":t.checked=e.checked;break;default:t.value=e.value;break}return t}function We(e){const t=e.cloneNode();return t.value=e.value,t}function He(e){const t=e.cloneNode();return t.selected=e.selected,t}const pe=new Map([["canvas",$e],["img",Fe],["video",Oe],["input",Be],["select",We],["option",He]]);function Ge(e){return e.cloneNode()}function Xe(e,t=[]){const o=e.nodeName.toLowerCase();return(pe.has(o)?pe.get(o):Ge)(e,t)}function Ye(e){var t;if(e.nodeName.toLowerCase()==="slot"){const o=e.assignedNodes();return o.length>0?o:Array.from(e.childNodes)}else return Array.from(((t=e.shadowRoot)!=null?t:e).childNodes)}function qe(e){return X(this,null,function*(){const t=new Map,o=[];let i;J(e)?i=ae(e):de(e)?i=ue(e):i=e.cloneNode(),t.set(e,i);const a=[e];for(;a.length;){const p=a.shift(),y=Ye(p);if(y.length<=0)continue;const m=t.get(p),h=J(m)?m.shadowRoot:m;for(let d=0;d<y.length;d++){const s=y[d];let c;J(s)?c=ae(s):de(s)?c=ue(s):c=Xe(s,o),t.set(s,c),a.push(s),h.appendChild(c)}}return yield Promise.all(o),i})}const ze={copyStyles:!0,pageStyle:`
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
    `,removeAfterPrint:!1,suppressErrors:!1};function Ze(e){e=le(le({},ze),e);let t=0,o=[],i=[];const a=s=>{const{onAfterPrint:c,onPrintError:g,print:T,documentTitle:N}=e;setTimeout(()=>{var u,r;if(s.contentWindow)if(s.contentWindow.focus(),T)T(s).then(()=>c==null?void 0:c()).then(()=>h()).catch(n=>{g?g("print",n):d(["An error was thrown by the specified `print` function"])});else{if(s.contentWindow.print){const n=(r=(u=s.contentDocument)==null?void 0:u.title)!=null?r:"",b=s.ownerDocument.title;N&&(s.ownerDocument.title=N,s.contentDocument&&(s.contentDocument.title=N)),s.contentWindow.print(),N&&(s.ownerDocument.title=b,s.contentDocument&&(s.contentDocument.title=n))}else d(["Printing for this browser is not currently possible: the browser does not have a `print` method available for iframes."]);c==null||c(),h()}else d(["Printing failed because the `contentWindow` of the print iframe did not load. This is possibly an error with `vue-to-print`. Please file an issue: https://github.com/gregnb/react-to-print/issues/"])},500)},p=s=>{const{onBeforePrint:c,onPrintError:g}=e;if(c){const T=c();T&&typeof T.then=="function"?T.then(()=>{a(s)}).catch(N=>{g&&g("onBeforePrint",N)}):a(s)}else a(s)},y=()=>{const{onBeforeGetContent:s,onPrintError:c}=e;if(s){const g=s();g&&typeof g.then=="function"?g.then(m).catch(T=>{c&&c("onBeforeGetContent",T)}):m()}else m()},m=()=>X(this,null,function*(){const{bodyClass:s,content:c,copyStyles:g,fonts:T,pageStyle:N,nonce:u}=e,r=c();if(r===void 0){d(["To print a functional component ensure it is wrapped with `React.forwardRef`, and ensure the forwarded ref is used. See the README for an example: https://github.com/gregnb/react-to-print#examples"]);return}if(r===null){d(['There is nothing to print because the "content" prop returned "null". Please ensure "content" is renderable before allowing "vue-to-print" to be called.']);return}const n=document.createElement("iframe");n.width=`${document.documentElement.clientWidth}px`,n.height=`${document.documentElement.clientHeight}px`,n.style.position="absolute",n.style.top=`-${document.documentElement.clientHeight+100}px`,n.style.left=`-${document.documentElement.clientWidth+100}px`,n.id="printWindow",n.srcdoc="<!DOCTYPE html>";const b=r;if(!b){d(['"vue-to-print" could not locate the DOM node corresponding with the `content` prop']);return}const E=yield qe(b),M=document.querySelectorAll("link[rel~='stylesheet']"),P=T?T.length:0;t=M.length+P,o=[],i=[];const S=(k,D)=>{if(o.includes(k)){d(["Tried to mark a resource that has already been handled",k],"debug");return}D?(d(['"vue-to-print" was unable to load a resource but will continue attempting to print the page',...D]),i.push(k)):o.push(k),o.length+i.length===t&&p(n)};n.onload=()=>X(this,null,function*(){var k,D;n.onload=null;const w=n.contentDocument||((k=n.contentWindow)==null?void 0:k.document);if(w){w.body.appendChild(E),T&&((D=n.contentDocument)!=null&&D.fonts&&typeof FontFace<"u"?T.forEach(_=>{const I=new FontFace(_.family,_.source,{weight:_.weight,style:_.style});n.contentDocument.fonts.add(I),I.loaded.then(()=>{S(I)}).catch(Q=>{S(I,["Failed loading the font:",I,"Load error:",Q])})}):(T.forEach(_=>S(_)),d(['"vue-to-print" is not able to load custom fonts because the browser does not support the FontFace API but will continue attempting to print the page'])));const R=typeof N=="function"?N():N;if(typeof R!="string")d([`"vue-to-print" expected a "string" from \`pageStyle\` but received "${typeof R}". Styles from \`pageStyle\` will not be applied.`]);else{const _=w.createElement("style");u&&(_.setAttribute("nonce",u),w.head.setAttribute("nonce",u)),_.appendChild(w.createTextNode(R)),w.head.appendChild(_)}if(s&&w.body.classList.add(...s.split(" ")),g){const _=document.querySelectorAll("style, link[rel~='stylesheet']");for(let I=0,Q=_.length;I<Q;++I){const A=_[I];if(A.tagName.toLowerCase()==="style"){const C=w.createElement(A.tagName),L=A.sheet;if(L){let B="";try{const F=L.cssRules.length;for(let W=0;W<F;++W)typeof L.cssRules[W].cssText=="string"&&(B+=`${L.cssRules[W].cssText}\r
`)}catch{d(["A stylesheet could not be accessed. This is likely due to the stylesheet having cross-origin imports, and many browsers block script access to cross-origin stylesheets. See https://github.com/gregnb/react-to-print/issues/429 for details. You may be able to load the sheet by both marking the stylesheet with the cross `crossorigin` attribute, and setting the `Access-Control-Allow-Origin` header on the server serving the stylesheet. Alternatively, host the stylesheet on your domain to avoid this issue entirely.",A],"warning")}C.setAttribute("id",`vue-to-print-${I}`),u&&C.setAttribute("nonce",u),C.appendChild(w.createTextNode(B)),w.head.appendChild(C)}}else if(A.getAttribute("href"))if(A.hasAttribute("disabled"))d(["`vue-to-print` encountered a <link> tag with a `disabled` attribute and will ignore it. Note that the `disabled` attribute is deprecated, and some browsers ignore it. You should stop using it. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-disabled. The <link> is:",A],"warning"),S(A);else{const C=w.createElement(A.tagName);for(let L=0,B=A.attributes.length;L<B;++L){const F=A.attributes[L];F&&C.setAttribute(F.nodeName,F.nodeValue||"")}C.onload=()=>S(C),C.onerror=(L,B,F,W,ve)=>S(C,["Failed to load",C,"Error:",ve]),u&&C.setAttribute("nonce",u),w.head.appendChild(C)}else d(["`vue-to-print` encountered a <link> tag with an empty `href` attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:",A],"warning"),S(A)}}}Le(n),(t===0||!g)&&p(n)}),h(!0),document.body.appendChild(n)}),h=s=>{const{removeAfterPrint:c}=e;if(s||c){const g=document.getElementById("printWindow");g&&document.body.removeChild(g)}},d=(s,c="error")=>{const{suppressErrors:g}=e;g||(c==="error"?console.error(s):c==="warning"?console.warn(s):c==="debug"&&console.debug(s))};return{handlePrint:y}}const Qe=["data-active"],Je={__name:"DropZone",emits:["files-dropped"],setup(e,{emit:t}){const o=t;let i=U(!1),a=null;function p(){i.value=!0,clearTimeout(a)}function y(){a=setTimeout(()=>{i.value=!1},50)}function m(s){y(),o("files-dropped",[...s.dataTransfer.files])}function h(s){s.preventDefault()}const d=["dragenter","dragover","dragleave","drop"];return ge(()=>{d.forEach(s=>{document.body.addEventListener(s,h)})}),be(()=>{d.forEach(s=>{document.body.removeEventListener(s,h)})}),(s,c)=>(f(),v("div",{"data-active":K(i),onDragenter:Y(p,["prevent"]),onDragover:Y(p,["prevent"]),onDragleave:Y(y,["prevent"]),onDrop:Y(m,["prevent"])},[ee(s.$slots,"default",{dropZoneActive:K(i)})],40,Qe))}},Ke=["for"],et={class:"title"},tt=["id"],nt={__name:"InputCheckbox",props:me(["identifier"],{modelValue:{},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const t=he(e,"modelValue");return(o,i)=>(f(),v("label",{class:"input-slider",for:e.identifier},[l("div",et,[ee(o.$slots,"default",{},void 0,!0)]),Z(l("input",{type:"checkbox",name:"",id:e.identifier,"onUpdate:modelValue":i[0]||(i[0]=a=>t.value=a)},null,8,tt),[[ye,t.value]])],8,Ke))}},ot=te(nt,[["__scopeId","data-v-980db91a"]]),st=["for"],it={class:"title"},lt=["id"],rt={key:0,class:"unit"},at={__name:"InputNumber",props:me(["unit","identifier"],{modelValue:{},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const t=he(e,"modelValue");return(o,i)=>(f(),v("label",{class:"input-slider",for:e.identifier},[l("div",it,[ee(o.$slots,"default",{},void 0,!0)]),l("div",{class:z(["input",{"has-unit":!!e.unit}])},[Z(l("input",{type:"number",inputmode:"numeric",pattern:"[0-9]+",name:"",id:e.identifier,"onUpdate:modelValue":i[0]||(i[0]=a=>t.value=a)},null,8,lt),[[_e,t.value,void 0,{number:!0}]]),e.unit?(f(),v("span",rt,x(e.unit),1)):H("",!0)],2)],8,st))}},q=te(at,[["__scopeId","data-v-5922edae"]]),j=e=>(ke("data-v-3a03b46e"),e=e(),De(),e),dt={class:"container dark"},ct={id:"upload"},ut=j(()=>l("h2",null,"Bestand uploaden",-1)),pt={key:0},mt=j(()=>l("div",null,"Laat los om te uploaden",-1)),ht=j(()=>l("div",{class:"small"},"CSV-bestand",-1)),ft=[mt,ht],vt={key:1},gt=j(()=>l("div",null,"Sleep een bestand hierheen",-1)),bt=j(()=>l("div",{class:"small"},"CSV-bestand",-1)),yt=[gt,bt],_t=j(()=>l("h2",null,"Tijdenlijstje bewerken",-1)),wt={class:"flex",style:{"flex-wrap":"wrap"}},Tt={spellcheck:"false"},Et=j(()=>l("colgroup",null,[l("col",{span:"1",style:{width:"0"}}),l("col",{span:"1",style:{width:"0"}}),l("col",{span:"1",style:{width:"16%"}}),l("col",{span:"1",style:{width:"28%"}}),l("col",{span:"1",style:{width:"50%"}}),l("col",{span:"1",style:{width:"0"}})],-1)),St=j(()=>l("thead",null,[l("td",{nowrap:"",contenteditable:"",width:"1px"},"Zaal"),l("td",{nowrap:"",contenteditable:""},"Inloop"),l("td",{nowrap:"",contenteditable:""}),l("td",{nowrap:"",contenteditable:""},"Aftiteling"),l("td",{nowrap:"",contenteditable:""},"Film"),l("td",{nowrap:"",contenteditable:""})],-1)),kt={nowrap:"",contenteditable:""},Dt={nowrap:"",contenteditable:""},xt=["onDblclick"],It={nowrap:""},At={key:0,class:"double-usherout"},Ct={key:1,class:"long-gap"},Nt={key:2,class:"plf-overlap"},Mt={key:3},Rt={key:0,nowrap:"",contenteditable:""},Ut={style:{float:"right"}},Pt={key:1,nowrap:"",contenteditable:""},Lt=j(()=>l("div",{class:"custom-content",contenteditable:""},null,-1)),jt={class:"footer"},Vt={id:"parameters",style:{display:"flex","flex-direction":"column",flex:"229px 1 1"}},$t={key:0,class:"small"},Ft={key:1,class:"small"},Ot={key:0,class:"small"},Bt={key:1,class:"small"},Wt={key:0,class:"small"},Ht={key:1,class:"small"},Gt={key:0,class:"small"},Xt={key:1,class:"small"},Yt={class:"buttons",style:{display:"flex","flex-direction":"column",gap:"16px","align-items":"stretch","margin-top":"auto",position:"sticky",bottom:"16px","padding-inline":"16px"}},qt={__name:"TimetableView",setup(e){const t=U(!0),o=U(16),i=U(16),a=U(10),p=U(35),y=U(null),m=U(null),h=U(null),d=U([]),s=we(()=>{let u=d.value.map((r,n)=>{var S,k,D,w,R;let b=(D=(k=(S=r.PLAYLIST)==null?void 0:S.match(/(\s((4DX)|(ATMOS)|(3D)|(Music)|(\([A-Z]+\))))+/))==null?void 0:k[0])==null?void 0:D.slice(1),E=(w=r.PLAYLIST)==null?void 0:w.replace(b,""),M=d.value.filter(_=>{var I;return(I=_.AUDITORIUM)==null?void 0:I.includes("4DX")}).some(_=>g(_.SCHEDULED_TIME,r.CREDITS_TIME)>=o.value*-6e4&&g(_.SCHEDULED_TIME,r.CREDITS_TIME)<=i.value*6e4),P=g(r.CREDITS_TIME,(R=d.value.at(n+1))==null?void 0:R.CREDITS_TIME);return{...r,title:E,extra:b,overlapWithPlf:M,timeToNextUsherout:P}});return u.filter(r=>{var n;return(n=r.AUDITORIUM)==null?void 0:n.includes("4DX")}).slice(1).forEach(r=>{let n;for(let b=0;b<u.length;b++){const E=u[b];if(g(r.SCHEDULED_TIME,E.CREDITS_TIME)>0){n=b-1;break}}u.at(n).isNearPlf=!0}),u||[]});async function c(u){var P;if(((P=u==null?void 0:u[0])==null?void 0:P.type)!=="text/csv")return;const n=(await u[0].text()).split(`
`);let b=[];const E=n[0].split(",");for(var M=0;M<n.length;M++){const S=n[M].split(",");let k={};for(let D=0;D<S.length;D++)k[E[D].trim()]=S[D].trim();b.push(k)}d.value=b,Se(()=>{h.value.scrollIntoView({behavior:"smooth"})})}function g(u,r){function n(S){const[k,D,w]=S.split(":").map(Number),R=new Date;return new Date(R.getFullYear(),R.getMonth(),R.getDate(),k,D,w)}if(!u||!r)return;const b=n(u),E=n(r),M=E-b;E.setDate(E.getDate()+1);const P=E-b;return Math.abs(M)<Math.abs(P)?M:P}const{handlePrint:T}=Ze({content:()=>m.value,documentTitle:"Tijdenlijstje"});function N(u){console.log(s.value[u].preferToiletRound),s.value[u].preferToiletRound=!s.value[u].preferToiletRound,console.log(s.value[u].preferToiletRound)}return(u,r)=>(f(),v("div",dt,[l("section",ct,[ut,V(Je,{id:"drop-zone",onFilesDropped:c,onClick:r[0]||(r[0]=n=>y.value.click()),style:{cursor:"pointer"}},{default:$(({dropZoneActive:n})=>[n?(f(),v("div",pt,ft)):(f(),v("div",vt,yt)),V(oe,{"data-active":n},{default:$(()=>[O("Bladeren...")]),_:2},1032,["data-active"])]),_:1}),l("input",{type:"file",ref_key:"fileInput",ref:y,accept:"text/csv",style:{display:"none"},onChange:r[1]||(r[1]=n=>c(n.target.files))},null,544)]),Z(l("section",{id:"edit",ref_key:"editSection",ref:h},[_t,l("div",wt,[l("div",{id:"print-component",ref_key:"printComponent",ref:m},[l("table",Tt,[Et,St,(f(!0),v(Te,null,Ee(s.value,(n,b)=>{var E;return Z((f(),v("tr",{class:z({italic:(E=n.AUDITORIUM)==null?void 0:E.includes("4DX"),bold:n.FEATURE_RATING==="16"||n.FEATURE_RATING==="18"})},[l("td",kt,x(n.AUDITORIUM==="PULR 8"?"RT":n.AUDITORIUM.replace(/^\w+\s/,"")),1),l("td",Dt,x(n.SCHEDULED_TIME.replace(/(:00)$/,"")),1),l("td",{nowrap:"",contenteditable:"",class:z(["special-cell",{"toilet-round":!!n.preferToiletRound}]),onDblclick:M=>N(b)},x(n.isNearPlf?"4DX":" "),43,xt),l("td",It,[n.timeToNextUsherout<=a.value*6e4?(f(),v("div",At)):H("",!0),n.timeToNextUsherout>=p.value*6e4&&p.value>0?(f(),v("div",Ct)):H("",!0),n.overlapWithPlf?(f(),v("div",Nt)):H("",!0),l("span",null,x(n.CREDITS_TIME),1),n.hasPostCredits?(f(),v("span",Mt,"⋆")):H("",!0)]),t.value?(f(),v("td",Rt,[l("span",null,x(n.title),1),l("span",Ut,x(n.extra),1)])):(f(),v("td",Pt,x(n.PLAYLIST),1)),l("td",{nowrap:"",contenteditable:"",style:{"text-align":"end"},class:z({translucent:n.FEATURE_RATING!=="16"&&n.FEATURE_RATING!=="18"})},x(n.FEATURE_RATING),3)],2)),[[ne,b!=0]])}),256))]),Lt,l("div",jt," gegenereerd op "+x(new Date().toLocaleDateString("nl-NL",{weekday:"short",day:"numeric",month:"short",year:"numeric"}))+" om "+x(new Date().toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"}))+" • Pathé Utrecht Leidsche Rijn • Quinten Althues ",1)],512),l("div",Vt,[V(ot,{modelValue:t.value,"onUpdate:modelValue":r[2]||(r[2]=n=>t.value=n),identifier:"splitExtra"},{default:$(()=>[O("Extra informatie scheiden van filmtitel ")]),_:1},8,["modelValue"]),V(q,{modelValue:o.value,"onUpdate:modelValue":r[3]||(r[3]=n=>o.value=n),modelModifiers:{number:!0},identifier:"plfTimeBefore",min:"0",max:"30",unit:"min"},{default:$(()=>[O(" Tijd vóór inloop 4DX "),o.value>0?(f(),v("div",$t,"Uitlopen vanaf "+x(o.value)+" minuten voor een 4DX-inloop krijgen een streeplijntje",1)):(f(),v("div",Ft,"Uitlopen vlak voor een 4DX-inloop worden niet gemarkeerd"))]),_:1},8,["modelValue"]),V(q,{modelValue:i.value,"onUpdate:modelValue":r[4]||(r[4]=n=>i.value=n),modelModifiers:{number:!0},identifier:"plfTimeAfter",min:"0",max:"30",unit:"min"},{default:$(()=>[O(" Tijd na inloop 4DX "),i.value>0?(f(),v("div",Ot,"Uitlopen tot "+x(i.value)+" minuten na een 4DX-inloop krijgen een streeplijntje",1)):(f(),v("div",Bt,"Uitlopen vlak na een 4DX-inloop worden niet gemarkeerd"))]),_:1},8,["modelValue"]),V(q,{modelValue:a.value,"onUpdate:modelValue":r[5]||(r[5]=n=>a.value=n),modelModifiers:{number:!0},identifier:"shortGapInterval",min:"0",max:"20",unit:"min"},{default:$(()=>[O("Interval voor dubbele uitloop "),a.value>0?(f(),v("div",Wt,"Uitlopen met minder dan "+x(a.value)+" minuten ertussen krijgen een boogje",1)):(f(),v("div",Ht,"Uitlopen met weinig tijd ertussen worden niet gemarkeerd"))]),_:1},8,["modelValue"]),V(q,{modelValue:p.value,"onUpdate:modelValue":r[6]||(r[6]=n=>p.value=n),modelModifiers:{number:!0},identifier:"longGapInterval",min:"20",max:"80",unit:"min"},{default:$(()=>[O("Interval voor gat tussen uitlopen "),p.value>0?(f(),v("div",Gt,"Gaten van meer dan "+x(p.value)+" minuten krijgen een stippellijntje ",1)):(f(),v("div",Xt,"Uitlopen met veel tijd ertussen worden niet gemarkeerd"))]),_:1},8,["modelValue"]),l("div",Yt,[V(oe,{onClick:K(T)},{default:$(()=>[O(" Afdrukken")]),_:1},8,["onClick"])])])])],512),[[ne,d.value.length>0]])]))}},Zt=te(qt,[["__scopeId","data-v-3a03b46e"]]);export{Zt as default};
