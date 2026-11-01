import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {CubicBezierCurve3, Vector3, BufferGeometry, LineDashedMaterial, Line, Object3D, AdditiveBlending, Euler} from 'three';
import type {Group, Mesh, ShaderMaterial, MeshBasicMaterial, InstancedMesh} from 'three';
import {gsap} from 'gsap';


type Flow = {assessment:number; factors:number; mood:number; pulse:number; recommendation:number; selected:number; channel:number; yaw:number; pitch:number; boost:number; dragging:boolean; visible:boolean; invalidate:()=>void};
const origins: [number,number,number][] = [[-2.3,1.1,0],[-2.35,-.05,0],[2.2,-1.25,0]];
const keys = ['assessment','factors','mood'] as const;
const vertexShader = `
 uniform float uTime;
 varying vec3 vNormal;
 varying vec3 vView;
 varying vec3 vPosition;
 void main(){
   float wave=sin(position.y*5.0+uTime*.45)*sin(position.x*4.0-uTime*.3)*.025;
   vec3 transformed=position+normal*wave;
   vPosition=transformed;
   vNormal=normalize(normalMatrix*normal);
   vec4 view=modelViewMatrix*vec4(transformed,1.0);
   vView=-view.xyz;
   gl_Position=projectionMatrix*view;
 }`;
const fragmentShader = `
 uniform float uTime;
 uniform float uPulse;
 uniform float uContext;
 uniform float uSelected;
 varying vec3 vNormal;
 varying vec3 vView;
 varying vec3 vPosition;
 void main(){
   vec3 n=normalize(vNormal);
   float light=max(0.0,dot(n,normalize(vec3(-.6,.8,1.2))));
   float rim=pow(1.0-max(0.0,dot(n,normalize(vView))),2.2);
   vec3 mint=vec3(.70,.89,.74);
   vec3 aqua=vec3(.49,.89,.82);
   vec3 keyLight=normalize(vec3(-.42+sin(uTime*.32)*.12,.55,1.0));
   float gloss=pow(max(0.0,dot(n,keyLight)),24.0);
   float hotspot=pow(max(0.0,dot(n,keyLight)),115.0);
   float sheen=pow(max(0.0,dot(n,normalize(vec3(.7,-.5,.6)))),18.0);
   float reflected=pow(max(0.0,dot(n,normalize(vec3(.7,-.8,.2)))),6.0);
   vec3 p=normalize(vPosition);
   float drift=uTime*.16;
   float cloud=sin(p.x*5.0+sin(p.y*4.0+drift)*1.8+p.z*3.0-drift);
   float current=sin(p.y*11.0+sin(p.z*7.0-drift)*2.0+cloud*2.1);
   float filaments=pow(.5+.5*current,12.0);
   float fine=pow(.5+.5*sin(p.x*22.0+p.z*14.0+cloud*3.0+drift),24.0);
   vec3 color=mix(vec3(.015,.055,.12),vec3(.07,.38,.36),smoothstep(-.8,.9,cloud)*.7+light*.25);
   color+=aqua*filaments*(.24+light*.2)+mint*fine*.11;
   color+=mint*rim*.8+vec3(.9,1.0,.95)*(gloss*.65+hotspot*1.5)+aqua*(reflected*.18+sheen*.3);
   color+=mint*uPulse*.18;
   gl_FragColor=vec4(color,1.0);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
 }`;

const shellFragmentShader=`
 varying vec3 vNormal;
 varying vec3 vView;
 void main(){
   float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),3.0);
   gl_FragColor=vec4(.49,.89,.82,rim*.38);
   #include <colorspace_fragment>
 }`;

