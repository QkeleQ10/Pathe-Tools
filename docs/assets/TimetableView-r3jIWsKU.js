import{o as he,u as Y,_ as ge,a as ye,b as be,S as ve}from"./DropZone.vue_vue_type_script_setup_true_lang-DuqJnlQZ.js";import{d as me,r as W,c as p,o as m,a as we,n as Te,t as X,b as ke,e as s,f as H,g as P,u as a,h as T,F as J,i as te,w as R,j as O,k as Z,_ as Se,l as ne,m as q,T as xe,p as _e,q as Ee,v as Ce,s as Ae,x as Ne}from"./index-jgsB2TcN.js";import{u as Pe,f as G,_ as je,a as De}from"./format-BcMedVX-.js";const Le=me({__name:"ContextMenu",props:{x:{},y:{}},emits:["click-outside"],setup(e,{emit:t}){const o=e,d=t,f=W(null);return he(f,c=>d("click-outside",c)),(c,k)=>(m(),p("div",{class:"context-menu",ref_key:"target",ref:f,style:Te({top:o.y+"px",left:o.x+"px"})},[we(c.$slots,"default")],4))}});var Me=Object.defineProperty,oe=Object.getOwnPropertySymbols,Ve=Object.prototype.hasOwnProperty,Re=Object.prototype.propertyIsEnumerable,ie=(e,t,o)=>t in e?Me(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,se=(e,t)=>{for(var o in t||(t={}))Ve.call(t,o)&&ie(e,o,t[o]);if(oe)for(var o of oe(t))Re.call(t,o)&&ie(e,o,t[o]);return e},K=(e,t,o)=>new Promise((d,f)=>{var c=y=>{try{g(o.next(y))}catch(u){f(u)}},k=y=>{try{g(o.throw(y))}catch(u){f(u)}},g=y=>y.done?d(y.value):Promise.resolve(y.value).then(c,k);g((o=o.apply(e,t)).next())});function ee(e){return!!e.shadowRoot}let le=!1;function He(){if(le)return;class e extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}}customElements.define("vue-to-print-shadow-dom",e),le=!0}const Ue=`
  class VueToPrintShadowDom extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  }
  customElements.define('vue-to-print-shadow-dom', VueToPrintShadowDom);
`;function Ie(e){const t=e.createElement("script");t.setAttribute("type","text/javascript"),t.setAttribute("vue-to-print-custom-script","registry-shadow-dom"),t.innerHTML=Ue,e.body.appendChild(t)}const $e=`
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
`;function Oe(e){const t=e.createElement("script");t.setAttribute("type","text/javascript"),t.setAttribute("vue-to-print-custom-script","registry-retrieve-style-sheets-func"),t.innerHTML=$e,e.body.appendChild(t)}const z=new Map;function re(e){He();const t=e.nodeName.toLowerCase(),o=e.shadowRoot.adoptedStyleSheets,d=document.createElement("vue-to-print-shadow-dom");d.setAttribute("original-tag-name",t),z.has(t)||z.set(t,new Set);const f=z.get(t);for(let g=o.length;g--;)f.add(o[g]);const c=d.attributes,k=e.attributes;for(let g=k.length;g--;)c.setNamedItem(k[g].cloneNode());return d}function We(){const e=new Map,t=new Map,o=Array.from(z.keys());for(let d=o.length;d--;){const f=[],c=o[d],k=Array.from(z.get(c));for(let g=k.length;g--;){const y=k[g];if(!t.has(y)){let u="";const l=Array.from(y.cssRules);for(let r=l.length;r--;)u+=l[r].cssText;t.set(y,u)}f.push(t.get(y))}e.set(c,f)}return e}function Be(e){const t=e.contentWindow||null;if(!t)throw new Error("Cannot access print window");const o=t.document;if(!o)throw new Error("Cannot access print document");Ie(o),Oe(o);const d=We();t.retrieveStyleSheets(d)}function ae(e){return!!customElements.get(e.nodeName.toLowerCase())}let de=!1;function Fe(){if(de)return;class e extends HTMLElement{constructor(){super()}}customElements.define("vue-to-print-custom-element",e),de=!0}function ue(e){Fe();const t=e.nodeName.toLowerCase(),o=document.createElement("vue-to-print-custom-element");o.setAttribute("original-tag-name",t);const d=o.attributes,f=e.attributes;for(let c=f.length;c--;)d.setNamedItem(f[c].cloneNode());return o}function pe(e){return K(this,null,function*(){e.getAttribute("src")&&(e.complete||(yield new Promise((t,o)=>{e.addEventListener("load",t,{once:!0}),e.addEventListener("error",d=>o(d.error),{once:!0})})))})}function Xe(e){return K(this,null,function*(){e.readyState>=2||(yield new Promise((t,o)=>{e.addEventListener("loadeddata",t,{once:!0}),e.addEventListener("error",d=>o(d.error),{once:!0}),e.addEventListener("stalled",()=>o(new Error("Loading video stalled, skipping")),{once:!0})}))})}function Ge(e){const t=e.cloneNode(),o=t.getContext("2d");return o&&o.drawImage(e,0,0),t}function Ye(e,t){const o=e.cloneNode();return t.push(pe(o)),o}function qe(e,t){const o=e.cloneNode();o.preload="auto";const d=o.getAttribute("poster");if(d){const f=new Image;f.src=d,t.push(pe(f))}else t.push(Xe(o));return o}function ze(e){const t=e.cloneNode();switch(e.type){case"checkbox":case"radio":t.checked=e.checked;break;default:t.value=e.value;break}return t}function Ke(e){const t=e.cloneNode();return t.value=e.value,t}function Qe(e){const t=e.cloneNode();return t.selected=e.selected,t}const ce=new Map([["canvas",Ge],["img",Ye],["video",qe],["input",ze],["select",Ke],["option",Qe]]);function Je(e){return e.cloneNode()}function Ze(e,t=[]){const o=e.nodeName.toLowerCase();return(ce.has(o)?ce.get(o):Je)(e,t)}function et(e){var t;if(e.nodeName.toLowerCase()==="slot"){const o=e.assignedNodes();return o.length>0?o:Array.from(e.childNodes)}else return Array.from(((t=e.shadowRoot)!=null?t:e).childNodes)}function tt(e){return K(this,null,function*(){const t=new Map,o=[];let d;ee(e)?d=re(e):ae(e)?d=ue(e):d=e.cloneNode(),t.set(e,d);const f=[e];for(;f.length;){const c=f.shift(),k=et(c);if(k.length<=0)continue;const g=t.get(c),y=ee(g)?g.shadowRoot:g;for(let u=0;u<k.length;u++){const l=k[u];let r;ee(l)?r=re(l):ae(l)?r=ue(l):r=Ze(l,o),t.set(l,r),f.push(l),y.appendChild(r)}}return yield Promise.all(o),d})}const nt={copyStyles:!0,pageStyle:`
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
    `,removeAfterPrint:!1,suppressErrors:!1};function ot(e){e=se(se({},nt),e);let t=0,o=[],d=[];const f=l=>{const r=e.onAfterPrint,w=e.onPrintError,A=e.print,D=X(e.documentTitle);setTimeout(()=>{var E,L;if(l.contentWindow)if(l.contentWindow.focus(),A)Promise.resolve(A(l)).then(()=>r==null?void 0:r()).then(()=>y()).catch(v=>{w?w("print",v):u(["An error was thrown by the specified `print` function"])});else{if(l.contentWindow.print){const v=(L=(E=l.contentDocument)==null?void 0:E.title)!=null?L:"",B=l.ownerDocument.title;D&&(l.ownerDocument.title=D,l.contentDocument&&(l.contentDocument.title=D)),l.contentWindow.print(),D&&(l.ownerDocument.title=B,l.contentDocument&&(l.contentDocument.title=v))}else u(["Printing for this browser is not currently possible: the browser does not have a `print` method available for iframes."]);r==null||r(),y()}else u(["Printing failed because the `contentWindow` of the print iframe did not load. This is possibly an error with `vue-to-print`. Please file an issue: https://github.com/gregnb/react-to-print/issues/"])},500)},c=l=>{const r=e.onBeforePrint,w=e.onPrintError;if(r){const A=r();A&&typeof A.then=="function"?A.then(()=>{f(l)}).catch(D=>{w&&w("onBeforePrint",D)}):f(l)}else f(l)},k=()=>{const l=e.onBeforeGetContent,r=e.onPrintError;if(l){const w=l();w&&typeof w.then=="function"?w.then(g).catch(A=>{r&&r("onBeforeGetContent",A)}):g()}else g()},g=()=>K(this,null,function*(){const l=X(e.bodyClass),r=X(e.content),w=X(e.copyStyles),A=X(e.fonts),D=X(e.pageStyle),E=X(e.nonce);let L;if(r instanceof HTMLElement?L=r:r.$el&&(L=r.$el.nodeName==="#text"?r.$el.parentElement:r.$el),L===void 0){u(["To print a functional component ensure it is wrapped with `React.forwardRef`, and ensure the forwarded ref is used. See the README for an example: https://github.com/gregnb/react-to-print#examples"]);return}if(L===null){u(['There is nothing to print because the "content" prop returned "null". Please ensure "content" is renderable before allowing "vue-to-print" to be called.']);return}const v=document.createElement("iframe");v.width=`${document.documentElement.clientWidth}px`,v.height=`${document.documentElement.clientHeight}px`,v.style.position="absolute",v.style.top=`-${document.documentElement.clientHeight+100}px`,v.style.left=`-${document.documentElement.clientWidth+100}px`,v.id="printWindow",v.srcdoc="<!DOCTYPE html>";const B=L;if(!B){u(['"vue-to-print" could not locate the DOM node corresponding with the `content` prop']);return}const U=yield tt(B),Q=document.querySelectorAll("link[rel~='stylesheet']"),j=A?A.length:0;t=Q.length+j,o=[],d=[];const n=(S,b)=>{if(o.includes(S)){u(["Tried to mark a resource that has already been handled",S],"debug");return}b?(u(['"vue-to-print" was unable to load a resource but will continue attempting to print the page',...b]),d.push(S)):o.push(S),o.length+d.length===t&&c(v)};v.onload=()=>K(this,null,function*(){var S,b;v.onload=null;const x=v.contentDocument||((S=v.contentWindow)==null?void 0:S.document);if(x){x.body.appendChild(U),A&&((b=v.contentDocument)!=null&&b.fonts&&typeof FontFace<"u"?A.forEach(C=>{const _=new FontFace(C.family,C.source,{weight:C.weight,style:C.style});v.contentDocument.fonts.add(_),_.loaded.then(()=>{n(_)}).catch($=>{n(_,["Failed loading the font:",_,"Load error:",$])})}):(A.forEach(C=>n(C)),u(['"vue-to-print" is not able to load custom fonts because the browser does not support the FontFace API but will continue attempting to print the page'])));const I=typeof D=="function"?D():D;if(typeof I!="string")u([`"vue-to-print" expected a "string" from \`pageStyle\` but received "${typeof I}". Styles from \`pageStyle\` will not be applied.`]);else{const C=x.createElement("style");E&&(C.setAttribute("nonce",E),x.head.setAttribute("nonce",E)),C.appendChild(x.createTextNode(I)),x.head.appendChild(C)}if(l&&x.body.classList.add(...l.split(" ")),w){const C=document.querySelectorAll("style, link[rel~='stylesheet']");for(let _=0,$=C.length;_<$;++_){const N=C[_];if(N.tagName.toLowerCase()==="style"){const i=x.createElement(N.tagName),h=N.sheet;if(h){let M="";try{const V=h.cssRules.length;for(let F=0;F<V;++F)typeof h.cssRules[F].cssText=="string"&&(M+=`${h.cssRules[F].cssText}\r
`)}catch{u(["A stylesheet could not be accessed. This is likely due to the stylesheet having cross-origin imports, and many browsers block script access to cross-origin stylesheets. See https://github.com/gregnb/react-to-print/issues/429 for details. You may be able to load the sheet by both marking the stylesheet with the cross `crossorigin` attribute, and setting the `Access-Control-Allow-Origin` header on the server serving the stylesheet. Alternatively, host the stylesheet on your domain to avoid this issue entirely.",N],"warning")}i.setAttribute("id",`vue-to-print-${_}`),E&&i.setAttribute("nonce",E),i.appendChild(x.createTextNode(M)),x.head.appendChild(i)}}else if(N.getAttribute("href"))if(N.hasAttribute("disabled"))u(["`vue-to-print` encountered a <link> tag with a `disabled` attribute and will ignore it. Note that the `disabled` attribute is deprecated, and some browsers ignore it. You should stop using it. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-disabled. The <link> is:",N],"warning"),n(N);else{const i=x.createElement(N.tagName);for(let h=0,M=N.attributes.length;h<M;++h){const V=N.attributes[h];V&&i.setAttribute(V.nodeName,V.nodeValue||"")}i.onload=()=>n(i),i.onerror=(h,M,V,F,fe)=>n(i,["Failed to load",i,"Error:",fe]),E&&i.setAttribute("nonce",E),x.head.appendChild(i)}else u(["`vue-to-print` encountered a <link> tag with an empty `href` attribute. In addition to being invalid HTML, this can cause problems in many browsers, and so the <link> was not loaded. The <link> is:",N],"warning"),n(N)}}}Be(v),(t===0||!w)&&c(v)}),y(!0),document.body.appendChild(v)}),y=l=>{const{removeAfterPrint:r}=e;if(l||r){const w=document.getElementById("printWindow");w&&document.body.removeChild(w)}},u=(l,r="error")=>{const{suppressErrors:w}=e;w||(r==="error"?console.error(l):r==="warning"?console.warn(l):r==="debug"&&console.debug(l))};return{handlePrint:k}}const it={class:"container dark"},st={class:"flex",style:{"flex-wrap":"wrap-reverse"}},lt={class:"timetable",spellcheck:"false"},rt={key:0,span:"1",style:{width:"0"}},at={key:1,span:"1",style:{width:"0"}},dt={key:2,span:"1",style:{width:"0"}},ut={key:0,nowrap:"",contenteditable:""},ct={key:1,nowrap:"",contenteditable:""},mt={key:2,nowrap:"",contenteditable:""},pt=["onContextmenu"],ft={nowrap:"",contenteditable:""},ht={nowrap:"",contenteditable:""},gt={key:0,nowrap:"",contenteditable:"",class:"translucent"},yt=["onDblclick"],bt={key:2},vt={nowrap:""},wt={key:0,class:"double-usherout"},Tt={key:1,class:"long-gap"},kt={key:2,class:"plf-overlap"},St={contenteditable:"",class:"credits-time"},xt={key:0,class:"post-credits"},_t={key:3,nowrap:"",contenteditable:"",class:"translucent"},Et={key:4,nowrap:"",contenteditable:"",class:"translucent",style:{"font-weight":"normal","font-style":"normal"}},Ct={key:5,nowrap:"",contenteditable:""},At={style:{float:"right"}},Nt={key:6,nowrap:"",contenteditable:""},Pt={class:"footer"},jt=["disabled"],Dt={key:0},Lt={key:0},Mt={key:1},Vt={key:0},Rt={key:1},Ht={class:"buttons",style:{display:"flex","flex-direction":"column",gap:"16px","align-items":"stretch","margin-top":"auto",position:"sticky",bottom:"16px","padding-left":"16px","padding-right":"16px"}},Ut={key:1},It=me({__name:"TimetableView",setup(e){const{table:t}=Pe(),o={mainTime:{header:"Start",title:"Start hoofdfilm",optional:!0},endTime:{header:"Einde",title:"Einde voorstelling",optional:!0},nextStartTime:{header:"Volgende",title:"Volgende inloop",optional:!0}},d=Object.fromEntries(Object.entries(o).filter(([,j])=>j.optional)),f=W(!0),c=Y("optional-columns",{mainTime:!1,endTime:!1,nextStartTime:!1}),k=Y("plf-time-before",17),g=Y("short-gap-interval",10),y=Y("long-gap-interval",35),u=Y("post-credits-films",new Set);for(;u.value.size>20;)u.value.delete(Array.from(u.value)[0]);const l=W(null),r=W(null),w=W(!1),A=W(0),D=W(0),E=W({}),L=W(0);function v(j,n,S){j.preventDefault(),document.activeElement.blur(),w.value=!0,E.value=n,L.value=S,A.value=j.clientX,D.value=j.clientY}function B(){_e(()=>w.value=!1)}const U=ke(()=>{let j=t.map((n,S)=>{var x,I,C;let b=n;return b.overlapWithPlf=t.filter(_=>{var $;return($=_.auditorium)==null?void 0:$.includes("4DX")}).some(_=>b.creditsTime.getTime()-_.scheduledTime.getTime()>=k.value*-6e4&&b.creditsTime.getTime()-_.mainShowTime.getTime()<=0),b.hasPostCredits=u.value.has((x=b.title)==null?void 0:x.trim()),b.timeToNextUsherout=((I=t[S+1])==null?void 0:I.creditsTime.getTime())-(b.hasPostCredits?b.endTime:b.creditsTime).getTime(),b.nextStartTime=(C=t.find((_,$)=>$>S&&_.auditorium===b.auditorium))==null?void 0:C.scheduledTime,b});return j.filter(n=>{var S;return(S=n.auditorium)==null?void 0:S.includes("4DX")}).slice(1).forEach(n=>{let S;for(let b=0;b<j.length;b++)if(j[b].creditsTime.getTime()-n.scheduledTime.getTime()>0){S=b-1;break}j[S].isNearPlf=!0}),j||[]}),{handlePrint:Q}=ot({content:()=>l.value,documentTitle:"Tijdenlijstje "+G(new Date,"MM/dd/yyyy")});return(j,n)=>{const S=je,b=De,x=be,I=ye,C=ge,_=Se,$=ve,N=Le;return m(),p(J,null,[s("main",it,[H(S),U.value.length>0?(m(),p("section",{key:0,id:"edit",ref_key:"editSection",ref:r},[s("div",st,[s("div",null,[n[20]||(n[20]=s("h2",null,"Tijdenlijstje bewerken",-1)),s("div",{id:"print-component",ref_key:"printComponent",ref:l},[s("table",lt,[s("colgroup",null,[n[6]||(n[6]=s("col",{span:"1",style:{width:"0"}},null,-1)),n[7]||(n[7]=s("col",{span:"1",style:{width:"0"}},null,-1)),n[8]||(n[8]=s("col",{span:"1",style:{width:"16%"}},null,-1)),a(c).mainTime?(m(),p("col",rt)):P("",!0),n[9]||(n[9]=s("col",{span:"1",style:{width:"28%"}},null,-1)),a(c).endTime?(m(),p("col",at)):P("",!0),a(c).nextStartTime?(m(),p("col",dt)):P("",!0),n[10]||(n[10]=s("col",{span:"1",style:{width:"50%"}},null,-1)),n[11]||(n[11]=s("col",{span:"1",style:{width:"0"}},null,-1))]),s("thead",null,[s("tr",null,[n[12]||(n[12]=s("td",{nowrap:"",contenteditable:"",width:"1px"},"Zaal",-1)),n[13]||(n[13]=s("td",{nowrap:"",contenteditable:""},"Inloop",-1)),a(c).mainTime?(m(),p("td",ut,T(o.mainTime.header),1)):P("",!0),n[14]||(n[14]=s("td",{nowrap:"",contenteditable:""},null,-1)),n[15]||(n[15]=s("td",{nowrap:"",contenteditable:""},"Aftiteling",-1)),a(c).endTime?(m(),p("td",ct,T(o.endTime.header),1)):P("",!0),a(c).nextStartTime?(m(),p("td",mt,T(o.nextStartTime.header),1)):P("",!0),n[16]||(n[16]=s("td",{nowrap:"",contenteditable:""},"Film",-1)),n[17]||(n[17]=s("td",{nowrap:"",contenteditable:""},null,-1))])]),(m(!0),p(J,null,te(U.value,(i,h)=>{var M;return Ee((m(),p("tr",{class:q({targeting:w.value&&L.value===h,italic:(M=i.auditorium)==null?void 0:M.includes("4DX"),bold:i.featureRating==="16"||i.featureRating==="18"}),onContextmenu:Ae(V=>v(V,i,h),["prevent"])},[s("td",ft,T(i.auditorium==="PULR 8"||i.auditorium==="Rooftop"?"RT":i.auditorium.replace(/^\w+\s/,"")),1),s("td",ht,T(a(G)(i.scheduledTime,"HH:mm")),1),a(c).mainTime?(m(),p("td",gt,T(a(G)(i.mainShowTime,"HH:mm:ss")),1)):P("",!0),h!==U.value.length-1?(m(),p("td",{key:1,nowrap:"",contenteditable:"",class:q(["special-cell",{"intermission-checkbox":!!i.intermissionAfter}]),onDblclick:V=>U.value.at(h).intermissionAfter=!i.intermissionAfter},T(i.isNearPlf?"4DX":" "),43,yt)):(m(),p("td",bt)),s("td",vt,[i.timeToNextUsherout<=a(g)*6e4?(m(),p("div",wt)):P("",!0),i.timeToNextUsherout>=a(y)*6e4&&a(y)>0?(m(),p("div",Tt)):P("",!0),i.overlapWithPlf?(m(),p("div",kt)):P("",!0),s("span",St,[O(T(a(G)(i.creditsTime,"HH:mm:ss"))+" ",1),i.hasPostCredits?(m(),p("span",xt,"+"+T(Math.round((i.endTime.getTime()-i.creditsTime.getTime())/6e4)),1)):P("",!0)])]),a(c).endTime?(m(),p("td",_t,T(a(G)(i.endTime,"HH:mm:ss")),1)):P("",!0),a(c).nextStartTime?(m(),p("td",Et,T(i.nextStartTime?a(G)(i.nextStartTime,"HH:mm"):"-"),1)):P("",!0),f.value?(m(),p("td",Ct,[s("span",null,T(i.title),1),s("span",At,T(i.extras.join(" ")),1)])):(m(),p("td",Nt,T(i.playlist),1)),s("td",{nowrap:"",contenteditable:"",style:{"text-align":"end"},class:q({translucent:i.featureRating!=="16"&&i.featureRating!=="18"})},T(i.featureRating),3)],42,pt)),[[Ce,h!=0]])}),256))]),n[18]||(n[18]=s("br",null,null,-1)),n[19]||(n[19]=s("span",{class:"custom-content",contenteditable:""},null,-1)),s("div",Pt," gegenereerd op "+T(new Date().toLocaleDateString("nl-NL",{weekday:"short",day:"numeric",month:"short",year:"numeric"}))+" om "+T(new Date().toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"}))+" • Pathé Tools • Quinten Althues ",1)],512)]),H($,{style:{"flex-basis":"229px"}},{default:R(()=>[H(C,null,{default:R(()=>[H(I,{value:"Opties"},{default:R(()=>[s("fieldset",null,[n[22]||(n[22]=s("legend",null,"Weergave",-1)),H(b,{modelValue:f.value,"onUpdate:modelValue":n[0]||(n[0]=i=>f.value=i),identifier:"splitExtra"},{default:R(()=>n[21]||(n[21]=[O(" Extra informatie scheiden van filmtitel ")])),_:1},8,["modelValue"])]),s("fieldset",{disabled:!U.value.some(i=>{var h;return(h=i.auditorium)==null?void 0:h.includes("4DX")})},[n[24]||(n[24]=s("legend",null,"4DX-inloop",-1)),n[25]||(n[25]=s("small",null,"Uitlopen tijdens de 4DX-inloop worden gemarkeerd met een streeplijntje.",-1)),H(x,{modelValue:a(k),"onUpdate:modelValue":n[1]||(n[1]=i=>Z(k)?k.value=i:null),modelModifiers:{number:!0},identifier:"plfTimeBefore",min:"0",max:"30",unit:"min",disabled:!U.value.some(i=>{var h;return(h=i.auditorium)==null?void 0:h.includes("4DX")})},{default:R(()=>[n[23]||(n[23]=O(" Tijd voor aanvang ")),a(k)>0?(m(),p("small",Dt,"De 4DX-inloop begint "+T(a(k))+" minuten voor de aanvangstijd en eindigt wanneer de hoofdfilm begint.",1)):P("",!0)]),_:1},8,["modelValue","disabled"])],8,jt),s("fieldset",null,[n[28]||(n[28]=s("legend",null,"Uitloop",-1)),H(x,{modelValue:a(g),"onUpdate:modelValue":n[2]||(n[2]=i=>Z(g)?g.value=i:null),modelModifiers:{number:!0},identifier:"shortGapInterval",min:"0",max:"20",unit:"min"},{default:R(()=>[n[26]||(n[26]=O("Interval voor dubbele uitloop ")),a(g)>0?(m(),p("small",Lt," Uitlopen met minder dan "+T(a(g))+" minuten ertussen krijgen een boogje ",1)):(m(),p("small",Mt,"Uitlopen met weinig tijd ertussen worden niet gemarkeerd"))]),_:1},8,["modelValue"]),H(x,{modelValue:a(y),"onUpdate:modelValue":n[3]||(n[3]=i=>Z(y)?y.value=i:null),modelModifiers:{number:!0},identifier:"longGapInterval",min:"20",max:"80",unit:"min"},{default:R(()=>[n[27]||(n[27]=O("Interval voor gat tussen uitlopen ")),a(y)>0?(m(),p("small",Vt,"Gaten van meer dan "+T(a(y))+" minuten krijgen een stippellijntje ",1)):(m(),p("small",Rt,"Uitlopen met veel tijd ertussen worden niet gemarkeerd"))]),_:1},8,["modelValue"]),n[29]||(n[29]=s("small",null," Bij uitlopen met post-credits-scènes wordt de tijd 'Einde voorstelling' gebruikt voor het berekenen van de tijd tot de volgende uitloop. ",-1))])]),_:1}),H(I,{value:"Kolommen"},{default:R(()=>[(m(!0),p(J,null,te(a(d),(i,h)=>(m(),ne(b,{modelValue:a(c)[h],"onUpdate:modelValue":M=>a(c)[h]=M,identifier:String(h)},{default:R(()=>[O(T(o[h].title),1)]),_:2},1032,["modelValue","onUpdate:modelValue","identifier"]))),256))]),_:1})]),_:1}),s("div",Ht,[H(_,{onClick:a(Q)},{default:R(()=>n[30]||(n[30]=[O(" Afdrukken")])),_:1},8,["onClick"])])]),_:1})])],512)):(m(),p("section",Ut,n[31]||(n[31]=[s("h2",null,"Tijdenlijstje bewerken",-1),s("p",null,"Upload eerst een bestand.",-1)])))]),H(xe,null,{default:R(()=>[w.value?(m(),ne(N,{key:0,class:"dark",x:A.value,y:D.value,onClickOutside:B},{default:R(()=>{var i;return[s("button",{onClick:n[4]||(n[4]=h=>{U.value.at(L.value).intermissionAfter=!E.value.intermissionAfter,B()})},[s("div",{class:q(["check",{empty:!U.value.at(L.value).intermissionAfter}])},null,2),n[32]||(n[32]=O(" Selectievakje onder deze rij "))]),s("button",{onClick:n[5]||(n[5]=h=>{var M,V,F;a(u).has((M=E.value.title)==null?void 0:M.trim())?a(u).delete((V=E.value.title)==null?void 0:V.trim()):a(u).add((F=E.value.title)==null?void 0:F.trim()),B()})},[s("div",{class:q(["check",{empty:!a(u).has((i=E.value.title)==null?void 0:i.trim())}])},null,2),O(" Post-credits-scène bij "+T(E.value.title),1)])]}),_:1},8,["x","y"])):P("",!0)]),_:1})],64)}}}),Bt=Ne(It,[["__scopeId","data-v-555ab462"]]);export{Bt as default};
