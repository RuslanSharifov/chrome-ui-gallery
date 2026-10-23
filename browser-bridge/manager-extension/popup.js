const code=document.getElementById("code"),pair=document.getElementById("pair"),disconnect=document.getElementById("disconnect"),status=document.getElementById("status");
function render(connected){code.hidden=pair.hidden=connected;disconnect.hidden=!connected;status.textContent=connected?"Paired with Chrome UI Gallery Desktop":"Not paired"}
chrome.runtime.sendMessage({type:"status"},x=>{if(chrome.runtime.lastError)return status.textContent="Open the desktop app first";render(!!x?.paired)});
pair.addEventListener("click",()=>{status.textContent="Pairing…";chrome.runtime.sendMessage({type:"pair",code:code.value},x=>{if(chrome.runtime.lastError||x?.error){status.textContent=x?.error||chrome.runtime.lastError.message;return}render(true)})});
disconnect.addEventListener("click",()=>chrome.runtime.sendMessage({type:"disconnect"},()=>render(false)));
