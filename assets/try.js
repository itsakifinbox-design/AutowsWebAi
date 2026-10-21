(function(){'use strict';
/* Optional: point this at your own backend to use a real AI model.
   POST {business, message, history} -> {reply}. Leave empty to use the built-in demo logic. */
var AI=window.AutowsAI&&window.AutowsAI.enabled?window.AutowsAI:null;
var $=function(s){return document.querySelector(s)};
if(!$('#tcb'))return;
var PRE={restaurant:['12pm to 11pm, every day','Meals start at $5, most guests spend $8 to $12','table'],clinic:['9am to 6pm, Saturday to Thursday','Consultations start at $10','appointment'],shop:['10am to 9pm, every day','Most items are $5 to $40, with free delivery over $50','order'],coaching:['4pm to 9pm, Sunday to Thursday','Courses start at $20 per month','class'],services:['9am to 5pm, Monday to Friday','Quotes are free and projects start at $200','visit']};
function val(s){return(($(s)||{}).value||'').trim()}
function cfg(){var t=val('#tt')||'restaurant';return{name:val('#tn')||'our business',type:t,hours:val('#th2')||'normal business hours',loc:val('#tl')||'our usual location',price:val('#tp')||'prices depend on what you need',who:val('#tc')||'our team',noun:PRE[t][2]}}
function classify(t){
 var s=t.toLowerCase();
 if(/human|person|manager|complain|refund|speak to|talk to (a |someone)/.test(s))return'human';
 if(/order|track|deliver|parcel|shipping|status/.test(s))return'order';
 if(/book|appoint|reserv|table|slot|schedule|visit|tomorrow|friday|tonight/.test(s))return'book';
 if(/price|cost|how much|fee|rate|menu|charge|quote|\$/.test(s))return'price';
 if(/hour|open|close|what time|available/.test(s))return'hours';
 if(/where|location|address|direction|map|find you|near/.test(s))return'loc';
 if(/thank|thx|awesome|great/.test(s))return'thanks';
 if(/^(hi|hello|hey|salam|assalam)/.test(s))return'greet';
 return'unknown'}
var INFO={
 greet:['Greeting','Greet the customer','No update needed','No'],
 price:['Price enquiry','Answer from the price list','No update needed','No'],
 hours:['Opening hours','Look up business hours','No update needed','No'],
 loc:['Location','Send address and directions','No update needed','No'],
 book:['Booking request','Ask for a day and time','Booking created once confirmed','No'],
 slot:['Booking details','Confirm the booking','Calendar event + CRM row created','No'],
 order:['Order status','Ask for the order number','Order system checked next','No'],
 orderno:['Order number','Look up the order','Status read from order system','No'],
 human:['Wants a person','Hand over with full transcript','Ticket opened, team notified','Yes'],
 thanks:['Thanks','Close politely','No update needed','No'],
 unknown:['Unclear','Ask to rephrase, offer a person','Logged for review','Maybe']};
function reply(k,c,msg){
 switch(k){
 case'greet':return'Hi! Welcome to '+c.name+'. I can help with prices, opening hours, bookings and orders. What do you need?';
 case'price':return c.price+'. Would you like me to set up a '+c.noun+' for you?';
 case'hours':return'We are open '+c.hours+'.';
 case'loc':return'You can find us at '+c.loc+'.';
 case'book':return'Happy to help. What day and time suits you for your '+c.noun+'? For example: Friday 7pm for 2.';
 case'slot':return'Done: '+msg+'. A confirmation is on its way and '+c.who+' has been notified. (Demo)';
 case'order':return'Sure. What is your order number?';
 case'orderno':return'Order '+msg+' is packed and out for delivery. Expected today by 6pm. (Demo)';
 case'human':return'Of course. I am handing this to '+c.who+' now, with the whole conversation, so you do not have to repeat yourself.';
 case'thanks':return'You are welcome! Anything else for '+c.name+'?';
 default:return'I am not sure I understood that. I can help with prices, hours, location, bookings and orders, or I can bring in a person.'}}
/* chat */
var cb=$('#tcb'),state=null,hist=[];
function bubble(c,t){var d=document.createElement('div');d.className='m '+c;d.textContent=t;cb.appendChild(d);cb.scrollTop=cb.scrollHeight;return d}
function brain(k){var i=INFO[k]||INFO.unknown;['#tb1','#tb2','#tb3','#tb4'].forEach(function(s,n){$(s).textContent=i[n]})}
function local(msg){var c=cfg(),k=state||classify(msg),r;
 if(state==='book'){k='slot'}else if(state==='order'){k='orderno'}
 state=null;r=reply(k,c,msg);if(k==='book')state='book';if(k==='order')state='order';return{k:k,r:r}}
async function send(msg){
 if(!msg.trim())return;bubble('u',msg);hist.push({role:'user',text:msg});
 var t=bubble('a','...');var out=null;
 if(AI){try{var j=await AI.ask({mode:'business',business:cfg(),message:msg,history:hist.slice(0,-1).slice(-10)});if(j&&j.reply){out={k:classify(msg),r:j.reply};state=null}}catch(e){}}
 if(!out)out=local(msg);
 setTimeout(function(){t.textContent=out.r;hist.push({role:'assistant',text:out.r});if(out.k)brain(out.k);cb.scrollTop=cb.scrollHeight},450)}
function reset(){cb.innerHTML='';state=null;hist=[];var c=cfg();bubble('a','Hi! I am the assistant for '+c.name+'. Ask me about prices, opening hours, bookings or orders.');['#tb1','#tb2','#tb3','#tb4'].forEach(function(s,n){$(s).textContent=n?'\u2014':'waiting...'})}
$('#tci').onsubmit=function(e){e.preventDefault();var i=$('#tcit');var v=i.value;i.value='';send(v)};
['How much does it cost?','What time do you open?','Can I book for Friday?','Where is my order?','I want to speak to a person'].forEach(function(q){var b=document.createElement('button');b.type='button';b.textContent=q;b.onclick=function(){send(q)};$('#tcp').appendChild(b)});
$('#trs').onclick=reset;
$('#tt').onchange=function(){var p=PRE[val('#tt')];$('#th2').value=p[0];$('#tp').value=p[1];reset()};
['#tn','#th2','#tl','#tp','#tc'].forEach(function(s){$(s).addEventListener('change',reset)});
reset();
if(AI){var tl=$('#tlead'),tn=$('#tnote'),sl=$('#slead');
 if(tl)tl.textContent='Describe a business below and the assistant answers using only what you enter. Ask it what a customer would ask: prices, opening hours, bookings, orders. Your messages are sent to an AI model to write each reply. Autows does not store them, but please do not type personal or sensitive information.';
 if(tn)tn.textContent='Live AI: replies are written by an AI model from the details you entered. It can make mistakes. If the AI is unavailable, simple built-in rules answer instead.';
 if(sl)sl.textContent='Type or paste anything a customer might send. An AI model works out what they want, how urgent it is, and what should happen next. Your text is sent to the AI to do this, so please do not include personal information.'}
/* calculator */
function calc(){var a=+$('#r1').value,m=+$('#r2').value,p=+$('#r3').value,r=+$('#r4').value;
 $('#r1v').textContent=a;$('#r2v').textContent=m+' min';$('#r3v').textContent=p+'%';$('#r4v').textContent='$'+r;
 var h=a*26*(p/100)*m/60;
 $('#o1').textContent=Math.round(h).toLocaleString();$('#o2').textContent='$'+Math.round(h*r).toLocaleString();$('#o3').textContent=(Math.round(h/8*10)/10).toLocaleString()}
['#r1','#r2','#r3','#r4'].forEach(function(s){$(s).addEventListener('input',calc)});calc();
/* sorter */
var EX=['My order is late and I need a refund today','Do you have a table for 4 on Friday?','How much is a consultation?','Thanks, that was perfect!'];
EX.forEach(function(q){var b=document.createElement('button');b.type='button';b.textContent=q;b.onclick=function(){$('#sm').value=q;sort()};$('#sx').appendChild(b)});
async function sort(){var t=val('#sm');if(!t)return;
 if(AI){['#s1','#s2','#s3','#s4','#s5'].forEach(function(x){$(x).textContent='...'});try{var j=await AI.ask({mode:'sort',business:cfg(),message:t});var q=j&&j.result;if(q){$('#s1').textContent=q.intent||'Other';$('#s2').textContent=q.urgency;$('#s3').textContent=q.tone;$('#s4').textContent=q.action||'Review and reply';$('#s5').textContent=q.reply||'-';return}}catch(e){}}
 var s=t.toLowerCase(),k=classify(t),c=cfg(),i=INFO[k];
 var urg=/urgent|asap|immediately|right away|emergency|today|now|not working|broken/.test(s)?'High':/refund|complain|late|delay|problem/.test(s)?'Medium':'Low';
 var tone=/angry|worst|terrible|bad|late|broken|refund|disappointed|not working|waste|complain/.test(s)?'Negative':/thank|great|love|awesome|perfect|happy/.test(s)?'Positive':'Neutral';
 var act=i[1]+(urg==='High'||k==='human'?'. Flag for a person right away':'');
 $('#s1').textContent=i[0];$('#s2').textContent=urg;$('#s3').textContent=tone;$('#s4').textContent=act;$('#s5').textContent=reply(k,c,t)}
$('#sgo').onclick=sort;
})();
