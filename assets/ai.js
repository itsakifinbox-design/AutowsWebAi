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
/* ---- floating chat button: real AI, remembered while browsing ---- */
var form=document.getElementById('aif'),box=document.getElementById('acb'),inp=document.getElementById('ait');
if(!form||!box||!inp)return;
var KEY='autows-chat',hist=[];
try{hist=JSON.parse(sessionStorage.getItem(KEY)||'[]').filter(function(m){return m&&typeof m.text==='string'&&(m.role==='user'||m.role==='assistant')}).slice(-20)}catch(e){}
function save(){try{sessionStorage.setItem(KEY,JSON.stringify(hist.slice(-20)))}catch(e){}}
function bub(c,t){var d=document.createElement('div');d.className='m '+c;d.style.whiteSpace='pre-wrap';d.textContent=t;box.appendChild(d);box.scrollTop=box.scrollHeight;return d}
box.innerHTML='';
bub('a',"Hi! I'm the Autows AI assistant. Ask me what we automate, how it works, or how to book a call.");
hist.forEach(function(m){bub(m.role==='user'?'u':'a',m.text)});
var note=document.createElement('p');note.className='mono';note.style.cssText='margin:8px 14px 12px;font-size:.66rem;color:var(--mute);line-height:1.5';
note.textContent='AI replies can be wrong. Please do not share sensitive information.';form.insertAdjacentElement('afterend',note);
inp.maxLength=400;
form.onsubmit=function(e){
 e.preventDefault();var t=inp.value.trim();if(!t)return;inp.value='';
 bub('u',t);var wait=bub('a','...');
 ask({mode:'site',message:t,history:hist.slice(-10)}).then(function(j){
  var r=String(j&&j.reply||'').trim()||'Sorry, I could not answer that. You can reach the team on WhatsApp: +880 1332 611967.';
  wait.textContent=r;hist.push({role:'user',text:t},{role:'assistant',text:r});save();box.scrollTop=box.scrollHeight
 }).catch(function(err){
  wait.textContent=err&&err.code==='rate_limited'?'Lots of messages right now. Please try again in a minute.':'I cannot reach the AI right now. You can message the team on WhatsApp: +880 1332 611967.';
 });
};
})();