function InputStream({index,flow}:{index:number;flow:Flow}) {
 const particles=useRef<InstancedMesh>(null);
 const dot=useRef<MeshBasicMaterial>(null);
 const data=useMemo(()=>{
   const origin=new Vector3(...origins[index]);
   const end=origin.clone().normalize().multiplyScalar(.6);
   const curve=new CubicBezierCurve3(origin,origin.clone().multiplyScalar(.72).add(new Vector3(0,-.25,.35)),end.clone().add(new Vector3(index===0?.3:-.3,.2,.25)),end);
   const line=new Line(new BufferGeometry().setFromPoints(curve.getPoints(70)),new LineDashedMaterial({dashSize:.085,gapSize:.075,color:'#7cb7bd',transparent:true,opacity:.17}));
   line.computeLineDistances();
   return {curve,line,dummy:new Object3D()};
 },[index]);
 useEffect(()=>()=>{data.line.geometry.dispose();(data.line.material as LineDashedMaterial).dispose();},[data]);
 useFrame(()=>{
   const progress=flow[keys[index]];
   (data.line.material as LineDashedMaterial).opacity=(flow.channel===index?.4:.15)+Math.sin(progress*Math.PI)*.15;
   if(dot.current) dot.current.color.set(progress>=.99?'#b3e4bd':'#638ea4');
   if(!particles.current)return;
   for(let i=0;i<24;i++){
     const t=progress*1.5-i*.021;
     const active=t>0&&t<1;
     data.dummy.position.copy(data.curve.getPoint(Math.max(0,Math.min(1,t))));
     data.dummy.scale.setScalar(active?(.014+(.024-i*.0005)):0);
     data.dummy.updateMatrix();particles.current.setMatrixAt(i,data.dummy.matrix);
   }
   particles.current.instanceMatrix.needsUpdate=true;
 });
 return <group><primitive object={data.line}/><mesh position={origins[index]}><sphereGeometry args={[.055,16,12]}/><meshBasicMaterial ref={dot} color="#638ea4" toneMapped={false}/></mesh><instancedMesh ref={particles} args={[undefined,undefined,24]} frustumCulled={false}><sphereGeometry args={[1,8,6]}/><meshBasicMaterial color="#b3e4bd" transparent opacity={.85} toneMapped={false}/></instancedMesh></group>;
}
const ringAngles: [number,number,number][]=[[1.16,.12,-.3],[.4,1.08,.5],[1.9,.7,-.4]];
function Orbit({index,flow,reduced}:{index:number;flow:Flow;reduced:boolean}){
 const line=useRef<MeshBasicMaterial>(null);
 const sparks=useRef<InstancedMesh>(null);
 const data=useMemo(()=>({dummy:new Object3D(),angle:new Euler(...ringAngles[index])}),[index]);
 useFrame((state)=>{
   if(line.current)line.current.opacity=flow.channel===index?.95:.55;
   if(!sparks.current)return;
   for(let i=0;i<20;i++){
     const t=i*2.39996+((reduced?0:state.clock.elapsedTime)*.12)*(index%2?-1:1);
     const r=1.25+index*.17+(i%3===0?.09:0);
     data.dummy.position.set(Math.cos(t)*r,Math.sin(t)*r,0).applyEuler(data.angle);
     data.dummy.scale.setScalar(i%5===0?.025:.011);
     data.dummy.updateMatrix();sparks.current.setMatrixAt(i,data.dummy.matrix);
   }
   sparks.current.instanceMatrix.needsUpdate=true;
 });
 return <><group rotation={ringAngles[index]}><mesh><torusGeometry args={[1.25+index*.17,.009,6,160]}/><meshBasicMaterial ref={line} color={index===1?'#9bc7ed':'#7de2d1'} transparent opacity={.5} toneMapped={false}/></mesh><mesh><torusGeometry args={[1.25+index*.17,.021,6,160]}/><meshBasicMaterial color="#7de2d1" transparent opacity={.12} depthWrite={false} blending={AdditiveBlending}/></mesh></group><instancedMesh ref={sparks} args={[undefined,undefined,20]} frustumCulled={false}><sphereGeometry args={[1,8,6]}/><meshBasicMaterial color="#c6f5e7" toneMapped={false}/></instancedMesh></>;
}
function OrbScene({flow,reduced}:{flow:Flow;reduced:boolean}){
 const group=useRef<Group>(null),material=useRef<ShaderMaterial>(null),pulse=useRef<Mesh>(null),pulseMaterial=useRef<MeshBasicMaterial>(null);
 const {invalidate,size}=useThree();
 const spin=useRef(0);
 const uniforms=useMemo(()=>({uTime:{value:0},uPulse:{value:0},uContext:{value:0},uSelected:{value:0}}),[]);
 useEffect(()=>{flow.invalidate=invalidate;return()=>{flow.invalidate=()=>{};};},[flow,invalidate]);
 useFrame((state,delta)=>{
   const time=reduced?0:state.clock.elapsedTime;
   if(!reduced&&!flow.dragging)spin.current+=Math.min(delta,.05)*.055;
   if(group.current){
     group.current.position.y=Math.sin(time*.6)*.04;
     const ease=reduced?1:1-Math.exp(-delta*9);
     group.current.rotation.y+=(flow.yaw+spin.current-group.current.rotation.y)*ease;
     group.current.rotation.x+=(flow.pitch-group.current.rotation.x)*ease;
   }
   if(material.current){const u=material.current.uniforms;u.uTime.value=time;u.uPulse.value=Math.sin(flow.pulse*Math.PI)*.5+flow.boost;}
   if(pulse.current)pulse.current.scale.setScalar(.78+flow.pulse*.8+flow.boost*.22);
   if(pulseMaterial.current)pulseMaterial.current.opacity=Math.sin(flow.pulse*Math.PI)*.09+flow.boost*.08;
 });
 const scale=Math.min(1,size.width/size.height*.88);
 return <group scale={scale}>
  {[2.05,2.6].map(r=><mesh key={r} position={[0,0,-1]}><torusGeometry args={[r,.003,4,140]}/><meshBasicMaterial color="#7da6b7" transparent opacity={.085}/></mesh>)}
  <group ref={group}><mesh><sphereGeometry args={[.73,64,48]}/><shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}/></mesh><mesh><sphereGeometry args={[.785,48,32]}/><shaderMaterial vertexShader={vertexShader} fragmentShader={shellFragmentShader} uniforms={uniforms} transparent depthWrite={false} blending={AdditiveBlending}/></mesh><group rotation={[.65,.35,.4]}><mesh><torusGeometry args={[.81,.005,6,120,Math.PI*1.4]}/><meshBasicMaterial color="#b3e4bd" transparent opacity={.6} toneMapped={false}/></mesh></group><group rotation={[1.8,.8,-.6]}><mesh><torusGeometry args={[.82,.004,6,120,Math.PI*1.1]}/><meshBasicMaterial color="#7de2d1" transparent opacity={.45} toneMapped={false}/></mesh></group>{ringAngles.map((_,i)=><Orbit key={i} index={i} flow={flow} reduced={reduced}/>)}</group>
  <mesh ref={pulse}><sphereGeometry args={[1,40,24]}/><meshBasicMaterial ref={pulseMaterial} color="#b3e4bd" transparent opacity={0} depthWrite={false} blending={AdditiveBlending}/></mesh>{origins.map((_,i)=><InputStream key={i} index={i} flow={flow}/>)}</group>;
}
class OrbBoundary extends React.Component<{children:React.ReactNode;host:HTMLElement},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.host.closest('.guidance-orb')?.classList.remove('is-ready');this.props.host.closest('.guidance-orb')?.classList.add('orb-static');this.props.host.closest('.ai-section')?.querySelector('.orb-recommendation')?.removeAttribute('style');}
 render(){return this.state.failed?null:this.props.children;}
}
function AdaptiveOrb({host}:{host:HTMLElement}){
 const flow=useMemo<Flow>(()=>({assessment:0,factors:0,mood:0,pulse:0,recommendation:0,channel:0,yaw:0,pitch:0,boost:0,dragging:false,selected:Number(host.dataset.factor||0),visible:false,invalidate:()=>{}}),[host]);
 const [active,setActive]=useState(false),[reduced,setReduced]=useState(matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{
   const section=host.closest<HTMLElement>('.ai-section')!;
   const inputs=[...section.querySelectorAll<HTMLElement>('.orb-input')];
   const example=section.querySelector<HTMLElement>('.orb-recommendation')!;
   let pinned=false;
   const pin=()=>{pinned=true;update();};
   const media=gsap.matchMedia();
   const update=()=>{
     inputs.forEach((input,i)=>{
       input.classList.toggle('is-connected',flow[keys[i]]>=.99);
       input.classList.toggle('is-receiving',flow[keys[i]]>0&&flow[keys[i]]<.99);
     });
     const amount=pinned?1:flow.recommendation;
     example.style.opacity=String(amount);
     example.style.visibility=amount>.001?'visible':'hidden';
     example.style.transform=`translateY(${(1-amount)*14}px) scale(${.97+amount*.03})`;
     example.style.filter=`blur(${(1-amount)*3}px)`;
     if(flow.visible)flow.invalidate();
   };
   let sequence:gsap.core.Timeline|undefined;
   media.add('(prefers-reduced-motion: no-preference)',()=>{
     setReduced(false);
     sequence=gsap.timeline({repeat:-1,repeatDelay:.5,paused:true,onUpdate:update});
     sequence.set(flow,{assessment:0,factors:0,mood:0,pulse:0,recommendation:0})
       .to(flow,{assessment:1,duration:1.5,ease:'power1.inOut'},.5)
       .to(flow,{factors:1,duration:1.5,ease:'power1.inOut'},1.2)
       .to(flow,{mood:1,duration:1.5,ease:'power1.inOut'},1.9)
       .fromTo(flow,{pulse:0},{pulse:1,duration:1.3,ease:'sine.out'},3.4)
       .to(flow,{recommendation:1,duration:.7,ease:'expo.out'},3.7)
       .to(flow,{recommendation:0,duration:.3,ease:'sine.inOut'},9.4);
     if(flow.visible)sequence.play();
     return()=>{sequence?.kill();sequence=undefined;};
   });
   media.add('(prefers-reduced-motion: reduce)',()=>{
     setReduced(true);flow.assessment=flow.factors=flow.mood=flow.pulse=flow.recommendation=1;update();
   });
   const charge=()=>{
     if(matchMedia('(prefers-reduced-motion: reduce)').matches){flow.invalidate();return;}
     gsap.fromTo(flow,{boost:0},{boost:1,duration:.4,yoyo:true,repeat:1,ease:'sine.inOut',overwrite:'auto',onUpdate:()=>flow.invalidate()});
   };
   const descriptions=['Your result sets the starting point.','Your stress factors add context.','Your mood adds day-to-day context.'];
   const select=(index:number)=>{
     flow.channel=index;
     inputs.forEach((input,i)=>input.setAttribute('aria-pressed',String(i===index)));
     section.querySelector('#orb-context-description')!.textContent=descriptions[index];
     flow.invalidate();charge();
   };
   const inputHandlers=inputs.map((input,i)=>{const handler=()=>select(i);input.addEventListener('click',handler);return handler;});
   let pointer:{id:number;x:number;y:number;yaw:number;pitch:number;moved:boolean}|undefined;
   const down=(e:PointerEvent)=>{if(e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:flow.yaw,pitch:flow.pitch,moved:false};flow.dragging=true;host.setPointerCapture(e.pointerId);host.classList.add('is-dragging');};
   const move=(e:PointerEvent)=>{
     if(!pointer||e.pointerId!==pointer.id)return;
     const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
     if(e.pointerType==='touch'&&!pointer.moved&&Math.abs(dy)>Math.abs(dx)+8){finish(e);return;}
     if(Math.hypot(dx,dy)>5)pointer.moved=true;
     flow.yaw=pointer.yaw+dx*.008;flow.pitch=Math.max(-.9,Math.min(.9,pointer.pitch+dy*.006));flow.invalidate();
   };
   const finish=(e:PointerEvent)=>{if(!pointer)return;const tapped=!pointer.moved&&e.type==='pointerup';pointer=undefined;flow.dragging=false;host.classList.remove('is-dragging');if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);if(tapped)charge();};
   const reset=()=>{flow.yaw=flow.pitch=0;flow.invalidate();};
   const key=(e:KeyboardEvent)=>{
     if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' ','r','R'].includes(e.key))e.preventDefault();
     if(e.key==='ArrowLeft')flow.yaw-=.2;if(e.key==='ArrowRight')flow.yaw+=.2;
     if(e.key==='ArrowUp')flow.pitch=Math.max(-.9,flow.pitch-.15);if(e.key==='ArrowDown')flow.pitch=Math.min(.9,flow.pitch+.15);
     if(e.key==='Enter'||e.key===' ')charge();if(e.key.toLowerCase()==='r')reset();flow.invalidate();
   };
   const resetButton=section.querySelector<HTMLButtonElement>('[data-orb-reset]')!;
   host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',finish);host.addEventListener('pointercancel',finish);host.addEventListener('keydown',key);resetButton.addEventListener('click',reset);
   let inView=false,sectionInView=false;
   const visibility=()=>{flow.visible=inView&&!document.hidden;setActive(flow.visible);if(sectionInView&&!document.hidden)sequence?.resume();else sequence?.pause();if(flow.visible)flow.invalidate();};
   const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.target===host)inView=entry.isIntersecting;else sectionInView=entry.isIntersecting;});visibility();},{threshold:.01});observer.observe(host);observer.observe(section);
   const factor=(event:Event)=>{pin();flow.selected=(event as CustomEvent<number>).detail;select(1);};
   const demoControls=section.querySelector<HTMLElement>('.ai-demo-controls')!;
   example.addEventListener('focusin',pin);demoControls.addEventListener('focusin',pin);
   host.addEventListener('guidance-factor',factor);document.addEventListener('visibilitychange',visibility);
   return()=>{media.revert();example.removeEventListener('focusin',pin);demoControls.removeEventListener('focusin',pin);example.removeAttribute('style');gsap.killTweensOf(flow);inputs.forEach((input,i)=>input.removeEventListener('click',inputHandlers[i]));host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',finish);host.removeEventListener('pointercancel',finish);host.removeEventListener('keydown',key);resetButton.removeEventListener('click',reset);observer.disconnect();host.removeEventListener('guidance-factor',factor);document.removeEventListener('visibilitychange',visibility);};
 },[flow,host]);
 return <OrbBoundary host={host}><Canvas camera={{position:[0,0,6],fov:42}} dpr={[1,1.6]} frameloop={active&&!reduced?'always':'demand'} gl={{antialias:true,alpha:true,powerPreference:'low-power'}} onCreated={()=>host.closest('.guidance-orb')?.classList.add('is-ready')}><OrbScene flow={flow} reduced={reduced}/></Canvas></OrbBoundary>;
}
export function mountAdaptiveOrb(host:HTMLElement){createRoot(host).render(<AdaptiveOrb host={host}/>);}
