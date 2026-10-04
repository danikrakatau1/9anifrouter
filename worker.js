// Worker "Kumpulan Model AI" — chat UI + proxy aman ke 9Router
// Env yang harus di-set di dashboard Cloudflare:
//   NINE_BASE (variable) = https://rwhndpt.abc-tunnel.us/v1
//   NINE_KEY  (secret)   = API key 9Router-mu

const HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Kumpulan Model AI</title>
<style>
:root{--bg:#0d0d12;--panel:#16161d;--border:#26262f;--txt:#e8e8ec;--dim:#9a9aa5;--acc:#7c5cff}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--txt);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;height:100dvh;display:flex;flex-direction:column}
header{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--panel)}
header h1{font-size:16px;font-weight:600;flex:1}
header button{background:none;border:1px solid var(--border);color:var(--txt);border-radius:8px;padding:6px 10px;font-size:13px;cursor:pointer}
#modelBar{padding:10px 16px;border-bottom:1px solid var(--border);background:var(--panel);display:flex;gap:8px;align-items:center}
#modelBar select{flex:1;background:var(--bg);color:var(--txt);border:1px solid var(--border);border-radius:8px;padding:8px;font-size:14px}
#modelBar button{background:var(--acc);border:none;color:#fff;border-radius:8px;padding:8px 12px;font-size:13px;cursor:pointer}
#chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.msg{max-width:88%;padding:10px 14px;border-radius:14px;font-size:14.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.user{align-self:flex-end;background:var(--acc);color:#fff;border-bottom-right-radius:4px}
.ai{align-self:flex-start;background:var(--panel);border:1px solid var(--border);border-bottom-left-radius:4px}
.ai pre{background:#0a0a0e;padding:8px;border-radius:8px;overflow-x:auto;margin:8px 0;font-size:13px}
.ai code{font-family:ui-monospace,Menlo,Consolas,monospace}
.sys{align-self:center;color:var(--dim);font-size:13px;text-align:center}
#inputBar{padding:12px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--border);background:var(--panel);display:flex;gap:8px}
#inputBar input{flex:1;background:var(--bg);color:var(--txt);border:1px solid var(--border);border-radius:10px;padding:11px 14px;font-size:15px;outline:none}
#inputBar input:focus{border-color:var(--acc)}
#inputBar button{background:var(--acc);border:none;color:#fff;border-radius:10px;padding:0 18px;font-size:15px;cursor:pointer}
#inputBar button:disabled{opacity:.5}
.typing::after{content:"\\258D";animation:blink 1s infinite}
@keyframes blink{50%{opacity:0}}
</style>
</head>
<body>
<header><h1>\\1F916 Kumpulan Model AI</h1><button id="newChatBtn">+ Baru</button></header>
<div id="modelBar"><select id="modelSel"><option value="">memuat model...</option></select><button id="reloadBtn">\\21BB</button></div>
<div id="chat"></div>
<div id="inputBar"><input id="msg" placeholder="Tulis pesan..." autocomplete="off"><button id="sendBtn">\\27A4</button></div>
<script>
var chat=document.getElementById("chat"),modelSel=document.getElementById("modelSel");
var history=[],aborted=false;
function sys(t){var d=document.createElement("div");d.className="sys";d.textContent=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
function esc(s){return s.replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function md(s){s=esc(s);s=s.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g,function(m,l,c){return "<pre><code>"+c.replace(/^\\n+|\\n+$/g,"")+"</code></pre>";});s=s.replace(/\`([^\`]+)\`/g,"<code>$1</code>");s=s.replace(/\\*\\*([^*]+)\\*\\*/g,"<b>$1</b>");return s;}
function addMsg(role,text){var d=document.createElement("div");d.className="msg "+(role==="user"?"user":"ai");d.innerHTML=role==="user"?esc(text):md(text);chat.appendChild(d);chat.scrollTop=chat.scrollHeight;return d;}
async function loadModels(){
  modelSel.innerHTML="<option>memuat...</option>";
  try{
    var r=await fetch("/api/models");if(!r.ok)throw new Error("HTTP "+r.status);
    var j=await r.json();var ms=(j.data||[]).map(function(m){return m.id;}).filter(Boolean).sort();
    modelSel.innerHTML=ms.map(function(m){return '<option value="'+m+'">'+m+"</option>";}).join("")||"<option>tidak ada model</option>";
    sys(ms.length+" model dimuat.");
  }catch(e){modelSel.innerHTML="<option>gagal memuat</option>";sys("Gagal: "+e.message);}
}
async function send(){
  var text=document.getElementById("msg").value.trim();
  if(!text||aborted)return;
  var model=modelSel.value;if(!model){sys("Pilih model dulu.");return;}
  document.getElementById("msg").value="";
  addMsg("user",text);history.push({role:"user",content:text});
  var bubble=addMsg("ai","");bubble.classList.add("typing");
  document.getElementById("sendBtn").disabled=true;aborted=false;
  var full="";
  try{
    var r=await fetch("/api/chat/completions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:model,messages:history,stream:true})});
    if(!r.ok||!r.body)throw new Error("HTTP "+r.status);
    var rd=r.body.getReader(),dec=new TextDecoder(),buf="";
    while(true){
      var st=await rd.read();if(st.done)break;
      buf+=dec.decode(st.value,{stream:true});
      var parts=buf.split("\\n\\n");buf=parts.pop();
      for(var i=0;i<parts.length;i++){
        var line=parts[i].trim();if(line.indexOf("data:")!==0)continue;
        var data=line.slice(5).trim();if(data==="[DONE]")continue;
        try{full+=JSON.parse(data).choices[0].delta.content||"";}catch(e){}
        bubble.innerHTML=md(full);chat.scrollTop=chat.scrollHeight;
      }
      if(aborted)break;
    }
    history.push({role:"assistant",content:full});
  }catch(e){full="\\26A0\\FE0F "+e.message;}
  bubble.classList.remove("typing");bubble.innerHTML=md(full||"(kosong)");chat.scrollTop=chat.scrollHeight;
  document.getElementById("sendBtn").disabled=false;
}
document.getElementById("sendBtn").onclick=send;
document.getElementById("msg").onkeydown=function(e){if(e.key==="Enter")send();};
document.getElementById("reloadBtn").onclick=loadModels;
document.getElementById("newChatBtn").onclick=function(){history=[];chat.innerHTML="";sys("Percakapan baru dimulai.");};
loadModels();sys("Selamat datang! Pilih model lalu mulai chat.");
</script>
</body>
</html>`;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // Preflight CORS
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    // Proxy API ke 9Router (key disuntik di sini, tidak keluar ke browser)
    if (url.pathname.startsWith("/api/")) {
      if (!env.NINE_BASE || !env.NINE_KEY) {
        return json({ error: "NINE_BASE / NINE_KEY belum di-set" }, 500);
      }
      const target = env.NINE_BASE.replace(/\/+$/, "") + url.pathname.slice(4) + url.search;
      const headers = new Headers();
      headers.set("Authorization", "Bearer " + env.NINE_KEY);
      const ct = req.headers.get("content-type");
      if (ct) headers.set("content-type", ct);
      const resp = await fetch(target, {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
      });
      const out = new Headers(resp.headers);
      Object.entries(cors()).forEach(([k, v]) => out.set(k, v));
      return new Response(resp.body, { status: resp.status, headers: out });
    }

    // Halaman chat
    return new Response(HTML, {
      headers: { "Content-Type": "text/html;charset=utf-8" },
    });
  },
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...cors() },
  });
}
