import{o as ve,u as q,a as we}from"./FileUploadBlock-DEawfpX6.js";import{d as ye,r as W,c as p,a as _e,n as Te,o as m,t as $,b as xe,f as G,e as L,g as j,_ as ke,h as l,i as w,u as r,F as ie,j as le,k as O,w as V,l as te,m as Se,p as se,q as ne,T as Ee,s as Ce,v as Ne,x as Ae}from"./index-tb_m-W9G.js";import{_ as Pe,a as je,b as De,c as Me}from"./InputNumber-CAVUbWzj.js";import{_ as Le}from"./InputCheckbox-DypCpSpq.js";import{u as Ve,_ as Re}from"./TimetableUploadSection-BaxnH4fX.js";import{n as re}from"./nl-BAmJVTaK.js";import"./server-0qcnt84C.js";const He=ye({__name:"ContextMenu",props:{x:{},y:{}},emits:["click-outside"],setup(e,{emit:t}){const o=e,u=t,f=W(null);return ve(f,c=>u("click-outside",c)),(c,T)=>(m(),p("div",{class:"context-menu",ref_key:"target",ref:f,style:Te({top:o.y+"px",left:o.x+"px"})},[_e(c.$slots,"default")],4))}});var Ue=Object.defineProperty,ae=Object.getOwnPropertySymbols,Ie=Object.prototype.hasOwnProperty,$e=Object.prototype.propertyIsEnumerable,de=(e,t,o)=>t in e?Ue(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,ue=(e,t)=>{for(var o in t||(t={}))Ie.call(t,o)&&de(e,o,t[o]);if(ae)for(var o of ae(t))$e.call(t,o)&&de(e,o,t[o]);return e},Z=(e,t,o)=>new Promise((u,f)=>{var c=g=>{try{h(o.next(g))}catch(d){f(d)}},T=g=>{try{h(o.throw(g))}catch(d){f(d)}},h=g=>g.done?u(g.value):Promise.resolve(g.value).then(c,T);h((o=o.apply(e,t)).next())});function oe(e){return!!e.shadowRoot}let ce=!1;function Oe(){if(ce)return;class e extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}}customElements.define("vue-to-print-shadow-dom",e),ce=!0}const We=`
  class VueToPrintShadowDom extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  }
  customElements.define('vue-to-print-shadow-dom', VueToPrintShadowDom);
`;function Be(e){const t=e.createElement("script");t.setAttribute("type","text/javascript"),t.setAttribute("vue-to-print-custom-script","registry-shadow-dom"),t.innerHTML=We,e.body.appendChild(t)}const Fe=`
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
`;function Xe(e){const t=e.createElement("script");t.setAttribute("type","text/javascript"),t.setAttribute("vue-to-print-custom-script","registry-retrieve-style-sheets-func"),t.innerHTML=Fe,e.body.appendChild(t)}const z=new Map;function me(e){Oe();const t=e.nodeName.toLowerCase(),o=e.shadowRoot.adoptedStyleSheets,u=document.createElement("vue-to-print-shadow-dom");u.setAttribute("original-tag-name",t),z.has(t)||z.set(t,new Set);const f=z.get(t);for(let h=o.length;h--;)f.add(o[h]);const c=u.attributes,T=e.attributes;for(let h=T.length;h--;)c.setNamedItem(T[h].cloneNode());return u}function Ge(){const e=new Map,t=new Map,o=Array.from(z.keys());for(let u=o.length;u--;){const f=[],c=o[u],T=Array.from(z.get(c));for(let h=T.length;h--;){const g=T[h];if(!t.has(g)){let d="";const s=Array.from(g.cssRules);for(let a=s.length;a--;)d+=s[a].cssText;t.set(g,d)}f.push(t.get(g))}e.set(c,f)}return e}function Ye(e){const t=e.contentWindow||null;if(!t)throw new Error("Cannot access print window");const o=t.document;if(!o)throw new Error("Cannot access print document");Be(o),Xe(o);const u=Ge();t.retrieveStyleSheets(u)}function pe(e){return!!customElements.get(e.nodeName.toLowerCase())}let fe=!1;function qe(){if(fe)return;class e extends HTMLElement{constructor(){super()}}customElements.define("vue-to-print-custom-element",e),fe=!0}function he(e){qe();const t=e.nodeName.toLowerCase(),o=document.createElement("vue-to-print-custom-element");o.setAttribute("original-tag-name",t);const u=o.attributes,f=e.attributes;for(let c=f.length;c--;)u.setNamedItem(f[c].cloneNode());return o}function be(e){return Z(this,null,function*(){e.getAttribute("src")&&(e.complete||(yield new Promise((t,o)=>{e.addEventListener("load",t,{once:!0}),e.addEventListener("error",u=>o(u.error),{once:!0})})))})}function ze(e){return Z(this,null,function*(){e.readyState>=2||(yield new Promise((t,o)=>{e.addEventListener("loadeddata",t,{once:!0}),e.addEventListener("error",u=>o(u.error),{once:!0}),e.addEventListener("stalled",()=>o(new Error("Loading video stalled, skipping")),{once:!0})}))})}function Ze(e){const t=e.cloneNode(),o=t.getContext("2d");return o&&o.drawImage(e,0,0),t}function Ke(e,t){const o=e.cloneNode();return t.push(be(o)),o}function Je(e,t){const o=e.cloneNode();o.preload="auto";const u=o.getAttribute("poster");if(u){const f=new Image;f.src=u,t.push(be(f))}else t.push(ze(o));return o}function Qe(e){const t=e.cloneNode();switch(e.type){case"checkbox":case"radio":t.checked=e.checked;break;default:t.value=e.value;break}return t}function et(e){const t=e.cloneNode();return t.value=e.value,t}function tt(e){const t=e.cloneNode();return t.selected=e.selected,t}const ge=new Map([["canvas",Ze],["img",Ke],["video",Je],["input",Qe],["select",et],["option",tt]]);function nt(e){return e.cloneNode()}function ot(e,t=[]){const o=e.nodeName.toLowerCase();return(ge.has(o)?ge.get(o):nt)(e,t)}function it(e){var t;if(e.nodeName.toLowerCase()==="slot"){const o=e.assignedNodes();return o.length>0?o:Array.from(e.childNodes)}else return Array.from(((t=e.shadowRoot)!=null?t:e).childNodes)}function lt(e){return Z(this,null,function*(){const t=new Map,o=[];let u;oe(e)?u=me(e):pe(e)?u=he(e):u=e.cloneNode(),t.set(e,u);const f=[e];for(;f.length;){const c=f.shift(),T=it(c);if(T.length<=0)continue;const h=t.get(c),g=oe(h)?h.shadowRoot:h;for(let d=0;d<T.length;d++){const s=T[d];let a;oe(s)?a=me(s):pe(s)?a=he(s):a=ot(s,o),t.set(s,a),f.push(s),g.appendChild(a)}}return{node:u,result:yield Promise.allSettled(o)}})}const st={copyStyles:!0,pageStyle:`
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
    `,removeAfterPrint:!1,suppressErrors:!1};function rt(e){e=ue(ue({},st),e);let t=0,o=[],u=[];const f=s=>{const a=e.onAfterPrint,S=e.onPrintError,N=e.print,M=$(e.documentTitle);setTimeout(()=>{var A,R;if(s.contentWindow)if(s.contentWindow.focus(),N)Promise.resolve(N(s)).then(()=>a==null?void 0:a()).then(()=>g()).catch(b=>{S?S("print",b):d(["An error was thrown by the specified `print` function"])});else{if(s.contentWindow.print){const b=(R=(A=s.contentDocument)==null?void 0:A.title)!=null?R:"",X=s.ownerDocument.title;M&&(s.ownerDocument.title=M,s.contentDocument&&(s.contentDocument.title=M)),s.contentWindow.print(),M&&(s.ownerDocument.title=X,s.contentDocument&&(s.contentDocument.title=b))}else d(["Printing for this browser is not currently possible: the browser does not have a `print` method available for iframes."]);a==null||a(),g()}else d(["Printing failed because the `contentWindow` of the print iframe did not load. This is possibly an error with `vue-to-print`. Please file an issue: https://github.com/gregnb/react-to-print/issues/"])},500)},c=s=>{const a=e.onBeforePrint,S=e.onPrintError;if(a){const N=a();N&&typeof N.then=="function"?N.then(()=>{f(s)}).catch(M=>{S&&S("onBeforePrint",M)}):f(s)}else f(s)},T=()=>{const s=e.onBeforeGetContent,a=e.onPrintError;if(s){const S=s();S&&typeof S.then=="function"?S.then(h).catch(N=>{a&&a("onBeforeGetContent",N)}):h()}else h()},h=()=>Z(this,null,function*(){const s=$(e.bodyClass),a=$(e.content),S=$(e.copyStyles),N=$(e.fonts),M=$(e.pageStyle),A=$(e.nonce);let R;if(a instanceof HTMLElement?R=a:a.$el&&(R=a.$el.nodeName==="#text"?a.$el.parentElement:a.$el),R===void 0){d(["To print a functional component ensure it is wrapped with `React.forwardRef`, and ensure the forwarded ref is used. See the README for an example: https://github.com/gregnb/react-to-print#examples"]);return}if(R===null){d(['There is nothing to print because the "content" prop returned "null". Please ensure "content" is renderable before allowing "vue-to-print" to be called.']);return}const b=document.createElement("iframe");b.width=`${document.documentElement.clientWidth}px`,b.height=`${document.documentElement.clientHeight}px`,b.style.position="absolute",b.style.top=`-${document.documentElement.clientHeight+100}px`,b.style.left=`-${document.documentElement.clientWidth+100}px`,b.id="printWindow",b.srcdoc="<!DOCTYPE html>";const X=R;if(!X){d(['"vue-to-print" could not locate the DOM node corresponding with the `content` prop']);return}const{node:U,result:Q}=yield lt(X);for(const n of Q)n.status!=="fulfilled"&&d(["An error occurred while cloning the content to print. Printing will continue, but some content may be missing.",`Error: ${n.reason}`],"warning");const ee=document.querySelectorAll("link[rel~='stylesheet']"),K=N?N.length:0;t=ee.length+K,o=[],u=[];const E=(n,D)=>{if(o.includes(n)){d(["Tried to mark a resource that has already been handled",n],"debug");return}D?(d(['"vue-to-print" was unable to load a resource but will continue attempting to print the page',...D]),u.push(n)):o.push(n),o.length+u.length===t&&c(b)};b.onload=()=>Z(this,null,function*(){var n,D;b.onload=null;const v=b.contentDocument||((n=b.contentWindow)==null?void 0:n.document);if(v){v.body.appendChild(U),N&&((D=b.contentDocument)!=null&&D.fonts&&typeof FontFace<"u"?N.forEach(x=>{const P=new FontFace(x.family,x.source,{weight:x.weight,style:x.style});b.contentDocument.fonts.add(P),P.loaded.then(()=>{E(P)}).catch(B=>{E(P,["Failed loading the font:",P,"Load error:",B])})}):(N.forEach(x=>E(x)),d(['"vue-to-print" is not able to load custom fonts because the browser does not support the FontFace API but will continue attempting to print the page'])));const y=typeof M=="function"?M():M;if(typeof y!="string")d([`"vue-to-print" expected a "string" from \`pageStyle\` but received "${typeof y}". Styles from \`pageStyle\` will not be applied.`]);else{const x=v.createElement("style");A&&(x.setAttribute("nonce",A),v.head.setAttribute("nonce",A)),x.appendChild(v.createTextNode(y)),v.head.appendChild(x)}if(s&&v.body.classList.add(...s.split(" ")),S){const x=document.querySelectorAll("style, link[rel~='stylesheet']");for(let P=0,B=x.length;P<B;++P){const _=x[P];if(_.tagName.toLowerCase()==="style"){const C=v.createElement(_.tagName),H=_.sheet;if(H){let F="";try{const i=H.cssRules.length;for(let k=0;k<i;++k)typeof H.cssRules[k].cssText=="string"&&(F+=`${H.cssRules[k].cssText}\r
`)}catch{d(["A stylesheet could not be accessed. This is likely due to the stylesheet having cross-origin imports, and many browsers block script access to cross-origin stylesheets. See https://github.com/gregnb/react-to-print/issues/429 for details. You may be able to load the sheet by both marking the stylesheet with the cross `crossorigin` attribute, and setting the `Access-Control-Allow-Origin` header on the server serving the stylesheet. Alternatively, host the stylesheet on your domain to avoid this issue entirely.",_],"warning")}C.setAttribute("id",`vue-to-print-${P}`),A&&C.setAttribute("nonce",A),C.appendChild(v.createTextNode(F)),v.head.appendChild(C)}}else if(_.getAttribute("href"))if(_.hasAttribute("disabled"))d(["`vue-to-print` encountered a <link> tag with a `disabled` attribute and will ignore it. Note that the `disabled` attribute is deprecated, and some browsers ignore it. You should stop using it. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-disabled. The <link> is:",_],"warning"),E(_);else{const C=v.createElement(_.tagName);for(let H=0,F=_.attributes.length;H<F;++H){const i=_.attributes[H];i&&C.setAttribute(i.nodeName,i.nodeValue||"")}C.onload=()=>E(C),C.onerror=(H,F,i,k,I)=>E(C,["Failed to load",C,"Error:",I]),A&&C.setAttribute("nonce",A),v.head.appendChild(C)}else d(["`vue-to-print` encountered a <link> tag with an empty `href` attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:",_],"warning"),E(_)}}}Ye(b),(t===0||!S)&&c(b)}),g(!0),document.body.appendChild(b)}),g=s=>{const a=$(e.removeAfterPrint);if(s||a){const S=document.getElementById("printWindow");S&&document.body.removeChild(S)}},d=(s,a="error")=>{$(e.suppressErrors)||(a==="error"?console.error(s):a==="warning"?console.warn(s):a==="debug"&&console.debug(s))};return{handlePrint:T}}const at={key:0,id:"edit"},dt={class:"flex",style:{"flex-wrap":"wrap-reverse"}},ut={style:{"flex-grow":"1"}},ct={class:"header"},mt={class:"timetable",spellcheck:"false"},pt={key:0,span:"1",style:{width:"0"}},ft={key:1,span:"1",style:{width:"0"}},ht={key:2,span:"1",style:{width:"0"}},gt={key:0,nowrap:"",contenteditable:""},yt={key:1,nowrap:"",contenteditable:""},bt={key:2,nowrap:"",contenteditable:""},vt=["onContextmenu"],wt={nowrap:"",contenteditable:""},_t={nowrap:"",contenteditable:""},Tt={key:0,nowrap:"",contenteditable:"",class:"translucent"},xt={nowrap:"",contenteditable:"",class:"special-cell"},kt={nowrap:""},St={key:0,class:"double-usherout"},Et={key:1,class:"long-gap"},Ct={key:2,class:"plf-overlap"},Nt={contenteditable:"",class:"credits-time"},At={key:0,class:"post-credits"},Pt={key:1,nowrap:"",contenteditable:"",class:"translucent"},jt={key:2,nowrap:"",contenteditable:"",class:"translucent",style:{"font-weight":"normal","font-style":"normal"}},Dt={key:3,nowrap:"",contenteditable:""},Mt={style:{float:"right"}},Lt={key:4,nowrap:"",contenteditable:""},Vt={class:"footer"},Rt={key:0},Ht=["disabled"],Ut={key:0},It={key:0},$t={key:1},Ot={key:0},Wt={key:1},Bt={class:"buttons",style:{display:"flex","flex-direction":"column",gap:"16px","align-items":"stretch","margin-top":"auto",position:"sticky",bottom:"16px","padding-left":"16px","padding-right":"16px"}},Ft={key:1},Xt={key:2,class:"dropzone"},Gt=ye({__name:"TimetableView",setup(e){var K;const t=Ve(),o={mainTime:{header:"Start",title:"Start hoofdfilm",optional:!0},endTime:{header:"Einde",title:"Einde voorstelling",optional:!0},nextStartTime:{header:"Volgende",title:"Volgende inloop",optional:!0}},u=Object.fromEntries(Object.entries(o).filter(([,E])=>E.optional)),f=W(!0),c=q("optional-columns",{mainTime:!1,endTime:!1,nextStartTime:!1}),T=q("plf-time-before",17),h=q("short-gap-interval",10),g=q("long-gap-interval",35),d=q("post-credits-films",new Set);for(;d.value.size>20;)d.value.delete(Array.from(d.value)[0]);const s=W(null),a=W(null),S=W(!1),N=W(0),M=W(0),A=W({}),R=W(0);function b(E,n,D){E.preventDefault(),document.activeElement.blur(),S.value=!0,A.value=n,R.value=D,N.value=E.clientX,M.value=E.clientY}function X(){Ce(()=>S.value=!1)}const U=xe(()=>{var n;let E=((n=t.table)==null?void 0:n.slice().map((D,v)=>{var x,P,B;let y=D;return y.overlapWithPlf=t.table.filter(_=>{var C;return(C=_.auditorium)==null?void 0:C.includes("4DX")}).some(_=>y.creditsTime.getTime()-_.scheduledTime.getTime()>=T.value*-6e4&&y.creditsTime.getTime()-_.mainShowTime.getTime()<=0),y.hasPostCredits=d.value.has((x=y.title)==null?void 0:x.trim()),y.timeToNextUsherout=((P=t.table[v+1])==null?void 0:P.creditsTime.getTime())-(y.hasPostCredits?y.endTime:y.creditsTime).getTime(),y.nextStartTime=(B=t.table.find((_,C)=>C>v&&_.auditorium===y.auditorium))==null?void 0:B.scheduledTime,y}))||[];return E.filter(D=>{var v;return(v=D.auditorium)==null?void 0:v.includes("4DX")}).forEach(D=>{let v=0;for(let y=0;y<E.length;y++)if(E[y].creditsTime.getTime()-D.scheduledTime.getTime()>0){v=y;break}E[Math.max(v,0)].isNearPlf=!0}),E||[]}),{handlePrint:Q}=rt({content:()=>s.value,documentTitle:"Tijdenlijstje "+G(((K=U.value[0])==null?void 0:K.scheduledTime)||new Date,"yyyy-MM-dd",{locale:re})}),{isOverDropZone:ee}=we(a,{onDrop:t.filesUploaded,multiple:!1});return(E,n)=>{var F;const D=ke,v=Re,y=Le,x=De,P=je,B=Pe,_=Se,C=Me,H=He;return m(),p("main",{ref_key:"main",ref:a},[L(D),L(v),U.value.length>0?(m(),p("section",at,[l("div",dt,[l("div",ut,[n[19]||(n[19]=l("h2",null,"Tijdenlijstje bewerken",-1)),l("div",{id:"print-component",ref_key:"printComponent",ref:s},[l("div",ct,w(r(G)(((F=U.value[0])==null?void 0:F.scheduledTime)||0,"EEEEEE d MMM yyyy",{locale:r(re)})),1),l("table",mt,[l("colgroup",null,[n[5]||(n[5]=l("col",{span:"1",style:{width:"0"}},null,-1)),n[6]||(n[6]=l("col",{span:"1",style:{width:"0"}},null,-1)),n[7]||(n[7]=l("col",{span:"1",style:{width:"16%"}},null,-1)),r(c).mainTime?(m(),p("col",pt)):j("",!0),n[8]||(n[8]=l("col",{span:"1",style:{width:"28%"}},null,-1)),r(c).endTime?(m(),p("col",ft)):j("",!0),r(c).nextStartTime?(m(),p("col",ht)):j("",!0),n[9]||(n[9]=l("col",{span:"1",style:{width:"50%"}},null,-1)),n[10]||(n[10]=l("col",{span:"1",style:{width:"0"}},null,-1))]),l("thead",null,[l("tr",null,[n[11]||(n[11]=l("td",{nowrap:"",contenteditable:"",width:"1px"},"Zaal",-1)),n[12]||(n[12]=l("td",{nowrap:"",contenteditable:""},"Inloop",-1)),r(c).mainTime?(m(),p("td",gt,w(o.mainTime.header),1)):j("",!0),n[13]||(n[13]=l("td",{nowrap:"",contenteditable:""},null,-1)),n[14]||(n[14]=l("td",{nowrap:"",contenteditable:""},"Aftiteling",-1)),r(c).endTime?(m(),p("td",yt,w(o.endTime.header),1)):j("",!0),r(c).nextStartTime?(m(),p("td",bt,w(o.nextStartTime.header),1)):j("",!0),n[15]||(n[15]=l("td",{nowrap:"",contenteditable:""},"Film",-1)),n[16]||(n[16]=l("td",{nowrap:"",contenteditable:""},null,-1))])]),(m(!0),p(ie,null,le(U.value,(i,k)=>{var I,Y;return m(),p("tr",{class:ne({targeting:S.value&&R.value===k,italic:(I=i.auditorium)==null?void 0:I.includes("4DX"),bold:i.featureRating==="16"||i.featureRating==="18"}),onContextmenu:Ne(J=>b(J,i,k),["prevent"])},[l("td",wt,w(i.auditorium==="PULR 8"||i.auditorium==="Rooftop"?"RT":i.auditorium.replace(/^\w+\s/,"")),1),l("td",_t,w(r(G)(i.scheduledTime,"HH:mm")),1),r(c).mainTime?(m(),p("td",Tt,w(r(G)(i.mainShowTime,"HH:mm:ss")),1)):j("",!0),l("td",xt,w((Y=U.value[k])!=null&&Y.isNearPlf?"4DX":""),1),l("td",kt,[i.timeToNextUsherout<=r(h)*6e4?(m(),p("div",St)):j("",!0),i.timeToNextUsherout>=r(g)*6e4&&r(g)>0?(m(),p("div",Et)):j("",!0),i.overlapWithPlf?(m(),p("div",Ct)):j("",!0),l("span",Nt,[O(w(r(G)(i.creditsTime,"HH:mm:ss"))+" ",1),i.hasPostCredits?(m(),p("span",At,"+"+w(Math.round((i.endTime.getTime()-i.creditsTime.getTime())/6e4)),1)):j("",!0)])]),r(c).endTime?(m(),p("td",Pt,w(r(G)(i.endTime,"HH:mm:ss")),1)):j("",!0),r(c).nextStartTime?(m(),p("td",jt,w(i.nextStartTime?r(G)(i.nextStartTime,"HH:mm"):"-"),1)):j("",!0),f.value?(m(),p("td",Dt,[l("span",null,w(i.title),1),l("span",Mt,w(i.extras.join(" ")),1)])):(m(),p("td",Lt,w(i.playlist),1)),l("td",{nowrap:"",contenteditable:"",style:{"text-align":"end"},class:ne({translucent:i.featureRating!=="16"&&i.featureRating!=="18"})},w(i.featureRating),3)],42,vt)}),256))]),n[17]||(n[17]=l("br",null,null,-1)),n[18]||(n[18]=l("span",{class:"custom-content",contenteditable:""},null,-1)),l("div",Vt,["lastModified"in r(t).metadata?(m(),p("span",Rt," Gegevens: "+w(new Date(r(t).metadata.lastModified).toLocaleString("nl-NL",{weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}))+" • ",1)):j("",!0),O(" Gegenereerd: "+w(new Date().toLocaleDateString("nl-NL",{weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}))+" • Pathé Tools • Quinten Althues ",1)])],512)]),L(C,null,{default:V(()=>[L(B,null,{default:V(()=>[L(P,{value:"Opties"},{default:V(()=>[l("fieldset",null,[n[21]||(n[21]=l("legend",null,"Weergave",-1)),L(y,{modelValue:f.value,"onUpdate:modelValue":n[0]||(n[0]=i=>f.value=i),identifier:"splitExtra"},{default:V(()=>n[20]||(n[20]=[O(" Extra informatie scheiden van filmtitel ")])),_:1},8,["modelValue"])]),l("fieldset",{disabled:!U.value.some(i=>{var k;return(k=i.auditorium)==null?void 0:k.includes("4DX")})},[n[23]||(n[23]=l("legend",null,"4DX-inloop",-1)),n[24]||(n[24]=l("small",null,"Uitlopen tijdens de 4DX-inloop worden gemarkeerd met een streeplijntje.",-1)),L(x,{modelValue:r(T),"onUpdate:modelValue":n[1]||(n[1]=i=>te(T)?T.value=i:null),modelModifiers:{number:!0},identifier:"plfTimeBefore",min:"0",max:"30",unit:"min",disabled:!U.value.some(i=>{var k;return(k=i.auditorium)==null?void 0:k.includes("4DX")})},{default:V(()=>[n[22]||(n[22]=O(" Tijd voor aanvang ")),r(T)>0?(m(),p("small",Ut,"De 4DX-inloop begint "+w(r(T))+" minuten voor de aanvangstijd en eindigt wanneer de hoofdfilm begint.",1)):j("",!0)]),_:1},8,["modelValue","disabled"])],8,Ht),l("fieldset",null,[n[27]||(n[27]=l("legend",null,"Uitloop",-1)),L(x,{modelValue:r(h),"onUpdate:modelValue":n[2]||(n[2]=i=>te(h)?h.value=i:null),modelModifiers:{number:!0},identifier:"shortGapInterval",min:"0",max:"20",unit:"min"},{default:V(()=>[n[25]||(n[25]=O("Interval voor dubbele uitloop ")),r(h)>0?(m(),p("small",It," Uitlopen met minder dan "+w(r(h))+" minuten ertussen krijgen een boogje ",1)):(m(),p("small",$t,"Uitlopen met weinig tijd ertussen worden niet gemarkeerd"))]),_:1},8,["modelValue"]),L(x,{modelValue:r(g),"onUpdate:modelValue":n[3]||(n[3]=i=>te(g)?g.value=i:null),modelModifiers:{number:!0},identifier:"longGapInterval",min:"20",max:"80",unit:"min"},{default:V(()=>[n[26]||(n[26]=O("Interval voor gat tussen uitlopen ")),r(g)>0?(m(),p("small",Ot,"Gaten van meer dan "+w(r(g))+" minuten krijgen een stippellijntje ",1)):(m(),p("small",Wt,"Uitlopen met veel tijd ertussen worden niet gemarkeerd"))]),_:1},8,["modelValue"]),n[28]||(n[28]=l("small",null," Bij uitlopen met post-credits-scènes wordt de tijd 'Einde voorstelling' gebruikt voor het berekenen van de tijd tot de volgende uitloop. ",-1))])]),_:1}),L(P,{value:"Kolommen"},{default:V(()=>[(m(!0),p(ie,null,le(r(u),(i,k)=>(m(),se(y,{modelValue:r(c)[k],"onUpdate:modelValue":I=>r(c)[k]=I,identifier:String(k)},{default:V(()=>[O(w(o[k].title),1)]),_:2},1032,["modelValue","onUpdate:modelValue","identifier"]))),256))]),_:1})]),_:1}),l("div",Bt,[L(_,{class:"primary full",onClick:r(Q)},{default:V(()=>n[29]||(n[29]=[O(" Afdrukken")])),_:1},8,["onClick"])])]),_:1})])])):(m(),p("section",Ft,n[30]||(n[30]=[l("h2",null,"Tijdenlijstje bewerken",-1),l("p",null,"Upload eerst een bestand.",-1)]))),L(Ee,null,{default:V(()=>[S.value?(m(),se(H,{key:0,class:"dark",x:N.value,y:M.value,onClickOutside:X},{default:V(()=>{var i;return[l("button",{onClick:n[4]||(n[4]=k=>{var I,Y,J;r(d).has((I=A.value.title)==null?void 0:I.trim())?r(d).delete((Y=A.value.title)==null?void 0:Y.trim()):r(d).add((J=A.value.title)==null?void 0:J.trim()),X()})},[l("div",{class:ne(["check",{empty:!r(d).has((i=A.value.title)==null?void 0:i.trim())}])},null,2),O(" Post-credits-scène bij "+w(A.value.title),1)])]}),_:1},8,["x","y"])):j("",!0)]),_:1}),r(ee)?(m(),p("div",Xt," Laat los om bestand te uploaden ")):j("",!0)],512)}}}),en=Ae(Gt,[["__scopeId","data-v-e4814fc4"]]);export{en as default};
