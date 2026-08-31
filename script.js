const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);


/* FONDO */

const body=document.body,canvas=$("#bg-particles"),ctx=canvas.getContext("2d");
let W,H,particles=[],mouse={x:null,y:null};

function resize(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);

  canvas.width=W*dpr;canvas.height=H*dpr;
  canvas.style.width=W+"px";canvas.style.height=H+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);

  particles=Array.from(
    {length:Math.min(45,Math.max(18,Math.round(W*H/60000)))},
    ()=>({
      x:Math.random()*W,y:Math.random()*H,r:5+Math.random()*18,
      vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,
      a:.03+Math.random()*.06
    })
  );
}

function drawParticles(){
  ctx.clearRect(0,0,W,H);

  particles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;

    if(mouse.x!==null){
      const dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.hypot(dx,dy);

      if(d<150&&d){
        const f=(150-d)/120;
        p.x+=dx/d*f;p.y+=dy/d*f;
      }
    }

    if(p.x<0)p.x=W;if(p.x>W)p.x=0;
    if(p.y<0)p.y=H;if(p.y>H)p.y=0;

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(75,87,245,${p.a})`;
    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}

addEventListener("pointermove",e=>{
  mouse={x:e.clientX,y:e.clientY};

  const x=e.clientX/innerWidth,y=e.clientY/innerHeight;

  body.style.setProperty("--mx",`${x*100}%`);
  body.style.setProperty("--my",`${y*100}%`);
  body.style.setProperty("--h1",205+x*100);
  body.style.setProperty("--h2",290-y*95);
});


/* MENU */

const toggle=$("#menu-toggle"),mobile=$("#mobile-menu");

toggle.onclick=()=>{
  const open=mobile.classList.toggle("open");
  toggle.classList.toggle("open",open);
};

mobile.querySelectorAll("a").forEach(a=>a.onclick=()=>{
  mobile.classList.remove("open");
  toggle.classList.remove("open");
});


/* EMAIL */

const copy=$("#copy-btn");

copy.onclick=async()=>{
  await navigator.clipboard.writeText("vichecvarlop10@gmail.com");

  copy.textContent="¡Copiado!";
  copy.classList.add("copied");

  setTimeout(()=>{
    copy.textContent="Copiar email";
    copy.classList.remove("copied");
  },1600);
};


/* REVEAL */

const reveal=new IntersectionObserver(
  entries=>entries.forEach(e=>
    e.target.classList.toggle("in-view",e.isIntersecting)
  ),
  {threshold:.15,rootMargin:"-5% 0px -5%"}
);

$$(".reveal").forEach(el=>reveal.observe(el));


/* NAV ACTIVO */

const nav=[...$$("#nav-links [data-nav]")];
const sections=nav.map(a=>document.getElementById(a.dataset.nav)).filter(Boolean);

function updateNav(){
  const line=$("header").offsetHeight+30;
  let active=null;

  sections.forEach(s=>{
    const r=s.getBoundingClientRect();
    if(r.top<=line&&r.bottom>line)active=s.id;
  });

  nav.forEach(a=>a.classList.toggle("active",a.dataset.nav===active));
}


/* TEXTO INFINITO */

const marquee=$("#marquee-track");
const marqueeHTML=marquee.innerHTML;

let textWidth=0,textX=0,textLast=0;

function buildMarquee(){
  marquee.innerHTML=marqueeHTML;
  textWidth=marquee.scrollWidth;

  while(marquee.scrollWidth<innerWidth*2+textWidth)
    marquee.insertAdjacentHTML("beforeend",marqueeHTML);
}

function moveMarquee(t){
  if(!textLast)textLast=t;

  const dt=Math.min((t-textLast)/1000,.05);
  textLast=t;

  textX-=42*dt;
  if(textX<=-textWidth)textX+=textWidth;

  marquee.style.transform=`translate3d(${textX}px,0,0)`;
  requestAnimationFrame(moveMarquee);
}


/* CARRUSEL INFINITO */

const viewport=$("#featured-carousel");
const track=$(".featured-track");
const group=$(".featured-group");

let carX=0,groupWidth=0,lastCar=0;
let dragging=false,startX=0,startPos=0;

const speed=38;


/* suficientes copias para llenar cualquier pantalla */

for(let i=0;i<3;i++){
  const clone=group.cloneNode(true);
  clone.setAttribute("aria-hidden","true");
  track.appendChild(clone);
}

function measureCarousel(){
  groupWidth=group.getBoundingClientRect().width;
}

function normalizeCarousel(){
  while(carX<=-groupWidth)carX+=groupWidth;
  while(carX>0)carX-=groupWidth;
}

function moveCarousel(t){
  if(!lastCar)lastCar=t;

  const dt=Math.min((t-lastCar)/1000,.03);
  lastCar=t;

  if(!dragging){
    carX-=speed*dt;
    normalizeCarousel();
  }

  track.style.transform=`translate3d(${carX}px,0,0)`;

  requestAnimationFrame(moveCarousel);
}


/* ARRASTRAR */

viewport.onpointerdown=e=>{
  dragging=true;
  startX=e.clientX;
  startPos=carX;
  viewport.setPointerCapture(e.pointerId);
};

viewport.onpointermove=e=>{
  if(!dragging)return;

  carX=startPos+e.clientX-startX;
  normalizeCarousel();
};

viewport.onpointerup=
viewport.onpointercancel=()=>{
  dragging=false;
};


/* FLECHAS */

$("#carousel-next").onclick=()=>{
  carX-=362;
  normalizeCarousel();
};

$("#carousel-prev").onclick=()=>{
  carX+=362;
  normalizeCarousel();
};


/* IMAGENES QUE NO EXISTEN */

$$(".featured-card img").forEach(img=>
  img.onerror=()=>img.style.display="none"
);


/* EVENTOS */

addEventListener("scroll",updateNav,{passive:true});

addEventListener("resize",()=>{
  resize();
  measureCarousel();
  updateNav();
});


/* INICIO */

resize();
measureCarousel();
updateNav();
buildMarquee();

requestAnimationFrame(drawParticles);
requestAnimationFrame(moveMarquee);
requestAnimationFrame(moveCarousel);

/* CONTACTO */

$("#contact-form").onsubmit=e=>{
  e.preventDefault();

  const name=$("#contact-name").value;
  const email=$("#contact-email").value;
  const message=$("#contact-message").value;

  const subject=encodeURIComponent(`Proyecto — ${name}`);
  const text=encodeURIComponent(
    `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`
  );

  location.href=
    `mailto:vichecvarlop10@gmail.com?subject=${subject}&body=${text}`;
};