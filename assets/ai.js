(function(){'use strict';
var cfg=window.AUTOWS_AI||{},EP=String(cfg.endpoint||'').replace(/\/+$/,'');
if(EP&&!/^https:\/\//.test(EP)&&!/^http:\/\/(127\.0\.0\.1|localhost)/.test(EP))EP='';
function ask(payload){
 if(!EP)return Promise.reject({code:'no_endpoint'});
 var ctl=typeof AbortController!=='undefined'?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort()},16000);
 return fetch(EP+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctl?ctl.signal:undefined}).then(function(r){
  clearTimeout(to);
  return r.json().catch(function(){return{}}).then(function(j){if(!r.ok)throw{code:j&&j.error||'http',status:r.status};return j})
 },function(){clearTimeout(to);throw{code:'network'}})
}
window.AutowsAI={enabled:!!EP,ask:ask};
if(!EP)return;
/* ---- floating chat: real AI, remembered while browsing ---- */
var form=document.getElementById('aif'),box=document.getElementById('acb'),inp=document.getElementById('ait'),panel=document.getElementById('aipanel'),fab=document.getElementById('aifab'),hd=document.querySelector('.aihd'),closeBtn=document.getElementById('aic');
if(!form||!box||!inp)return;
var GREET="Hi! I'm the Autows AI assistant. Ask me what we automate, how it works, or how to book a call.";
var QS=['What do you automate?','How does the process work?','How do I book a call?'];
var KEY='autows-chat',hist=[],busy=false;
try{hist=JSON.parse(sessionStorage.getItem(KEY)||'[]').filter(function(m){return m&&typeof m.text==='string'&&(m.role==='user'||m.role==='assistant')}).slice(-20)}catch(e){}
function save(){try{sessionStorage.setItem(KEY,JSON.stringify(hist.slice(-20)))}catch(e){}}
function down(){box.scrollTop=box.scrollHeight}
function bub(c,t){var d=document.createElement('div');d.className='m '+c;d.style.whiteSpace='pre-wrap';d.textContent=t;box.appendChild(d);down();return d}
function typing(){var d=document.createElement('div');d.className='m a typing';d.innerHTML='<span></span><span></span><span></span>';box.appendChild(d);down();return d}
function fill(el,t){el.classList.remove('typing');el.textContent=t;down()}
box.setAttribute('aria-live','polite');
var chips=document.createElement('div');chips.className='aichips';box.insertAdjacentElement('afterend',chips);
function showChips(){chips.innerHTML='';if(hist.length)return;QS.forEach(function(q){var b=document.createElement('button');b.type='button';b.textContent=q;b.onclick=function(){send(q)};chips.appendChild(b)})}
function render(){box.innerHTML='';bub('a',GREET);hist.forEach(function(m){bub(m.role==='user'?'u':'a',m.text)});showChips()}
function send(t){
 t=String(t||'').trim();if(!t||busy)return;busy=true;chips.innerHTML='';
 bub('u',t);var wait=typing();
 ask({mode:'site',message:t,history:hist.slice(-10)}).then(function(j){
  var r=String(j&&j.reply||'').trim()||'Sorry, I could not answer that. You can reach the team on WhatsApp: +880 1332 611967.';
  fill(wait,r);hist.push({role:'user',text:t},{role:'assistant',text:r});save();busy=false
 }).catch(function(err){
  fill(wait,err&&err.code==='rate_limited'?'Lots of messages right now. Please try again in a minute.':'I cannot reach the AI right now. You can message the team on WhatsApp: +880 1332 611967.');busy=false
 });
}
form.onsubmit=function(e){e.preventDefault();var t=inp.value;inp.value='';send(t)};
inp.maxLength=400;
if(hd){var nc=document.createElement('button');nc.type='button';nc.className='ainew';nc.textContent='New chat';nc.onclick=function(){hist=[];save();busy=false;render()};hd.insertBefore(nc,closeBtn||null)}
var note=document.createElement('p');note.className='ainote';note.textContent='AI replies can be wrong. Please do not share sensitive information.';form.insertAdjacentElement('afterend',note);
render();
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&panel&&panel.classList.contains('open')&&closeBtn)closeBtn.click()});
/* ---- friendly one-time nudge ---- */
if(fab&&panel){
 var seen=false;try{seen=sessionStorage.getItem('autows-hint')==='1'}catch(e){}
 if(!seen)setTimeout(function(){
  if(panel.classList.contains('open'))return;
  var h=document.createElement('div');h.className='aihint';h.setAttribute('role','status');h.innerHTML='<span>Questions? Ask our AI about Autows.</span><button type="button" aria-label="Dismiss">&#x2715;</button>';
  function kill(){if(h.parentNode)h.parentNode.removeChild(h);try{sessionStorage.setItem('autows-hint','1')}catch(e){}}
  h.onclick=function(e){if(e.target.tagName==='BUTTON'){kill();return}kill();fab.click()};
  fab.addEventListener('click',kill);document.body.appendChild(h);setTimeout(kill,12000)
 },9000);
}
})();
