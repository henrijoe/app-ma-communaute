import{a as R,g as _,aw as k,s as M,_ as o,ax as g,r as S,u as j,b as A,j as l,c as U,d as $,V as d}from"./index-DFfiNW5u.js";import{a as E}from"./Stack-GfhaT0QH.js";function P(t){return String(t).match(/[\d.\-+]*\s*(.*)/)[1]||""}function B(t){return parseFloat(t)}function I(t){return R("MuiSkeleton",t)}_("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);const L=["animation","className","component","height","style","variant","width"];let r=t=>t,m,f,v,b;const X=t=>{const{classes:a,variant:e,animation:s,hasChildren:n,width:c,height:i}=t;return $({root:["root",e,s,n&&"withChildren",n&&!c&&"fitContent",n&&!i&&"heightAuto"]},I,a)},z=k(m||(m=r`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`)),N=k(f||(f=r`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`)),V=M("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(t,a)=>{const{ownerState:e}=t;return[a.root,a[e.variant],e.animation!==!1&&a[e.animation],e.hasChildren&&a.withChildren,e.hasChildren&&!e.width&&a.fitContent,e.hasChildren&&!e.height&&a.heightAuto]}})(({theme:t,ownerState:a})=>{const e=P(t.shape.borderRadius)||"px",s=B(t.shape.borderRadius);return o({display:"block",backgroundColor:t.vars?t.vars.palette.Skeleton.bg:E(t.palette.text.primary,t.palette.mode==="light"?.11:.13),height:"1.2em"},a.variant==="text"&&{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${s}${e}/${Math.round(s/.6*10)/10}${e}`,"&:empty:before":{content:'"\\00a0"'}},a.variant==="circular"&&{borderRadius:"50%"},a.variant==="rounded"&&{borderRadius:(t.vars||t).shape.borderRadius},a.hasChildren&&{"& > *":{visibility:"hidden"}},a.hasChildren&&!a.width&&{maxWidth:"fit-content"},a.hasChildren&&!a.height&&{height:"auto"})},({ownerState:t})=>t.animation==="pulse"&&g(v||(v=r`
      animation: ${0} 2s ease-in-out 0.5s infinite;
    `),z),({ownerState:t,theme:a})=>t.animation==="wave"&&g(b||(b=r`
      position: relative;
      overflow: hidden;

      /* Fix bug in Safari https://bugs.webkit.org/show_bug.cgi?id=68196 */
      -webkit-mask-image: -webkit-radial-gradient(white, black);

      &::after {
        animation: ${0} 2s linear 0.5s infinite;
        background: linear-gradient(
          90deg,
          transparent,
          ${0},
          transparent
        );
        content: '';
        position: absolute;
        transform: translateX(-100%); /* Avoid flash during server-side hydration */
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
      }
    `),N,(a.vars||a).palette.action.hover)),K=S.forwardRef(function(a,e){const s=j({props:a,name:"MuiSkeleton"}),{animation:n="pulse",className:c,component:i="span",height:h,style:C,variant:x="text",width:w}=s,u=A(s,L),p=o({},s,{animation:n,component:i,variant:x,hasChildren:!!u.children}),y=X(p);return l.jsx(V,o({as:i,ref:e,className:U(y.root,c),ownerState:p},u,{style:o({width:w,height:h},C)}))}),W=d(l.jsx("path",{d:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"}),"ArrowBack"),D=d(l.jsx("path",{d:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"}),"Edit"),O=d(l.jsx("path",{d:"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"}),"Person");export{W as A,D as E,O as P,K as S};
