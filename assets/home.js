(function(){'use strict';
var ul=document.getElementById('feed');if(!ul)return;
var pool=[['New WhatsApp lead qualified and added to the CRM','WhatsApp'],['Booking confirmed for Friday at 10:00','Calendar'],['Payment reminder sent to 3 clients','Email'],['Customer question answered in 4 seconds','Instagram'],['Order status sent to the customer','Telegram'],['Weekly report compiled and shared','Sheets'],['Missed enquiry followed up automatically','Messages'],['Refund request handed to a person, with notes','Human']];
var n=0,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function row(p){var li=document.createElement('li');li.innerHTML='<span class="dt"></span><span></span><em></em>';li.children[1].textContent=p[0];li.children[2].textContent=p[1];return li}
for(var i=4;i>=0;i--){ul.appendChild(row(pool[i]))}
n=5;
function tick(){ul.insertBefore(row(pool[n%pool.length]),ul.firstChild);n++;while(ul.children.length>5)ul.removeChild(ul.lastChild)}
var vis=true,t=setInterval(function(){if(vis&&!document.hidden&&!reduce)tick()},2800);
new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(ul);
})();
