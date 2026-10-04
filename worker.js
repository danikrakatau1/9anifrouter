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
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0a0a10;--panel:#12121a;--panel2:#1a1a26;--border:#23232f;--txt:#f0f0f5;--dim:#8b8b98;--acc1:#7c5cff;--acc2:#00d4ff}
body{background:radial-gradient(1200px 600px at 80% -10%,rgba(124,92,255,.12),transparent),radial-gradient(900px 500px at 10% 110%,rgba(0,212,255,.08),transparent),var(--bg);color:var(--txt);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif;height:100dvh;display:flex;flex-direction:column;overflow:hidden}
header{padding:14px 18px;display:flex;align-items:center;gap:12px;background:rgba(18,18,26,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);z-index:5}
.logo{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,var(--acc1),var(--acc2));display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 16px rgba(124,92,255,.35);flex-shrink:0}
header .t{flex:1;min-width:0}
header .t h1{font-size:15.5px;font-weight:700;letter-spacing:.2px}
header .t p{font-size:12px;color:var(--dim);margin-top:2px}
.pill{background:rgba(124,92,255,.14);border:1px solid rgba(124,92,255,.35);color:#c9bfff;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:20px;white-space:nowrap}
.icobtn{background:var(--panel2);border:1px solid var(--border);color:var(--txt);border-radius:10px;padding:8px 12px;font-size:13px;font-weight:600;cursor:pointer;transition:.15s}
.icobtn:hover{border-color:var(--acc1)}
#picker{position:relative;padding:12px 16px 4px;z-index:4}
#modelBtn{width:100%;display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:11px 14px;cursor:pointer;transition:.15s;text-align:left;color:var(--txt)}
#modelBtn:hover{border-color:var(--acc1)}
#modelBtn .dot{width:9px;height:9px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;flex-shrink:0}
#modelBtn .nm{flex:1;font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#modelBtn .ch{color:var(--dim);font-size:12px}
#drop{display:none;position:absolute;top:100%;left:16px;right:16px;background:var(--panel2);border:1px solid var(--border);border-radius:14px;margin-top:6px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.55);max-height:min(56vh,420px);flex-direction:column}
#drop.open{display:flex}
#drop input{background:var(--bg);border:none;border-bottom:1px solid var(--border);color:var(--txt);padding:12px 14px;font-size:14px;outline:none}
#mList{overflow-y:auto;padding:6px}
.mItem{padding:10px 12px;border-radius:10px;font-size:13.5px;cursor:pointer;display:flex;gap:8px;align-items:center}
.mItem:hover{background:rgba(124,92,255,.12)}
.mItem.sel{background:rgba(124,92,255,.18);font-weight:600}
.mItem .tag{font-size:10.5px;font-weight:700;background:rgba(0,212,255,.13);color:#7de3ff;border-radius:6px;padding:2px 7px;flex-shrink:0}
#chat{flex:1;overflow-y:auto;padding:18px 16px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth}
.welcome{text-align:center;padding:34px 20px;color:var(--dim)}
.welcome .big{font-size:44px;margin-bottom:12px}
.welcome h2{font-size:17px;color:var(--txt);margin-bottom:6px}
.welcome p{font-size:13.5px;line-height:1.6}
.row{display:flex;gap:10px;max-width:92%;animation:up .25s ease}
@keyframes up{from{opacity:0;transform:translateY(8px)}}
.row.u{align-self:flex-end;flex-direction:row-reverse}
.bub{padding:11px 15px;border-radius:18px;font-size:14.5px;line-height:1.6;word-break:break-word;overflow-wrap:anywhere}
.row.u .bub{background:linear-gradient(135deg,var(--acc1),#5b3df5);color:#fff;border-bottom-right-radius:6px;box-shadow:0 4px 14px rgba(124,92,255,.3)}
.row.a .bub{background:var(--panel);border:1px solid var(--border);border-bottom-left-radius:6px}
.ava{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,var(--acc1),var(--acc2));display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;margin-top:2px}
.row pre{background:#08080c;border:1px solid var(--border);padding:10px 12px;border-radius:10px;overflow-x:auto;margin:8px 0;font-size:12.8px}
.row code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:rgba(124,92,255,.14);padding:1px 6px;border-radius:6px;font-size:13px}
.row pre code{background:none;padding:0}
.dots{display:inline-flex;gap:5px;padding:6px 2px}
.dots span{width:7px;height:7px;border-radius:50%;background:var(--dim);animation:bl 1.2s infinite}
.dots span:nth-child(2){animation-delay:.2s}.dots span:nth-child(3){animation-delay:.4s}
@keyframes bl{0%,60%,100%{opacity:.25;transform:none}30%{opacity:1;transform:translateY(-4px)}}
.sys{align-self:center;font-size:12.5px;color:var(--dim);background:rgba(255,255,255,.04);padding:6px 14px;border-radius:16px}
#inputBar{padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(18,18,26,.9);backdrop-filter:blur(12px);border-top:1px solid var(--border)}
#inWrap{display:flex;gap:10px;align-items:flex-end;background:var(--panel2);border:1px solid var(--border);border-radius:18px;padding:8px 8px 8px 16px;transition:.15s}
#inWrap:focus-within{border-color:var(--acc1);box-shadow:0 0 0 3px rgba(124,92,255,.15)}
#msg{flex:1;background:none;border:none;color:var(--txt);font-size:15px;outline:none;resize:none;max-height:120px;font-family:inherit;line-height:1.5;padding:8px 0}
#sendBtn{width:42px;height:42px;border-radius:14px;border:none;background:linear-gradient(135deg,var(--acc1),var(--acc2));color:#fff;font-size:17px;cursor:pointer;flex-shrink:0;box-shadow:0 4px 14px rgba(124,92,255,.4);transition:.15s}
#sendBtn:disabled{opacity:.4;box-shadow:none}
#sendBtn:not(:disabled):hover{transform:scale(1.06)}
</style>
</head>
<body>
<header>
  <div class="logo">🤖</div>
  <div class="t"><h1>Kumpulan Model AI <span style="font-size:10px;background:#22c55e;border-radius:4px;padding:2px 8px;vertical-align:middle">v3</span></h1><p>Didukung 9Router</p></div>
  <div class="pill" id="cnt">…</div>
  <button class="icobtn" id="newBtn">+ Baru</button>
</header>
<div id="picker">
  <button id="modelBtn"><span class="dot"></span><span class="nm" id="mName">Memuat model…</span><span class="ch">▾</span></button>
  <div id="drop"><input id="mSearch" placeholder="🔍 Cari model…"><div id="mList"></div></div>
</div>
<div id="chat"></div>
<div id="inputBar"><div id="inWrap"><textarea id="msg" rows="1" placeholder="Tulis pesan…"></textarea><button id="sendBtn">➤</button></div></div>
<script>
var chat=document.getElementById("chat"),mList=document.getElementById("mList"),mName=document.getElementById("mName");
var models=[],cur="",msgs=[],busy=false;
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function md(s){s=esc(s);s=s.replace(/\\\`\\\`\\\`(\\w*)\\n([\\s\\S]*?)\\\`\\\`\\\`/g,function(m,l,c){return "<pre><code>"+c.replace(/^\\n+|\\n+$/g,"")+"</code></pre>";});s=s.replace(/\\\`([^\\\`]+)\\\`/g,"<code>$1</code>");s=s.replace(/\\*\\*([^*]+)\\*\\*/g,"<b>$1</b>");s=s.replace(/\\n/g,"<br>");return s;}
function sys(t){var d=document.createElement("div");d.className="sys";d.textContent=t;chat.appendChild(d);go();}
function go(){chat.scrollTop=chat.scrollHeight;}
function tagOf(id){var p=id.split("/")[0]||"";return p.length>8?p.slice(0,8):p;}
function renderList(f){
  f=(f||"").toLowerCase();mList.innerHTML="";
  var n=0;
  models.forEach(function(m){
    if(f&&m.toLowerCase().indexOf(f)<0)return;n++;
    var d=document.createElement("div");d.className="mItem"+(m===cur?" sel":"");
    d.innerHTML='<span class="tag">'+esc(tagOf(m))+'</span><span>'+esc(m.split("/").slice(1).join("/"))+"</span>";
    d.onclick=function(){cur=m;mName.textContent=m;document.getElementById("drop").classList.remove("open");renderList(document.getElementById("mSearch").value);};
    mList.appendChild(d);
  });
  if(!n)mList.innerHTML='<div class="mItem">Tidak ketemu.</div>';
}
function welcome(){
  chat.innerHTML='<div class="welcome"><div class="big">🤖</div><h2>Halo, bosku!</h2><p>Pilih model di atas, lalu mulai ngobrol.<br>Semua model dari 9Router-mu ada di sini.</p></div>';
}
async function load(){
  mName.textContent="Menghubungi 9Router...";
  for(var a=0;a<3;a++){
    try{
      var ctl=new AbortController();
      var to=setTimeout(function(){ctl.abort();},20000);
      var r=await fetch("/api/models",{signal:ctl.signal});
      clearTimeout(to);
      if(!r.ok)throw new Error("HTTP "+r.status);
      var j=await r.json();
      if(j.error)throw new Error(j.error);
      models=(j.data||[]).map(function(m){return m.id;}).filter(Boolean).sort();
      if(!models.length)throw new Error("model kosong");
      document.getElementById("cnt").textContent=models.length+" model";
      cur=models[0];mName.textContent=cur;
      renderList("");
      sys(models.length+" model dimuat.");
      return;
    }catch(e){
      mName.textContent="Mencoba lagi... ("+(a+1)+"/3)";
      await new Promise(function(r){setTimeout(r,2000);});
    }
  }
  mName.textContent="Gagal memuat";
  sys("9Router tidak merespons setelah 3x coba. Cek tunnel di perangkat 9Router-mu, lalu klik \u21bb.");
}
function addRow(role){
  var w=document.createElement("div");w.className="row "+(role==="user"?"u":"a");
  var b=document.createElement("div");b.className="bub";
  if(role==="a"){var a=document.createElement("div");a.className="ava";a.textContent="🤖";w.appendChild(a);}
  w.appendChild(b);chat.appendChild(w);go();return b;
}
var ctl=null,stopMsg="",busy=false;
function stopReq(m){stopMsg=m||"";if(ctl){try{ctl.abort();}catch(e){}}}
function status(t){var d=document.createElement("div");d.className="sys";d.textContent=t;document.getElementById("chat").appendChild(d);document.getElementById("chat").scrollTop=1e9;}
async function send(){
  try{
    if(busy){stopReq();return;}
    var ta=document.getElementById("msg"),text=ta.value.trim();
    if(!text||!cur){if(!cur)status("Pilih model dulu.");return;}
    busy=true;
    ta.value="";ta.style.height="auto";
    var wel=document.querySelector(".welcome");if(wel)wel.remove();
    addMsg("user",text);
    msgs.push({role:"user",content:text});
    var ab=addMsg("ai","\u23f3 menghubungi model...");
    var btn=document.getElementById("sendBtn");btn.textContent="\u23f9";
    ctl=new AbortController();
    var to=setTimeout(function(){stopReq("\u23f1 Timeout 90 detik - coba lagi.");},90000);
    var full="",got=false;
    try{
      var r=await fetch("/api/chat/completions",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({model:cur,messages:msgs,stream:true})});
      if(!r.ok)throw new Error("HTTP "+r.status);
      if(!r.body)throw new Error("browser tidak mendukung streaming");
      var rd=r.body.getReader(),dec=new TextDecoder(),buf="";
      while(true){
        var s=await rd.read();if(s.done)break;
        buf+=dec.decode(s.value,{stream:true});
        var ps=buf.split(String.fromCharCode(10,10));buf=ps.pop();
        for(var i=0;i<ps.length;i++){
          var ln=ps[i].trim();if(ln.indexOf("data:")!==0)continue;
          var dt=ln.slice(5).trim();if(dt==="[DONE]")continue;
          try{var ch=JSON.parse(dt).choices[0].delta.content||"";if(ch){got=true;full+=ch;}}catch(e){}
        }
        if(full)ab.innerHTML=md(full);
      }
      if(full)msgs.push({role:"assistant",content:full});
    }catch(e){
      if(e.name==="AbortError"){full=full||stopMsg||"Dihentikan.";}
      else{full="\u26a0\ufe0f "+e.message;}
    }
    clearTimeout(to);
    ab.innerHTML=md(full||"(kosong - model tidak mengembalikan teks)");
    document.getElementById("chat").scrollTop=1e9;
    busy=false;ctl=null;btn.textContent="\u27a4";
  }catch(e){
    busy=false;
    status("Error di send(): "+e.message);
  }
}
function addMsg(role,text){
  var w=document.createElement("div");w.className="row "+(role==="user"?"u":"a");
  var b=document.createElement("div");b.className="bub";b.innerHTML=text;
  if(role!=="user"){var a=document.createElement("div");a.className="ava";a.textContent="\u0001f916";w.appendChild(a);}
  w.appendChild(b);var c=document.getElementById("chat");c.appendChild(w);c.scrollTop=1e9;return b;
}
document.getElementById("sendBtn").onclick=send;
var ta=document.getElementById("msg");
ta.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}});
ta.addEventListener("input",function(){ta.style.height="auto";ta.style.height=Math.min(ta.scrollHeight,120)+"px";});
document.getElementById("modelBtn").onclick=function(e){e.stopPropagation();var d=document.getElementById("drop");d.classList.toggle("open");if(d.classList.contains("open"))document.getElementById("mSearch").focus();};
document.getElementById("mSearch").addEventListener("input",function(e){renderList(e.target.value);});
document.addEventListener("click",function(){document.getElementById("drop").classList.remove("open");});
document.getElementById("newBtn").onclick=function(){msgs=[];welcome();};
window.onerror=function(m,s,l){try{var d=document.createElement("div");d.className="sys";d.textContent="JS Error: "+m+" @"+(l||"?");document.getElementById("chat").appendChild(d);}catch(e){}};
welcome();load();
</script>
</body>
</html>}`;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: cors() });
    if (url.pathname.startsWith("/api/")) {
      if (!env.NINE_BASE || !env.NINE_KEY) return json({ error: "NINE_BASE / NINE_KEY belum di-set" }, 500);
      const target = env.NINE_BASE.replace(/\/+$/, "") + url.pathname.slice(4) + url.search;
      const headers = new Headers();
      headers.set("Authorization", "Bearer " + env.NINE_KEY);
      const ct = req.headers.get("content-type");
      if (ct) headers.set("content-type", ct);
      let resp;
      try {
        resp = await fetch(target, {
          method: req.method, headers,
          body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
          signal: AbortSignal.timeout(25000),
        });
      } catch (e) {
        return json({ error: "9Router tidak merespons (tunnel mungkin mati). Cek tunnel di perangkat 9Router-mu lalu coba lagi." }, 504);
      }
      const out = new Headers(resp.headers);
      Object.entries(cors()).forEach(([k, v]) => out.set(k, v));
      return new Response(resp.body, { status: resp.status, headers: out });
    }
    return new Response(HTML, { headers: { "Content-Type": "text/html;charset=utf-8" } });
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
