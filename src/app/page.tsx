"use client";
import { useState, useEffect, useCallback } from "react";

interface Track {
  id: number;
  trackTitle: string;
  artistName: string;
  fileName: string;
  durationSeconds: number;
}

type AlertType = "success" | "error" | "warning" | "confirm";
interface AlertState {
  show: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/* ───────────────────── CYBER ALERT ───────────────────── */
function CyberAlert({ alert, onClose }: { alert: AlertState; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (alert.show) requestAnimationFrame(() => setVisible(true));
  }, [alert.show]);

  const dismiss = useCallback((cb?: () => void) => {
    setExiting(true);
    setTimeout(() => { setVisible(false); setExiting(false); onClose(); cb?.(); }, 300);
  }, [onClose]);

  if (!alert.show) return null;

  const C = {
    success: { a:"#00ffb3", d:"rgba(0,255,179,0.12)", l:"EXEC_OK",   i:"✓" },
    error:   { a:"#ff4d6d", d:"rgba(255,77,109,0.12)", l:"EXEC_FAIL", i:"✕" },
    warning: { a:"#f0c040", d:"rgba(240,192,64,0.12)", l:"CAUTION",   i:"⚠" },
    confirm: { a:"#00e5ff", d:"rgba(0,229,255,0.12)",  l:"CONFIRM?",  i:"?" },
  }[alert.type];

  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,
      background:exiting?"rgba(0,0,0,0)":visible?"rgba(0,0,0,0.75)":"rgba(0,0,0,0)",
      backdropFilter:visible&&!exiting?"blur(5px)":"none",
      transition:"background 0.3s,backdrop-filter 0.3s" }}>
      <style>{`
        @keyframes c-in{0%{transform:translateY(-24px) scaleX(0.82);opacity:0;clip-path:inset(0 100% 0 0)}65%{clip-path:inset(0 0 0 0);transform:translateY(3px) scaleX(1.02);opacity:1}100%{transform:none;opacity:1}}
        @keyframes c-out{0%{opacity:1;clip-path:inset(0 0 0 0)}100%{transform:translateY(-18px) scaleX(0.88);opacity:0;clip-path:inset(0 100% 0 0)}}
        @keyframes c-scan{0%{top:-2px;opacity:.8}100%{top:110%;opacity:0}}
        @keyframes c-trace{0%{stroke-dashoffset:900}100%{stroke-dashoffset:0}}
        @keyframes c-pop{0%{transform:scale(0) rotate(-20deg);opacity:0}70%{transform:scale(1.25) rotate(5deg);opacity:1}100%{transform:none;opacity:1}}
        @keyframes c-decode{0%{opacity:0;letter-spacing:.6em;filter:blur(6px)}100%{opacity:1;letter-spacing:normal;filter:none}}
        @keyframes c-sweep{0%{width:0}80%{width:100%;opacity:1}100%{width:100%;opacity:.4}}
        .c-wrap{animation:c-in .45s cubic-bezier(.22,1,.36,1) forwards}
        .c-wrap.exit{animation:c-out .28s ease-in forwards}
        .c-sb{position:absolute;left:0;right:0;height:2px;pointer-events:none;z-index:10;animation:c-scan 1.1s ease-out .05s forwards;background:linear-gradient(90deg,transparent,${C.a} 35%,rgba(255,255,255,.8) 50%,${C.a} 65%,transparent);box-shadow:0 0 8px ${C.a}}
        .c-ic{animation:c-pop .5s cubic-bezier(.34,1.56,.64,1) .18s both}
        .c-tt{animation:c-decode .38s ease .28s both}
        .c-ms{animation:c-decode .38s ease .38s both}
        .c-br{animation:c-sweep .5s ease both}
        .c-ok{transition:all .15s}.c-ok:hover{transform:translateY(-1px);filter:brightness(1.15);box-shadow:0 0 22px ${C.a}70}.c-ok:active{transform:scale(.97)}
        .c-no{transition:all .15s}.c-no:hover{border-color:${C.a}50!important;background:${C.d}!important;color:${C.a}!important}
      `}</style>

      <div className={`c-wrap${exiting?" exit":""}`} style={{ position:"relative",width:"100%",maxWidth:380,
        background:"linear-gradient(160deg,#070f0c,#050d0b 60%,#040a08)",
        border:`1px solid ${C.a}25`,borderRadius:3,overflow:"hidden",
        boxShadow:`0 0 0 1px ${C.a}08,0 0 50px ${C.a}18,0 28px 56px rgba(0,0,0,.85)` }}>

        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:8}} viewBox="0 0 380 210" preserveAspectRatio="none">
          <rect x="1" y="1" width="378" height="208" rx="2" fill="none" stroke={C.a} strokeWidth="1.5"
            strokeDasharray="900" strokeDashoffset="900" style={{animation:"c-trace .55s ease .02s forwards"}}/>
        </svg>
        <div className="c-sb"/>
        {([[0,"top","left"],[0,"top","right"],[1,"bottom","left"],[1,"bottom","right"]] as [number,string,string][]).map(([,v,h],i)=>
          <div key={i} style={{position:"absolute",width:10,height:10,zIndex:9,[v]:0,[h]:0,
            [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]:`2px solid ${C.a}`,
            [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]:`2px solid ${C.a}`}}/>
        )}
        <div style={{height:2,background:"rgba(0,0,0,.5)",overflow:"hidden",position:"relative",zIndex:7}}>
          <div className="c-br" style={{height:"100%",background:`linear-gradient(90deg,transparent,${C.a},${C.a}90,transparent)`,boxShadow:`0 0 8px ${C.a}`}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px 8px",borderBottom:`1px solid ${C.a}12`,background:C.d,position:"relative",zIndex:6}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:C.a,boxShadow:`0 0 7px ${C.a}`}}/>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:C.a,letterSpacing:"0.32em",textTransform:"uppercase"}}>{C.l}</span>
          </div>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:`${C.a}35`,letterSpacing:"0.12em"}}>SYS://NOCTURN</span>
        </div>
        <div style={{padding:"18px 18px 14px",position:"relative",zIndex:6}}>
          <div style={{position:"absolute",inset:0,background:`repeating-linear-gradient(0deg,transparent,transparent 3px,${C.a}04 3px,${C.a}04 4px)`,pointerEvents:"none"}}/>
          <div style={{display:"flex",gap:14,alignItems:"flex-start",position:"relative"}}>
            <div className="c-ic" style={{width:46,height:46,flexShrink:0,border:`1.5px solid ${C.a}45`,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.d},transparent)`,fontSize:20,color:C.a,fontFamily:"'Share Tech Mono',monospace",fontWeight:"bold",boxShadow:`inset 0 0 16px ${C.a}10`,position:"relative",overflow:"hidden"}}>
              {C.i}
              <div style={{position:"absolute",inset:0,background:`repeating-linear-gradient(0deg,transparent,transparent 2px,${C.a}07 2px,${C.a}07 4px)`}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <h3 className="c-tt" style={{margin:"0 0 7px",fontSize:15,fontWeight:700,color:"#fff",letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'Rajdhani',sans-serif"}}>{alert.title}</h3>
              <p className="c-ms" style={{margin:0,fontSize:10,color:"rgba(255,255,255,.45)",lineHeight:1.65,fontFamily:"'Share Tech Mono',monospace"}}>{alert.message}</p>
            </div>
          </div>
        </div>
        <div style={{padding:"0 18px 16px",display:"flex",gap:8,justifyContent:"flex-end",position:"relative",zIndex:6}}>
          {alert.type==="confirm"&&(
            <button className="c-no" onClick={()=>dismiss(alert.onCancel)} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,letterSpacing:"0.28em",background:"transparent",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.35)",padding:"7px 16px",borderRadius:2,cursor:"pointer",textTransform:"uppercase"}}>ABORT</button>
          )}
          <button className="c-ok" onClick={()=>dismiss(alert.onConfirm)} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,letterSpacing:"0.28em",background:C.a,border:"none",color:"#000",padding:"7px 18px",borderRadius:2,cursor:"pointer",textTransform:"uppercase",fontWeight:700}}>
            {alert.type==="confirm"?"EXECUTE":"DISMISS"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── MAIN ───────────────────── */
export default function MusicManagerModal() {
  const [tracks, setTracks]         = useState<Track[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState<"library"|"upload">("library");
  const [alertState, setAlertState] = useState<AlertState>({ show:false,type:"success",title:"",message:"" });
  const API_BASE_URL = "https://panel.nexxacodeid.site/api";

  const showAlert = useCallback((type:AlertType,title:string,message:string,onConfirm?:()=>void,onCancel?:()=>void) =>
    setAlertState({show:true,type,title,message,onConfirm,onCancel}), []);
  const closeAlert = useCallback(()=>setAlertState(p=>({...p,show:false})),[]);
  const cyberConfirm = (title:string,msg:string):Promise<boolean> =>
    new Promise(r=>showAlert("confirm",title,msg,()=>r(true),()=>r(false)));

  const fetchTracks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tracks`);
      const result = await res.json();
      if(result.status==="success") setTracks(result.data);
    } catch(e){ console.error("Signal Lost!",e); }
  };
  useEffect(()=>{ fetchTracks(); },[]);

  const handleUpload = async (e:React.FormEvent) => {
    e.preventDefault();
    if(!youtubeUrl){ showAlert("warning","INPUT REQUIRED","Link-nya mana bosquu? Masa kosongan! 🐈‍🤣"); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/store`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({url:youtubeUrl}),
      });
      const reader=response.body?.getReader(); const decoder=new TextDecoder();
      while(true){
        const {value,done}=await reader!.read(); if(done)break;
        const chunk=decoder.decode(value);
        if(chunk.includes('"status":"success"')){
          showAlert("success","DOWNLOAD COMPLETE","Gacor! Lagu berhasil didownload ke database.");
          setYoutubeUrl(""); fetchTracks(); setActiveTab("library");
        }
      }
    } catch{ showAlert("error","PROTOCOL ERROR","Download gagal atau timeout! Coba lagi. 🗿"); }
    finally{ setLoading(false); }
  };

  const handleDelete = async (id:number) => {
    const ok = await cyberConfirm("PURGE FREQUENCY","Yakin mau hapus track ini? Operasi ini tidak bisa di-undo.");
    if(!ok) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tracks/${id}`,{method:"DELETE"});
      if(res.ok){ setTracks(tracks.filter(t=>t.id!==id)); showAlert("success","PURGE COMPLETE","Track berhasil dihapus."); }
    } catch{ showAlert("error","PURGE FAILED","Gagal hapus track. Coba lagi."); }
  };

  const filtered = tracks.filter(t=>t.trackTitle.toLowerCase().includes(searchQuery.toLowerCase()));
  const fmtDur = (s:number) => s?`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`:"—";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        .nm{font-family:'Rajdhani',sans-serif;position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.92);backdrop-filter:blur(12px)}
        .mono{font-family:'Share Tech Mono',monospace!important}

        /* shared animations */
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pring{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
        @keyframes lscan{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
        @keyframes w1{0%,100%{height:4px}50%{height:16px}} @keyframes w2{0%,100%{height:12px}50%{height:4px}}
        @keyframes w3{0%,100%{height:6px}50%{height:18px}} @keyframes w4{0%,100%{height:16px}50%{height:5px}} @keyframes w5{0%,100%{height:8px}50%{height:14px}}
        @keyframes glitch{0%,100%{clip-path:inset(0 0 98% 0);transform:translateX(-2px)}20%{clip-path:inset(40% 0 50% 0);transform:translateX(2px)}40%{clip-path:inset(80% 0 5% 0);transform:translateX(-1px)}60%{clip-path:inset(10% 0 70% 0);transform:translateX(1px)}80%{clip-path:inset(60% 0 20% 0);transform:translateX(-2px)}}
        @keyframes fadeup{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

        .wv span:nth-child(1){animation:w1 .8s ease infinite} .wv span:nth-child(2){animation:w2 .6s ease infinite}
        .wv span:nth-child(3){animation:w3 1s ease infinite}  .wv span:nth-child(4){animation:w4 .7s ease infinite}
        .wv span:nth-child(5){animation:w5 .9s ease infinite}

        .upload-btn{background:linear-gradient(90deg,#00ffb3,#00e5ff,#00ffb3);background-size:200% auto;animation:shimmer 2.5s linear infinite;border:none;cursor:pointer;font-family:'Share Tech Mono',monospace;color:#000;font-weight:700;text-transform:uppercase;letter-spacing:.2em;transition:all .2s}
        .upload-btn:disabled{opacity:.5;animation:none;background:#00ffb3;cursor:not-allowed}
        .upload-btn:hover:not(:disabled){box-shadow:0 0 24px rgba(0,255,180,.5);transform:translateY(-1px)}
        .upload-btn:active:not(:disabled){transform:scale(.98)}

        .nm-in{background:rgba(0,255,180,.03);border:1px solid rgba(0,255,180,.12);color:rgba(0,255,180,.85);font-family:'Share Tech Mono',monospace;transition:all .2s;width:100%}
        .nm-in:focus{outline:none;border-color:rgba(0,255,180,.5);box-shadow:0 0 0 1px rgba(0,255,180,.15),0 0 16px rgba(0,255,180,.07)}
        .nm-in::placeholder{color:rgba(0,255,180,.22)}

        .scl::-webkit-scrollbar{width:3px} .scl::-webkit-scrollbar-thumb{background:rgba(0,255,180,.22);border-radius:2px}

        .dp{width:5px;height:5px;border-radius:50%;background:#00ffb3;box-shadow:0 0 8px #00ffb3;position:relative;flex-shrink:0}
        .dp::after{content:'';position:absolute;inset:0;border-radius:50%;background:#00ffb3;animation:pring 1.5s ease-out infinite}
        .lbar{position:absolute;top:0;left:0;right:0;height:2px;overflow:hidden;z-index:20;background:rgba(0,255,180,.08)}
        .lbar-inner{position:absolute;top:0;left:0;width:55%;height:100%;animation:lscan 1.2s linear infinite;background:linear-gradient(90deg,transparent,#00ffb3,#00e5ff,transparent);box-shadow:0 0 12px #00ffb3}
        .blink{animation:blink 1s step-start infinite}

        /* scanline + hex on panels */
        .scans::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,180,.012) 2px,rgba(0,255,180,.012) 4px)}
        .hexbg{background-image:radial-gradient(circle at 1px 1px,rgba(0,255,180,.055) 1px,transparent 0);background-size:22px 22px}

        /* ─── DESKTOP ≥768px ─── */
        @media(min-width:768px){
          .mob{display:none!important}
          .dsk{display:flex!important;width:100%;height:100%;align-items:stretch;justify-content:center;padding:28px}
          .panel{display:flex;width:100%;max-width:960px;background:linear-gradient(135deg,#050f0a,#060d0b 60%,#040a08);border:1px solid rgba(0,255,180,.13);border-radius:4px;overflow:hidden;position:relative;box-shadow:0 0 80px rgba(0,255,180,.07),0 0 160px rgba(0,0,0,.8)}
          .sidebar{width:256px;flex-shrink:0;border-right:1px solid rgba(0,255,180,.07);display:flex;flex-direction:column;background:rgba(0,0,0,.3);position:relative;overflow:hidden}
          .sb-hd{padding:28px 22px 18px}
          .sb-nav{padding:0 10px;flex:1;display:flex;flex-direction:column;gap:3px}
          .nav-item{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:2px;cursor:pointer;font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(0,255,180,.28);border:1px solid transparent;transition:all .15s;user-select:none}
          .nav-item:hover{color:rgba(0,255,180,.65);background:rgba(0,255,180,.03)}
          .nav-item.act{color:#00ffb3;background:rgba(0,255,180,.06);border-color:rgba(0,255,180,.14);box-shadow:inset 3px 0 0 #00ffb3}
          .sb-ft{padding:14px 22px;border-top:1px solid rgba(0,255,180,.05)}
          .main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative}
          .mhd{padding:24px 30px 18px;border-bottom:1px solid rgba(0,255,180,.06);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
          .mbody{flex:1;overflow-y:auto;padding:22px 30px}
          .drop-zone{border:1px dashed rgba(0,255,180,.18);border-radius:3px;padding:30px 24px;text-align:center;background:rgba(0,255,180,.015);transition:all .2s;margin-bottom:20px}
          .drop-zone:hover{border-color:rgba(0,255,180,.38);background:rgba(0,255,180,.03)}
          .trk{display:flex;align-items:center;gap:14px;padding:11px 14px;border:1px solid transparent;border-radius:2px;background:rgba(0,255,180,.018);transition:all .2s}
          .trk:hover{border-color:rgba(0,255,180,.14);background:rgba(0,255,180,.035)}
          .trk:hover .pdel{opacity:1!important}
          .pdel{opacity:0;transition:all .15s;background:transparent;border:1px solid transparent;cursor:pointer;font-family:'Share Tech Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,80,80,.45);padding:5px 10px;border-radius:2px}
          .pdel:hover{border-color:rgba(255,50,50,.35)!important;color:#ff5050!important;box-shadow:0 0 10px rgba(255,50,50,.18)!important}
        }

        /* ─── MOBILE <768px ─── */
        @media(max-width:767px){
          .dsk{display:none!important}
          .mob{display:flex!important;flex-direction:column;width:100%;height:100%}
          .m-sb{flex-shrink:0;padding:11px 16px 10px;background:rgba(0,0,0,.7);border-bottom:1px solid rgba(0,255,180,.07);display:flex;align-items:center;justify-content:space-between}
          .m-body{flex:1;overflow-y:auto}
          .m-search-bar{padding:10px 14px 8px;position:sticky;top:0;background:rgba(3,10,7,.97);backdrop-filter:blur(8px);z-index:5;border-bottom:1px solid rgba(0,255,180,.05)}
          .m-trk{padding:13px 15px;border-bottom:1px solid rgba(0,255,180,.045);display:flex;align-items:center;gap:11px;transition:background .12s;animation:fadeup .2s ease both}
          .m-trk:active{background:rgba(0,255,180,.04)}
          .m-tabs{flex-shrink:0;display:flex;border-top:1px solid rgba(0,255,180,.08);background:rgba(0,0,0,.85)}
          .m-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:10px 6px;cursor:pointer;font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:.18em;text-transform:uppercase;color:rgba(0,255,180,.28);border:none;background:transparent;transition:all .15s;border-top:2px solid transparent;position:relative}
          .m-tab.act{color:#00ffb3;border-top-color:#00ffb3;background:rgba(0,255,180,.03)}
          .m-tab-ico{font-size:15px;line-height:1}
          .m-upload-card{margin:14px;border:1px solid rgba(0,255,180,.11);border-radius:3px;overflow:hidden;background:rgba(0,255,180,.015)}
          .m-card-hd{padding:10px 14px;border-bottom:1px solid rgba(0,255,180,.07);background:rgba(0,255,180,.028);display:flex;align-items:center;gap:7px}
          .m-del{flex-shrink:0;background:transparent;border:1px solid rgba(255,50,50,.13);border-radius:2px;padding:7px 11px;cursor:pointer;color:rgba(255,80,80,.38);font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:.15em;text-transform:uppercase;transition:all .15s}
          .m-del:active{background:rgba(255,50,50,.08);color:#ff5050;border-color:rgba(255,50,50,.35)}
        }
      `}</style>

      <CyberAlert alert={alertState} onClose={closeAlert}/>

      <div className="nm">

        {/* ═══════════════════ DESKTOP ═══════════════════ */}
        <div className="dsk">
          <div className="panel scans hexbg">
            {loading&&<div className="lbar"><div className="lbar-inner"/></div>}

            {/* ── Sidebar ── */}
            <div className="sidebar">
              <div style={{position:"absolute",top:0,left:0,width:12,height:12,borderTop:"1.5px solid rgba(0,255,180,.55)",borderLeft:"1.5px solid rgba(0,255,180,.55)"}}/>
              <div style={{position:"absolute",bottom:0,right:0,width:12,height:12,borderBottom:"1.5px solid rgba(0,255,180,.25)",borderRight:"1.5px solid rgba(0,255,180,.25)"}}/>

              {/* Sidebar: branding */}
              <div className="sb-hd">
                <div style={{position:"relative",display:"inline-block",marginBottom:10}}>
                  <h1 className="mono" style={{fontSize:19,color:"#00ffb3",letterSpacing:".18em",textTransform:"uppercase",margin:0,textShadow:"0 0 20px rgba(0,255,180,.5)"}}>NOCTURN</h1>
                  <div style={{position:"absolute",inset:0,color:"#00ffb3",opacity:.28,animation:"glitch 5s steps(1) infinite",fontFamily:"'Share Tech Mono',monospace",fontSize:19,letterSpacing:".18em",textTransform:"uppercase",pointerEvents:"none"}}>NOCTURN</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
                  <div className="dp"/>
                  <span className="mono" style={{fontSize:7,color:"rgba(0,255,180,.32)",letterSpacing:".22em",textTransform:"uppercase"}}>v2.4.1 ACTIVE</span>
                </div>

                {/* Stats */}
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[["TRACKS",tracks.length],["STATUS","ONLINE"],["LATENCY","12ms"]].map(([k,v])=>(
                    <div key={k as string} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 9px",background:"rgba(0,255,180,.028)",border:"1px solid rgba(0,255,180,.055)",borderRadius:2}}>
                      <span className="mono" style={{fontSize:7,color:"rgba(0,255,180,.28)",letterSpacing:".14em"}}>{k as string}</span>
                      <span className="mono" style={{fontSize:10,color:"#00ffb3"}}>{v as string|number}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nav */}
              <div className="sb-nav">
                {([["library","▤","LIBRARY"],[  "upload","⬆","UPLOAD"]] as [string,string,string][]).map(([id,ic,lb])=>(
                  <div key={id} className={`nav-item${activeTab===id?" act":""}`} onClick={()=>setActiveTab(id as any)}>
                    <span style={{fontSize:13}}>{ic}</span>
                    <span>{lb}</span>
                    {id==="library"&&tracks.length>0&&(
                      <span style={{marginLeft:"auto",fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00ffb3",background:"rgba(0,255,180,.1)",padding:"1px 6px",borderRadius:1}}>{tracks.length}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Waveform deco */}
              <div style={{padding:"16px 22px",display:"flex",alignItems:"flex-end",gap:2}}>
                <div className="wv" style={{display:"flex",alignItems:"flex-end",gap:2}}>
                  {[0,1,2,3,4].map(i=><span key={i} style={{display:"block",width:3,background:"rgba(0,255,180,.2)",borderRadius:"1px 1px 0 0",height:8}}/>)}
                </div>
                <span className="mono" style={{fontSize:6,color:"rgba(0,255,180,.16)",letterSpacing:".14em",marginLeft:8}}>FREQ.VIZ</span>
              </div>

              <div className="sb-ft">
                <span className="mono" style={{fontSize:7,color:"rgba(0,255,180,.16)"}}>Marlboro-Powered 🐈‍🤣</span>
              </div>
            </div>

            {/* ── Main ── */}
            <div className="main">
              {/* Main header */}
              <div className="mhd">
                <div>
                  <h2 style={{margin:0,fontSize:13,fontWeight:700,color:"rgba(255,255,255,.78)",letterSpacing:".08em",textTransform:"uppercase"}}>
                    {activeTab==="library"?"FREQUENCY DATABASE":"UPLOAD FREQUENCY"}
                  </h2>
                  <p className="mono" style={{margin:"3px 0 0",fontSize:8,color:"rgba(0,255,180,.3)",letterSpacing:".18em"}}>
                    {activeTab==="library"?`${filtered.length} TRACKS INDEXED`:"PASTE YOUTUBE URL"}
                  </p>
                </div>
                {activeTab==="library"&&(
                  <div style={{position:"relative"}}>
                    <span className="mono" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"rgba(0,255,180,.28)",pointerEvents:"none"}}>⌕</span>
                    <input type="text" placeholder="SEARCH..." onChange={e=>setSearchQuery(e.target.value)}
                      className="nm-in mono" style={{padding:"7px 12px 7px 28px",fontSize:9,borderRadius:2,width:176,letterSpacing:".1em"}}/>
                  </div>
                )}
              </div>

              {/* Main body */}
              <div className="mbody scl" style={{position:"relative",zIndex:2}}>

                {/* ─ Upload tab ─ */}
                {activeTab==="upload"&&(
                  <form onSubmit={handleUpload}>
                    <div className="drop-zone">
                      <div style={{fontSize:28,color:"rgba(0,255,180,.18)",marginBottom:10}}>⬇</div>
                      <p className="mono" style={{fontSize:8,color:"rgba(0,255,180,.28)",letterSpacing:".22em",textTransform:"uppercase",margin:"0 0 18px"}}>PASTE YOUTUBE URL</p>
                      <input type="url" value={youtubeUrl} onChange={e=>setYoutubeUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="nm-in mono" style={{maxWidth:480,padding:"11px 14px",fontSize:11,borderRadius:2,marginBottom:12,display:"block",marginInline:"auto"}}/>
                      <button type="submit" disabled={loading} className="upload-btn" style={{padding:"11px 32px",fontSize:10,borderRadius:2}}>
                        {loading?<span style={{display:"flex",alignItems:"center",gap:8}}><span className="blink">▮</span>FETCHING...</span>:"⬆ UPLOAD"}
                      </button>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:0}}>
                      {["Supports standard youtube.com URLs","Playlist links download the first track","Processing may take 10–60 seconds"].map((t,i)=>(
                        <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:"1px solid rgba(0,255,180,.04)"}}>
                          <span style={{color:"rgba(0,255,180,.28)",fontSize:10}}>▸</span>
                          <span className="mono" style={{fontSize:9,color:"rgba(255,255,255,.28)",letterSpacing:".04em"}}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </form>
                )}

                {/* ─ Library tab ─ */}
                {activeTab==="library"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {filtered.length===0&&(
                      <div style={{textAlign:"center",padding:"52px 0"}}>
                        <div className="mono" style={{fontSize:9,color:"rgba(0,255,180,.14)",letterSpacing:".25em",textTransform:"uppercase"}}>NO FREQUENCIES DETECTED</div>
                      </div>
                    )}
                    {filtered.map((track,idx)=>(
                      <div key={track.id} className="trk">
                        <span className="mono" style={{fontSize:8,color:"rgba(0,255,180,.2)",minWidth:22}}>{String(idx+1).padStart(2,"0")}</span>
                        <div style={{display:"flex",alignItems:"flex-end",gap:1.5,height:14,flexShrink:0}}>
                          {[7,12,5,10,8].map((h,i)=><div key={i} style={{width:2,height:h,background:"rgba(0,255,180,.18)",borderRadius:"1px 1px 0 0"}}/>)}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.8)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:".03em"}}>{track.trackTitle}</div>
                          <div className="mono" style={{fontSize:8,color:"rgba(0,255,180,.28)",textTransform:"uppercase",letterSpacing:".14em",marginTop:2}}>{track.artistName}</div>
                        </div>
                        <span className="mono" style={{fontSize:8,color:"rgba(0,255,180,.2)",flexShrink:0}}>{fmtDur(track.durationSeconds)}</span>
                        <button className="pdel" onClick={()=>handleDelete(track.id)}>PURGE</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════ MOBILE ═══════════════════ */}
        <div className="mob" style={{background:"linear-gradient(180deg,#060d0b,#040a08)"}}>
          {loading&&<div className="lbar"><div className="lbar-inner"/></div>}

          {/* Status bar */}
          <div className="m-sb">
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div className="dp" style={{width:5,height:5}}/>
              <span className="mono" style={{fontSize:10,color:"#00ffb3",letterSpacing:".18em",textShadow:"0 0 12px rgba(0,255,180,.45)"}}>NOCTURN</span>
            </div>
            <div style={{display:"flex",gap:12}}>
              <span className="mono" style={{fontSize:7,color:"rgba(0,255,180,.28)",letterSpacing:".1em"}}>DB:{tracks.length}</span>
              <span className="mono" style={{fontSize:7,color:loading?"#00ffb3":"rgba(0,255,180,.28)",letterSpacing:".1em"}}>{loading?"SYNC…":"READY"}</span>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="m-body scl" style={{flex:1,background:"linear-gradient(180deg,#060d0b,#040a08)"}}>

            {activeTab==="library"&&(
              <>
                <div className="m-search-bar">
                  <div style={{position:"relative"}}>
                    <span className="mono" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(0,255,180,.28)",pointerEvents:"none"}}>⌕</span>
                    <input type="text" placeholder="SEARCH FREQUENCY…" onChange={e=>setSearchQuery(e.target.value)}
                      className="nm-in mono" style={{padding:"9px 12px 9px 30px",fontSize:10,borderRadius:2,letterSpacing:".1em"}}/>
                  </div>
                </div>

                {filtered.length===0?(
                  <div style={{textAlign:"center",padding:"56px 24px"}}>
                    <div style={{fontSize:28,marginBottom:12,opacity:.12}}>◎</div>
                    <div className="mono" style={{fontSize:8,color:"rgba(0,255,180,.18)",letterSpacing:".25em"}}>NO FREQUENCIES DETECTED</div>
                  </div>
                ):(
                  filtered.map((track,idx)=>(
                    <div key={track.id} className="m-trk" style={{animationDelay:`${idx*.04}s`}}>
                      {/* Index + mini bars */}
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0,width:22}}>
                        <span className="mono" style={{fontSize:7,color:"rgba(0,255,180,.2)"}}>{String(idx+1).padStart(2,"0")}</span>
                        <div style={{display:"flex",alignItems:"flex-end",gap:1}}>
                          {[5,9,3,7].map((h,i)=><div key={i} style={{width:2,height:h,background:"rgba(0,255,180,.16)",borderRadius:"1px 1px 0 0"}}/>)}
                        </div>
                      </div>
                      {/* Info */}
                      <div style={{flex:1,minWidth:0,paddingRight:6}}>
                        <div style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,.83)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{track.trackTitle}</div>
                        <div className="mono" style={{fontSize:8,color:"rgba(0,255,180,.28)",textTransform:"uppercase",letterSpacing:".12em",marginTop:3}}>{track.artistName}</div>
                      </div>
                      {/* Delete */}
                      <button className="m-del" onClick={()=>handleDelete(track.id)}>DEL</button>
                    </div>
                  ))
                )}
                <div style={{height:12}}/>
              </>
            )}

            {activeTab==="upload"&&(
              <div style={{padding:"14px"}}>
                <div className="m-upload-card">
                  <div className="m-card-hd">
                    <div style={{width:4,height:4,borderRadius:"50%",background:"#00ffb3",boxShadow:"0 0 6px #00ffb3",flexShrink:0}}/>
                    <span className="mono" style={{fontSize:8,color:"rgba(0,255,180,.45)",letterSpacing:".22em",textTransform:"uppercase"}}>INPUT SOURCE</span>
                  </div>
                  <form onSubmit={handleUpload} style={{padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
                    <input type="url" value={youtubeUrl} onChange={e=>setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=…"
                      className="nm-in mono" style={{padding:"13px 14px",fontSize:12,borderRadius:2,letterSpacing:".03em"}}/>
                    <button type="submit" disabled={loading} className="upload-btn"
                      style={{width:"100%",padding:"14px",fontSize:11,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      {loading?<><span className="blink">▮</span><span>FETCHING…</span></>:<><span>⬆</span><span>UPLOAD</span></>}
                    </button>
                  </form>
                </div>

                <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:7}}>
                  <p className="mono" style={{fontSize:7,color:"rgba(0,255,180,.22)",letterSpacing:".22em",textTransform:"uppercase",margin:"0 0 2px"}}>▸ NOTES</p>
                  {["Paste any youtube.com video URL","First track of playlists downloaded","Processing: 10–60 seconds"].map((t,i)=>(
                    <div key={i} style={{display:"flex",gap:9,padding:"9px 11px",background:"rgba(0,255,180,.018)",border:"1px solid rgba(0,255,180,.045)",borderRadius:2}}>
                      <span style={{color:"rgba(0,255,180,.22)",fontSize:9}}>▸</span>
                      <span className="mono" style={{fontSize:9,color:"rgba(255,255,255,.28)",letterSpacing:".03em",lineHeight:1.5}}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab bar */}
          <div className="m-tabs">
            {([["library","▤","LIBRARY"],["upload","⬆","UPLOAD"]] as [string,string,string][]).map(([id,ic,lb])=>(
              <button key={id} className={`m-tab${activeTab===id?" act":""}`} onClick={()=>setActiveTab(id as any)}>
                <span className="m-tab-ico">{ic}</span>
                <span>{lb}</span>
                {id==="library"&&tracks.length>0&&activeTab!==id&&(
                  <span style={{position:"absolute",top:6,right:"calc(50% - 18px)",background:"#00ffb3",color:"#000",fontSize:6,fontWeight:700,padding:"1px 4px",borderRadius:1,lineHeight:1.4}}>{tracks.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}