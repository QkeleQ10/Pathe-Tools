import{r as N,o as be,a as ye,b as v,c as g,d as ee,u as Q,w as Y,_ as te,e as fe,f as u,g as z,v as _e,m as we,h as Ee,t as D,i as H,n as K,j as Te,k as j,l as L,p as ne,F as oe,q as se,B as le,s as Se,x as O,y as ke,z as De}from"./index-DoSAa-3c.js";var xe=Object.defineProperty,ie=Object.getOwnPropertySymbols,Ie=Object.prototype.hasOwnProperty,Ae=Object.prototype.propertyIsEnumerable,re=(e,t,n)=>t in e?xe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,ae=(e,t)=>{for(var n in t||(t={}))Ie.call(t,n)&&re(e,n,t[n]);if(ie)for(var n of ie(t))Ae.call(t,n)&&re(e,n,t[n]);return e},G=(e,t,n)=>new Promise((l,a)=>{var p=f=>{try{m(n.next(f))}catch(d){a(d)}},y=f=>{try{m(n.throw(f))}catch(d){a(d)}},m=f=>f.done?l(f.value):Promise.resolve(f.value).then(p,y);m((n=n.apply(e,t)).next())});function J(e){return!!e.shadowRoot}let de=!1;function Ce(){if(de)return;class e extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}}customElements.define("vue-to-print-shadow-dom",e),de=!0}const Me=`
  class VueToPrintShadowDom extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  }
  customElements.define('vue-to-print-shadow-dom', VueToPrintShadowDom);
`;function Ne(e){const t=e.createElement("script");t.setAttribute("type","text/javascript"),t.setAttribute("vue-to-print-custom-script","registry-shadow-dom"),t.innerHTML=Me,e.body.appendChild(t)}const Ue=`
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
`;function Pe(e){const t=e.createElement("script");t.setAttribute("type","text/javascript"),t.setAttribute("vue-to-print-custom-script","registry-retrieve-style-sheets-func"),t.innerHTML=Ue,e.body.appendChild(t)}const X=new Map;function ce(e){Ce();const t=e.nodeName.toLowerCase(),n=e.shadowRoot.adoptedStyleSheets,l=document.createElement("vue-to-print-shadow-dom");l.setAttribute("original-tag-name",t),X.has(t)||X.set(t,new Set);const a=X.get(t);for(let m=n.length;m--;)a.add(n[m]);const p=l.attributes,y=e.attributes;for(let m=y.length;m--;)p.setNamedItem(y[m].cloneNode());return l}function Re(){const e=new Map,t=new Map,n=Array.from(X.keys());for(let l=n.length;l--;){const a=[],p=n[l],y=Array.from(X.get(p));for(let m=y.length;m--;){const f=y[m];if(!t.has(f)){let d="";const s=Array.from(f.cssRules);for(let c=s.length;c--;)d+=s[c].cssText;t.set(f,d)}a.push(t.get(f))}e.set(p,a)}return e}function Ve(e){const t=e.contentWindow||null;if(!t)throw new Error("Cannot access print window");const n=t.document;if(!n)throw new Error("Cannot access print document");Ne(n),Pe(n);const l=Re();t.retrieveStyleSheets(l)}function ue(e){return!!customElements.get(e.nodeName.toLowerCase())}let pe=!1;function je(){if(pe)return;class e extends HTMLElement{constructor(){super()}}customElements.define("vue-to-print-custom-element",e),pe=!0}function me(e){je();const t=e.nodeName.toLowerCase(),n=document.createElement("vue-to-print-custom-element");n.setAttribute("original-tag-name",t);const l=n.attributes,a=e.attributes;for(let p=a.length;p--;)l.setNamedItem(a[p].cloneNode());return n}function ve(e){return G(this,null,function*(){e.getAttribute("src")&&(e.complete||(yield new Promise((t,n)=>{e.addEventListener("load",t,{once:!0}),e.addEventListener("error",l=>n(l.error),{once:!0})})))})}function Le(e){return G(this,null,function*(){e.readyState>=2||(yield new Promise((t,n)=>{e.addEventListener("loadeddata",t,{once:!0}),e.addEventListener("error",l=>n(l.error),{once:!0}),e.addEventListener("stalled",()=>n(new Error("Loading video stalled, skipping")),{once:!0})}))})}function $e(e){const t=e.cloneNode(),n=t.getContext("2d");return n&&n.drawImage(e,0,0),t}function Fe(e,t){const n=e.cloneNode();return t.push(ve(n)),n}function Oe(e,t){const n=e.cloneNode();n.preload="auto";const l=n.getAttribute("poster");if(l){const a=new Image;a.src=l,t.push(ve(a))}else t.push(Le(n));return n}function We(e){const t=e.cloneNode();switch(e.type){case"checkbox":case"radio":t.checked=e.checked;break;default:t.value=e.value;break}return t}function Be(e){const t=e.cloneNode();return t.value=e.value,t}function He(e){const t=e.cloneNode();return t.selected=e.selected,t}const he=new Map([["canvas",$e],["img",Fe],["video",Oe],["input",We],["select",Be],["option",He]]);function Xe(e){return e.cloneNode()}function Ge(e,t=[]){const n=e.nodeName.toLowerCase();return(he.has(n)?he.get(n):Xe)(e,t)}function Ye(e){var t;if(e.nodeName.toLowerCase()==="slot"){const n=e.assignedNodes();return n.length>0?n:Array.from(e.childNodes)}else return Array.from(((t=e.shadowRoot)!=null?t:e).childNodes)}function qe(e){return G(this,null,function*(){const t=new Map,n=[];let l;J(e)?l=ce(e):ue(e)?l=me(e):l=e.cloneNode(),t.set(e,l);const a=[e];for(;a.length;){const p=a.shift(),y=Ye(p);if(y.length<=0)continue;const m=t.get(p),f=J(m)?m.shadowRoot:m;for(let d=0;d<y.length;d++){const s=y[d];let c;J(s)?c=ce(s):ue(s)?c=me(s):c=Ge(s,n),t.set(s,c),a.push(s),f.appendChild(c)}}return yield Promise.all(n),l})}const ze={copyStyles:!0,pageStyle:`
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
    `,removeAfterPrint:!1,suppressErrors:!1};function Ze(e){e=ae(ae({},ze),e);let t=0,n=[],l=[];const a=s=>{const{onAfterPrint:c,onPrintError:b,print:T,documentTitle:h}=e;setTimeout(()=>{var i,o;if(s.contentWindow)if(s.contentWindow.focus(),T)T(s).then(()=>c==null?void 0:c()).then(()=>f()).catch(r=>{b?b("print",r):d(["An error was thrown by the specified `print` function"])});else{if(s.contentWindow.print){const r=(o=(i=s.contentDocument)==null?void 0:i.title)!=null?o:"",w=s.ownerDocument.title;h&&(s.ownerDocument.title=h,s.contentDocument&&(s.contentDocument.title=h)),s.contentWindow.print(),h&&(s.ownerDocument.title=w,s.contentDocument&&(s.contentDocument.title=r))}else d(["Printing for this browser is not currently possible: the browser does not have a `print` method available for iframes."]);c==null||c(),f()}else d(["Printing failed because the `contentWindow` of the print iframe did not load. This is possibly an error with `vue-to-print`. Please file an issue: https://github.com/gregnb/react-to-print/issues/"])},500)},p=s=>{const{onBeforePrint:c,onPrintError:b}=e;if(c){const T=c();T&&typeof T.then=="function"?T.then(()=>{a(s)}).catch(h=>{b&&b("onBeforePrint",h)}):a(s)}else a(s)},y=()=>{const{onBeforeGetContent:s,onPrintError:c}=e;if(s){const b=s();b&&typeof b.then=="function"?b.then(m).catch(T=>{c&&c("onBeforeGetContent",T)}):m()}else m()},m=()=>G(this,null,function*(){const{bodyClass:s,content:c,copyStyles:b,fonts:T,pageStyle:h,nonce:i}=e,o=c();if(o===void 0){d(["To print a functional component ensure it is wrapped with `React.forwardRef`, and ensure the forwarded ref is used. See the README for an example: https://github.com/gregnb/react-to-print#examples"]);return}if(o===null){d(['There is nothing to print because the "content" prop returned "null". Please ensure "content" is renderable before allowing "vue-to-print" to be called.']);return}const r=document.createElement("iframe");r.width=`${document.documentElement.clientWidth}px`,r.height=`${document.documentElement.clientHeight}px`,r.style.position="absolute",r.style.top=`-${document.documentElement.clientHeight+100}px`,r.style.left=`-${document.documentElement.clientWidth+100}px`,r.id="printWindow",r.srcdoc="<!DOCTYPE html>";const w=o;if(!w){d(['"vue-to-print" could not locate the DOM node corresponding with the `content` prop']);return}const A=yield qe(w),U=document.querySelectorAll("link[rel~='stylesheet']"),P=T?T.length:0;t=U.length+P,n=[],l=[];const k=(E,C)=>{if(n.includes(E)){d(["Tried to mark a resource that has already been handled",E],"debug");return}C?(d(['"vue-to-print" was unable to load a resource but will continue attempting to print the page',...C]),l.push(E)):n.push(E),n.length+l.length===t&&p(r)};r.onload=()=>G(this,null,function*(){var E,C;r.onload=null;const _=r.contentDocument||((E=r.contentWindow)==null?void 0:E.document);if(_){_.body.appendChild(A),T&&((C=r.contentDocument)!=null&&C.fonts&&typeof FontFace<"u"?T.forEach(S=>{const M=new FontFace(S.family,S.source,{weight:S.weight,style:S.style});r.contentDocument.fonts.add(M),M.loaded.then(()=>{k(M)}).catch(Z=>{k(M,["Failed loading the font:",M,"Load error:",Z])})}):(T.forEach(S=>k(S)),d(['"vue-to-print" is not able to load custom fonts because the browser does not support the FontFace API but will continue attempting to print the page'])));const V=typeof h=="function"?h():h;if(typeof V!="string")d([`"vue-to-print" expected a "string" from \`pageStyle\` but received "${typeof V}". Styles from \`pageStyle\` will not be applied.`]);else{const S=_.createElement("style");i&&(S.setAttribute("nonce",i),_.head.setAttribute("nonce",i)),S.appendChild(_.createTextNode(V)),_.head.appendChild(S)}if(s&&_.body.classList.add(...s.split(" ")),b){const S=document.querySelectorAll("style, link[rel~='stylesheet']");for(let M=0,Z=S.length;M<Z;++M){const x=S[M];if(x.tagName.toLowerCase()==="style"){const I=_.createElement(x.tagName),R=x.sheet;if(R){let W="";try{const F=R.cssRules.length;for(let B=0;B<F;++B)typeof R.cssRules[B].cssText=="string"&&(W+=`${R.cssRules[B].cssText}\r
`)}catch{d(["A stylesheet could not be accessed. This is likely due to the stylesheet having cross-origin imports, and many browsers block script access to cross-origin stylesheets. See https://github.com/gregnb/react-to-print/issues/429 for details. You may be able to load the sheet by both marking the stylesheet with the cross `crossorigin` attribute, and setting the `Access-Control-Allow-Origin` header on the server serving the stylesheet. Alternatively, host the stylesheet on your domain to avoid this issue entirely.",x],"warning")}I.setAttribute("id",`vue-to-print-${M}`),i&&I.setAttribute("nonce",i),I.appendChild(_.createTextNode(W)),_.head.appendChild(I)}}else if(x.getAttribute("href"))if(x.hasAttribute("disabled"))d(["`vue-to-print` encountered a <link> tag with a `disabled` attribute and will ignore it. Note that the `disabled` attribute is deprecated, and some browsers ignore it. You should stop using it. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-disabled. The <link> is:",x],"warning"),k(x);else{const I=_.createElement(x.tagName);for(let R=0,W=x.attributes.length;R<W;++R){const F=x.attributes[R];F&&I.setAttribute(F.nodeName,F.nodeValue||"")}I.onload=()=>k(I),I.onerror=(R,W,F,B,ge)=>k(I,["Failed to load",I,"Error:",ge]),i&&I.setAttribute("nonce",i),_.head.appendChild(I)}else d(["`vue-to-print` encountered a <link> tag with an empty `href` attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:",x],"warning"),k(x)}}}Ve(r),(t===0||!b)&&p(r)}),f(!0),document.body.appendChild(r)}),f=s=>{const{removeAfterPrint:c}=e;if(s||c){const b=document.getElementById("printWindow");b&&document.body.removeChild(b)}},d=(s,c="error")=>{const{suppressErrors:b}=e;b||(c==="error"?console.error(s):c==="warning"?console.warn(s):c==="debug"&&console.debug(s))};return{handlePrint:y}}const Je=["data-active"],Qe={__name:"DropZone",emits:["files-dropped"],setup(e,{emit:t}){const n=t;let l=N(!1),a=null;function p(){l.value=!0,clearTimeout(a)}function y(){a=setTimeout(()=>{l.value=!1},50)}function m(s){y(),n("files-dropped",[...s.dataTransfer.files])}function f(s){s.preventDefault()}const d=["dragenter","dragover","dragleave","drop"];return be(()=>{d.forEach(s=>{document.body.addEventListener(s,f)})}),ye(()=>{d.forEach(s=>{document.body.removeEventListener(s,f)})}),(s,c)=>(v(),g("div",{"data-active":Q(l),onDragenter:Y(p,["prevent"]),onDragover:Y(p,["prevent"]),onDragleave:Y(y,["prevent"]),onDrop:Y(m,["prevent"])},[ee(s.$slots,"default",{dropZoneActive:Q(l)})],40,Je))}},Ke=["for"],et={class:"title"},tt=["id"],nt={__name:"InputCheckbox",props:{modelValue:{},modelModifiers:{}},emits:["update:modelValue"],setup(e){const t=fe(e,"modelValue");return(n,l)=>(v(),g("label",{class:"input-slider",for:this._uid},[u("div",et,[ee(n.$slots,"default",{},void 0,!0)]),z(u("input",{type:"checkbox",name:"",id:this._uid,"onUpdate:modelValue":l[0]||(l[0]=a=>t.value=a)},null,8,tt),[[_e,t.value]])],8,Ke))}},ot=te(nt,[["__scopeId","data-v-92ca4ada"]]),st=["for"],lt={class:"title"},it=["id"],rt={key:0,class:"unit"},at={__name:"InputNumber",props:we(["unit"],{modelValue:{},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const t=fe(e,"modelValue");return(n,l)=>(v(),g("label",{class:"input-slider",for:this._uid},[u("div",lt,[ee(n.$slots,"default",{},void 0,!0)]),u("div",{class:K(["input",{"has-unit":!!e.unit}])},[z(u("input",{type:"number",inputmode:"numeric",pattern:"[0-9]+",name:"",id:this._uid,"onUpdate:modelValue":l[0]||(l[0]=a=>t.value=a)},null,8,it),[[Ee,t.value,void 0,{number:!0}]]),e.unit?(v(),g("span",rt,D(e.unit),1)):H("",!0)],2)],8,st))}},q=te(at,[["__scopeId","data-v-8ecae46c"]]),$=e=>(ke("data-v-d22c1624"),e=e(),De(),e),dt={class:"container dark"},ct={id:"upload"},ut=$(()=>u("h2",null,"Bestand uploaden",-1)),pt={key:0},mt=$(()=>u("div",null,"Laat los om te uploaden",-1)),ht=$(()=>u("div",{class:"small"},"CSV-bestand",-1)),ft=[mt,ht],vt={key:1},gt=$(()=>u("div",null,"Sleep een bestand hierheen",-1)),bt=$(()=>u("div",{class:"small"},"CSV-bestand",-1)),yt=[gt,bt],_t=$(()=>u("h2",null,"Tijdenlijstje bewerken",-1)),wt={class:"flex",style:{"flex-wrap":"wrap"}},Et={spellcheck:"false"},Tt=$(()=>u("colgroup",null,null,-1)),St={nowrap:"",contenteditable:""},kt={nowrap:"",contenteditable:"",width:"1px"},Dt={nowrap:"",contenteditable:""},xt={nowrap:"",contenteditable:"",width:"13%",class:"special-cell"},It={nowrap:"",width:"19%"},At={key:0,class:"double-usherout"},Ct={key:1,class:"long-gap"},Mt={key:2,class:"plf-overlap"},Nt={key:3},Ut={key:0,nowrap:"",contenteditable:""},Pt={style:{float:"right"}},Rt={key:1,nowrap:"",contenteditable:""},Vt=$(()=>u("div",{class:"custom-content",contenteditable:""},null,-1)),jt={id:"parameters",style:{display:"flex","flex-direction":"column",flex:"229px 1 1"}},Lt={key:0,class:"small"},$t={key:1,class:"small"},Ft={key:0,class:"small"},Ot={key:1,class:"small"},Wt={key:0,class:"small"},Bt={key:1,class:"small"},Ht={key:0,class:"small"},Xt={key:1,class:"small"},Gt={__name:"TimetableView",setup(e){const t=N(!0),n=N(16),l=N(16),a=N(10),p=N(35),y=N(null),m=N(null),f=N(null),d=N([]),s=Te(()=>{let h=d.value.map((i,o)=>{var P,k,E,C,_;let r=(E=(k=(P=i.PLAYLIST)==null?void 0:P.match(/(\s((4DX)|(ATMOS)|(3D)|(Music)|(\([A-Z]+\))))+/))==null?void 0:k[0])==null?void 0:E.slice(1),w=(C=i.PLAYLIST)==null?void 0:C.replace(r,""),A=d.value.filter(V=>{var S;return(S=V.AUDITORIUM)==null?void 0:S.includes("4DX")}).some(V=>b(V.SCHEDULED_TIME,i.CREDITS_TIME)>=n.value*-6e4&&b(V.SCHEDULED_TIME,i.CREDITS_TIME)<=l.value*6e4),U=b(i.CREDITS_TIME,(_=d.value.at(o+1))==null?void 0:_.CREDITS_TIME);return{...i,title:w,extra:r,overlapWithPlf:A,timeToNextUsherout:U}});return h.filter(i=>{var o;return(o=i.AUDITORIUM)==null?void 0:o.includes("4DX")}).slice(1).forEach(i=>{let o;for(let r=0;r<h.length;r++){const w=h[r];if(b(i.SCHEDULED_TIME,w.CREDITS_TIME)>0){o=r-1;break}}h.at(o).isNearPlf=!0}),h||[]});async function c(h){var U;if(((U=h==null?void 0:h[0])==null?void 0:U.type)!=="text/csv")return;const o=(await h[0].text()).split(`
`);let r=[];const w=o[0].split(",");for(var A=0;A<o.length;A++){const P=o[A].split(",");let k={};for(let E=0;E<P.length;E++)k[w[E].trim()]=P[E].trim();r.push(k)}d.value=r,Se(()=>{f.value.scrollIntoView({behavior:"smooth"})})}function b(h,i){function o(P){const[k,E,C]=P.split(":").map(Number),_=new Date;return new Date(_.getFullYear(),_.getMonth(),_.getDate(),k,E,C)}if(!h||!i)return;const r=o(h),w=o(i),A=w-r;w.setDate(w.getDate()+1);const U=w-r;return Math.abs(A)<Math.abs(U)?A:U}const{handlePrint:T}=Ze({content:()=>m.value,documentTitle:"Tijdenlijstje"});return(h,i)=>(v(),g("div",dt,[u("section",ct,[ut,j(Qe,{id:"drop-zone",onFilesDropped:c,onClick:i[0]||(i[0]=o=>y.value.click()),style:{cursor:"pointer"}},{default:L(({dropZoneActive:o})=>[o?(v(),g("div",pt,ft)):(v(),g("div",vt,yt)),j(le,{"data-active":o},{default:L(()=>[O("Bladeren...")]),_:2},1032,["data-active"])]),_:1}),u("input",{type:"file",ref_key:"fileInput",ref:y,accept:"text/csv",style:{display:"none"},onChange:i[1]||(i[1]=o=>c(o.target.files))},null,544)]),z(u("section",{id:"edit",ref_key:"editSection",ref:f},[_t,u("div",wt,[u("div",{id:"printComponent",ref_key:"printComponent",ref:m},[u("table",Et,[Tt,u("thead",null,[(v(),g(oe,null,se(["Zaal","Inloop","","Aftiteling","Film",""],o=>u("td",St,D(o),1)),64))]),(v(!0),g(oe,null,se(s.value,(o,r)=>{var w;return z((v(),g("tr",{class:K({italic:(w=o.AUDITORIUM)==null?void 0:w.includes("4DX"),bold:o.FEATURE_RATING==="16"||o.FEATURE_RATING==="18"})},[u("td",kt,D(o.AUDITORIUM==="PULR 8"?"RT":o.AUDITORIUM.replace(/^\w+\s/,"")),1),u("td",Dt,D(o.SCHEDULED_TIME.replace(/(:00)$/,"")),1),u("td",xt,D(o.isNearPlf?"4DX":" "),1),u("td",It,[o.timeToNextUsherout<=a.value*6e4?(v(),g("div",At)):H("",!0),o.timeToNextUsherout>=p.value*6e4&&p.value>0?(v(),g("div",Ct)):H("",!0),o.overlapWithPlf?(v(),g("div",Mt)):H("",!0),u("span",null,D(o.CREDITS_TIME),1),o.hasPostCredits?(v(),g("span",Nt,"⋆")):H("",!0)]),t.value?(v(),g("td",Ut,[u("span",null,D(o.title),1),u("span",Pt,D(o.extra),1)])):(v(),g("td",Rt,D(o.PLAYLIST),1)),u("td",{nowrap:"",contenteditable:"",width:"1px",style:{"text-align":"end"},class:K({translucent:o.FEATURE_RATING!=="16"&&o.FEATURE_RATING!=="18"})},D(o.FEATURE_RATING),3)],2)),[[ne,r!=0]])}),256))]),Vt],512),u("div",jt,[j(ot,{modelValue:t.value,"onUpdate:modelValue":i[2]||(i[2]=o=>t.value=o)},{default:L(()=>[O("Extra informatie scheiden van filmtitel")]),_:1},8,["modelValue"]),j(q,{modelValue:n.value,"onUpdate:modelValue":i[3]||(i[3]=o=>n.value=o),modelModifiers:{number:!0},min:"0",max:"30",unit:"min"},{default:L(()=>[O("Tijd vóór inloop 4DX "),n.value>0?(v(),g("div",Lt,"Uitlopen vanaf "+D(n.value)+" minuten voor een 4DX-inloop krijgen een streeplijntje",1)):(v(),g("div",$t,"Uitlopen vlak voor een 4DX-inloop worden niet gemarkeerd"))]),_:1},8,["modelValue"]),j(q,{modelValue:l.value,"onUpdate:modelValue":i[4]||(i[4]=o=>l.value=o),modelModifiers:{number:!0},min:"0",max:"30",unit:"min"},{default:L(()=>[O("Tijd na inloop 4DX "),l.value>0?(v(),g("div",Ft,"Uitlopen tot "+D(l.value)+" minuten na een 4DX-inloop krijgen een streeplijntje",1)):(v(),g("div",Ot,"Uitlopen vlak na een 4DX-inloop worden niet gemarkeerd"))]),_:1},8,["modelValue"]),j(q,{modelValue:a.value,"onUpdate:modelValue":i[5]||(i[5]=o=>a.value=o),modelModifiers:{number:!0},min:"0",max:"20",unit:"min"},{default:L(()=>[O("Interval voor dubbele uitloop "),a.value>0?(v(),g("div",Wt,"Uitlopen met minder dan "+D(a.value)+" minuten ertussen krijgen een boogje",1)):(v(),g("div",Bt,"Uitlopen met weinig tijd ertussen worden niet gemarkeerd"))]),_:1},8,["modelValue"]),j(q,{modelValue:p.value,"onUpdate:modelValue":i[6]||(i[6]=o=>p.value=o),modelModifiers:{number:!0},min:"20",max:"80",unit:"min"},{default:L(()=>[O("Interval voor gat tussen uitlopen "),p.value>0?(v(),g("div",Ht,"Gaten van meer dan "+D(p.value)+" minuten krijgen een stippellijntje ",1)):(v(),g("div",Xt,"Uitlopen met veel tijd ertussen worden niet gemarkeerd"))]),_:1},8,["modelValue"]),j(le,{onClick:Q(T),style:{"margin-top":"auto",position:"sticky",bottom:"16px"}},{default:L(()=>[O(" Afdrukken")]),_:1},8,["onClick"])])])],512),[[ne,d.value.length>0]])]))}},qt=te(Gt,[["__scopeId","data-v-d22c1624"]]);export{qt as default};
