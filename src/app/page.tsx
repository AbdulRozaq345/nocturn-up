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

  const colors = {
    success: { accent: "#00ffb3", dim: "rgba(0,255,179,0.12)", label: "EXEC_OK",   icon: "✓" },
    error:   { accent: "#ff4d6d", dim: "rgba(255,77,109,0.12)", label: "EXEC_FAIL", icon: "✕" },
    warning: { accent: "#f0c040", dim: "rgba(240,192,64,0.12)", label: "CAUTION",   icon: "⚠" },
    confirm: { accent: "#00e5ff", dim: "rgba(0,229,255,0.12)",  label: "CONFIRM?",  icon: "?" },
  };
  const c = colors[alert.type];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: exiting ? "rgba(0,0,0,0)" : visible ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0)",
      backdropFilter: visible && !exiting ? "blur(5px)" : "none",
      transition: "background 0.3s ease, backdrop-filter 0.3s ease",
    }}>
      <style>{`
        @keyframes cyber-in {
          0%   { transform: translateY(-24px) scaleX(0.82); opacity: 0; clip-path: inset(0 100% 0 0); }
          65%  { clip-path: inset(0 0% 0 0); transform: translateY(3px) scaleX(1.02); opacity: 1; }
          100% { transform: translateY(0) scaleX(1); opacity: 1; }
        }
        @keyframes cyber-out {
          0%   { transform: translateY(0) scaleX(1); opacity: 1; clip-path: inset(0 0% 0 0); }
          100% { transform: translateY(-18px) scaleX(0.88); opacity: 0; clip-path: inset(0 100% 0 0); }
        }
        @keyframes scan-beam {
          0%   { top: -2px; opacity: 0.8; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes border-trace {
          0%   { stroke-dashoffset: 900; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes icon-pop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          70%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes txt-decode {
          0%  { opacity: 0; letter-spacing: 0.6em; filter: blur(6px); }
          100%{ opacity: 1; letter-spacing: normal; filter: blur(0); }
        }
        @keyframes bar-sweep {
          0%   { width: 0%; opacity: 1; }
          80%  { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 0.4; }
        }
        @keyframes flicker {
          0%,100%{ opacity:1 } 92%{ opacity:1 } 93%{ opacity:0.4 } 94%{ opacity:1 } 96%{ opacity:0.6 } 97%{ opacity:1 }
        }
        .c-alert-wrap { animation: cyber-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
        .c-alert-wrap.exit { animation: cyber-out 0.28s ease-in forwards; }
        .c-scan { position:absolute; left:0; right:0; height:2px; pointer-events:none; z-index:10;
          animation: scan-beam 1.1s ease-out 0.05s forwards;
          background: linear-gradient(90deg, transparent 0%, ${c.accent} 35%, rgba(255,255,255,0.8) 50%, ${c.accent} 65%, transparent 100%);
          box-shadow: 0 0 8px ${c.accent};
        }
        .c-icon { animation: icon-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.18s both; }
        .c-title { animation: txt-decode 0.38s ease 0.28s both; font-family:'Rajdhani',sans-serif; }
        .c-msg   { animation: txt-decode 0.38s ease 0.38s both; font-family:'Share Tech Mono',monospace; }
        .c-bar   { animation: bar-sweep 0.5s ease 0s both; }
        .c-modal { animation: flicker 6s ease 0.5s infinite; }
        .c-btn-ok  { transition: all 0.15s; }
        .c-btn-ok:hover  { transform:translateY(-1px); filter:brightness(1.15); box-shadow:0 0 22px ${c.accent}70; }
        .c-btn-ok:active { transform:scale(0.97); }
        .c-btn-no  { transition: all 0.15s; }
        .c-btn-no:hover  { border-color:${c.accent}50 !important; background:${c.dim} !important; color:${c.accent} !important; }
      `}</style>

      <div className={`c-alert-wrap c-modal${exiting ? " exit" : ""}`} style={{
        position: "relative", width: "100%", maxWidth: "380px", margin: "0 16px",
        background: "linear-gradient(160deg, #070f0c 0%, #050d0b 60%, #040a08 100%)",
        border: `1px solid ${c.accent}25`,
        borderRadius: "3px",
        overflow: "hidden",
        boxShadow: `0 0 0 1px ${c.accent}08, 0 0 50px ${c.accent}18, 0 28px 56px rgba(0,0,0,0.85)`,
      }}>

        {/* SVG border trace */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:8 }} viewBox="0 0 380 210" preserveAspectRatio="none">
          <rect x="1" y="1" width="378" height="208" rx="2" fill="none" stroke={c.accent} strokeWidth="1.5"
            strokeDasharray="900" strokeDashoffset="900"
            style={{ animation:"border-trace 0.55s ease 0.02s forwards" }} />
        </svg>

        {/* Scan beam */}
        <div className="c-scan" />

        {/* Corner clips */}
        {[
          { top:0, left:0,  borderTop:`2px solid ${c.accent}`, borderLeft:`2px solid ${c.accent}` },
          { top:0, right:0, borderTop:`2px solid ${c.accent}`, borderRight:`2px solid ${c.accent}` },
          { bottom:0, left:0,  borderBottom:`2px solid ${c.accent}`, borderLeft:`2px solid ${c.accent}` },
          { bottom:0, right:0, borderBottom:`2px solid ${c.accent}`, borderRight:`2px solid ${c.accent}` },
        ].map((s, i) => <div key={i} style={{ position:"absolute", width:10, height:10, zIndex:9, ...s }} />)}

        {/* Top bar */}
        <div style={{ height:"2px", background:`rgba(0,0,0,0.5)`, overflow:"hidden", position:"relative", zIndex:7 }}>
          <div className="c-bar" style={{ height:"100%", background:`linear-gradient(90deg, transparent, ${c.accent}, ${c.accent}90, transparent)`, boxShadow:`0 0 8px ${c.accent}` }} />
        </div>

        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"9px 14px 8px",
          borderBottom:`1px solid ${c.accent}12`,
          background:`${c.dim}`,
          position:"relative", zIndex:6,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:c.accent, boxShadow:`0 0 7px ${c.accent}, 0 0 14px ${c.accent}60` }} />
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:c.accent, letterSpacing:"0.32em", textTransform:"uppercase" }}>
              {c.label}
            </span>
          </div>
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:`${c.accent}35`, letterSpacing:"0.12em" }}>
            SYS://NOCTURN/ALERT
          </span>
        </div>

        {/* Body */}
        <div style={{ padding:"18px 18px 14px", position:"relative", zIndex:6 }}>
          {/* Scanline texture */}
          <div style={{ position:"absolute", inset:0, background:`repeating-linear-gradient(0deg, transparent, transparent 3px, ${c.accent}04 3px, ${c.accent}04 4px)`, pointerEvents:"none" }} />

          <div style={{ display:"flex", gap:14, alignItems:"flex-start", position:"relative" }}>
            {/* Icon box */}
            <div className="c-icon" style={{
              width:46, height:46, flexShrink:0,
              border:`1.5px solid ${c.accent}45`,
              borderRadius:"2px",
              display:"flex", alignItems:"center", justifyContent:"center",
              background:`linear-gradient(135deg, ${c.dim}, transparent)`,
              fontSize:20, color:c.accent,
              fontFamily:"'Share Tech Mono',monospace",
              fontWeight:"bold",
              boxShadow:`inset 0 0 16px ${c.accent}10, 0 0 12px ${c.accent}15`,
              position:"relative", overflow:"hidden",
            }}>
              {c.icon}
              <div style={{ position:"absolute", inset:0, background:`repeating-linear-gradient(0deg, transparent, transparent 2px, ${c.accent}07 2px, ${c.accent}07 4px)` }} />
              {/* Corner pip */}
              <div style={{ position:"absolute", top:2, right:2, width:3, height:3, background:`${c.accent}60`, borderRadius:"50%" }} />
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              <h3 className="c-title" style={{
                margin:"0 0 7px", fontSize:15, fontWeight:700,
                color:"#fff", letterSpacing:"0.06em", textTransform:"uppercase",
                textShadow:`0 0 20px ${c.accent}30`,
              }}>
                {alert.title}
              </h3>
              <p className="c-msg" style={{
                margin:0, fontSize:10,
                color:"rgba(255,255,255,0.45)",
                lineHeight:1.65, letterSpacing:"0.03em",
              }}>
                {alert.message}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ padding:"0 18px 16px", display:"flex", gap:8, justifyContent:"flex-end", position:"relative", zIndex:6 }}>
          {alert.type === "confirm" && (
            <button className="c-btn-no" onClick={() => dismiss(alert.onCancel)} style={{
              fontFamily:"'Share Tech Mono',monospace", fontSize:8, letterSpacing:"0.28em",
              background:"transparent", border:"1px solid rgba(255,255,255,0.1)",
              color:"rgba(255,255,255,0.35)", padding:"7px 16px", borderRadius:"2px",
              cursor:"pointer", textTransform:"uppercase",
            }}>ABORT</button>
          )}
          <button className="c-btn-ok" onClick={() => dismiss(alert.onConfirm)} style={{
            fontFamily:"'Share Tech Mono',monospace", fontSize:8, letterSpacing:"0.28em",
            background:c.accent, border:"none", color:"#000",
            padding:"7px 18px", borderRadius:"2px",
            cursor:"pointer", textTransform:"uppercase", fontWeight:700,
          }}>
            {alert.type === "confirm" ? "EXECUTE" : "DISMISS"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MusicManagerModal() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState<AlertState>({ show:false, type:"success", title:"", message:"" });
  const API_BASE_URL = "https://panel.nexxacodeid.site/api";

  const showAlert = useCallback((type: AlertType, title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
    setAlertState({ show:true, type, title, message, onConfirm, onCancel });
  }, []);

  const closeAlert = useCallback(() => setAlertState(p => ({ ...p, show:false })), []);

  const cyberConfirm = (title: string, message: string): Promise<boolean> =>
    new Promise(resolve => showAlert("confirm", title, message, () => resolve(true), () => resolve(false)));

  const fetchTracks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tracks`);
      const result = await res.json();
      if (result.status === "success") setTracks(result.data);
    } catch (err) { console.error("Signal Lost! 🗿", err); }
  };

  useEffect(() => { fetchTracks(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) { showAlert("warning", "INPUT REQUIRED", "Link-nya mana bosquu? Masa kosongan! 🐈‍🤣"); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/store`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        if (chunk.includes('"status":"success"')) {
          showAlert("success", "DOWNLOAD COMPLETE", "Gacor! Lagu berhasil didownload ke database.");
          setYoutubeUrl(""); fetchTracks();
        }
      }
    } catch (err) {
      showAlert("error", "PROTOCOL ERROR", "Download gagal atau timeout! Cek koneksi dan coba lagi. 🗿");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await cyberConfirm("PURGE FREQUENCY", "Yakin mau hapus track ini dari database? Operasi ini tidak bisa di-undo.");
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tracks/${id}`, { method:"DELETE" });
      if (res.ok) { setTracks(tracks.filter(t => t.id !== id)); showAlert("success", "PURGE COMPLETE", "Track berhasil dihapus dari database."); }
    } catch { showAlert("error", "PURGE FAILED", "Gagal menghapus track. Coba lagi."); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        .nocturn-root * { font-family:'Rajdhani',sans-serif; }
        .nocturn-mono { font-family:'Share Tech Mono',monospace !important; }
        .scanlines::before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,180,0.015) 2px,rgba(0,255,180,0.015) 4px); pointer-events:none; z-index:1; }
        .hex-bg { background-image:radial-gradient(circle at 1px 1px,rgba(0,255,180,0.07) 1px,transparent 0); background-size:24px 24px; }
        @keyframes scan-load { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        .loader-bar { animation:scan-load 1.2s linear infinite; }
        @keyframes glitch { 0%,100%{clip-path:inset(0 0 98% 0);transform:translateX(-2px)} 20%{clip-path:inset(40% 0 50% 0);transform:translateX(2px)} 40%{clip-path:inset(80% 0 5% 0);transform:translateX(-1px)} 60%{clip-path:inset(10% 0 70% 0);transform:translateX(1px)} 80%{clip-path:inset(60% 0 20% 0);transform:translateX(-2px)} }
        .glitch-layer { position:absolute; inset:0; color:#00ffb3; opacity:0.4; animation:glitch 4s steps(1) infinite; }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        .pulse-ring { animation:pulse-ring 1.5s ease-out infinite; }
        .track-row { transition:all 0.2s ease; border:1px solid transparent; background:rgba(0,255,180,0.02); }
        .track-row:hover { border-color:rgba(0,255,180,0.2); background:rgba(0,255,180,0.05); box-shadow:0 0 20px rgba(0,255,180,0.08),inset 0 0 20px rgba(0,255,180,0.03); }
        .cyber-input:focus { outline:none; border-color:rgba(0,255,180,0.5) !important; box-shadow:0 0 0 1px rgba(0,255,180,0.2),0 0 20px rgba(0,255,180,0.1); }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .btn-upload { background:linear-gradient(90deg,#00ffb3,#00e5ff,#00ffb3); background-size:200% auto; animation:shimmer 2.5s linear infinite; transition:all 0.2s; }
        .btn-upload:hover:not(:disabled) { box-shadow:0 0 24px rgba(0,255,180,0.5),0 0 48px rgba(0,255,180,0.2); transform:translateY(-1px); }
        .btn-upload:disabled { opacity:0.5; animation:none; background:#00ffb3; }
        .cyber-scroll::-webkit-scrollbar { width:3px; }
        .cyber-scroll::-webkit-scrollbar-track { background:transparent; }
        .cyber-scroll::-webkit-scrollbar-thumb { background:rgba(0,255,180,0.3); border-radius:2px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .blink { animation:blink 1s step-start infinite; }
        .neon-divider { border:none; height:1px; background:linear-gradient(90deg,transparent,rgba(0,255,180,0.4),rgba(0,229,255,0.4),transparent); }
        .track-index { font-family:'Share Tech Mono',monospace; color:rgba(0,255,180,0.3); font-size:9px; min-width:20px; }
        @keyframes wave1 { 0%,100%{height:4px} 50%{height:14px} }
        @keyframes wave2 { 0%,100%{height:10px} 50%{height:4px} }
        @keyframes wave3 { 0%,100%{height:6px} 50%{height:16px} }
        @keyframes wave4 { 0%,100%{height:14px} 50%{height:4px} }
        .waveform span:nth-child(1){animation:wave1 0.8s ease infinite}
        .waveform span:nth-child(2){animation:wave2 0.6s ease infinite}
        .waveform span:nth-child(3){animation:wave3 1s ease infinite}
        .waveform span:nth-child(4){animation:wave4 0.7s ease infinite}
      `}</style>

      <CyberAlert alert={alertState} onClose={closeAlert} />

      <div className="nocturn-root fixed inset-0 z-[999] flex items-center justify-center p-4"
        style={{ background:"rgba(0,0,0,0.92)", backdropFilter:"blur(12px)" }}>

        <div className="relative w-full max-w-lg scanlines hex-bg" style={{
          background:"linear-gradient(135deg,#050f0a 0%,#060d0b 50%,#040a08 100%)",
          border:"1px solid rgba(0,255,180,0.15)", borderRadius:"4px",
          boxShadow:"0 0 60px rgba(0,255,180,0.08),0 0 120px rgba(0,0,0,0.8),inset 0 1px 0 rgba(0,255,180,0.1)",
          padding:"28px",
        }}>
          {[
            { top:0,left:0,borderTop:"2px solid rgba(0,255,180,0.5)",borderLeft:"2px solid rgba(0,255,180,0.5)" },
            { top:0,right:0,borderTop:"2px solid rgba(0,255,180,0.5)",borderRight:"2px solid rgba(0,255,180,0.5)" },
            { bottom:0,left:0,borderBottom:"2px solid rgba(0,255,180,0.5)",borderLeft:"2px solid rgba(0,255,180,0.5)" },
            { bottom:0,right:0,borderBottom:"2px solid rgba(0,255,180,0.5)",borderRight:"2px solid rgba(0,255,180,0.5)" },
          ].map((s,i) => <div key={i} style={{ position:"absolute", width:16, height:16, ...s }} />)}

          {loading && (
            <div style={{ position:"absolute",top:0,left:0,right:0,height:"2px",background:"rgba(0,255,180,0.1)",overflow:"hidden",zIndex:10 }}>
              <div className="loader-bar" style={{ position:"absolute",top:0,left:0,width:"60%",height:"100%",background:"linear-gradient(90deg,transparent,#00ffb3,#00e5ff,transparent)",boxShadow:"0 0 12px #00ffb3" }} />
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom:"24px", position:"relative", zIndex:2 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <div>
                <div style={{ position:"relative", display:"inline-block" }}>
                  <h1 className="nocturn-mono" style={{ fontSize:"22px",fontWeight:400,color:"#00ffb3",letterSpacing:"0.15em",textTransform:"uppercase",textShadow:"0 0 20px rgba(0,255,180,0.6),0 0 40px rgba(0,255,180,0.3)",margin:0 }}>NOCTURN</h1>
                  <div className="glitch-layer nocturn-mono" style={{ fontSize:"22px",fontWeight:400,letterSpacing:"0.15em",textTransform:"uppercase" }}>NOCTURN</div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:"8px",marginTop:"4px" }}>
                  <div style={{ width:"6px",height:"6px",background:"#00ffb3",borderRadius:"50%",boxShadow:"0 0 8px #00ffb3" }} className="pulse-ring" />
                  <p className="nocturn-mono" style={{ fontSize:"9px",color:"rgba(0,255,180,0.4)",letterSpacing:"0.25em",textTransform:"uppercase",margin:0 }}>FREQ. MANAGER v2.4.1</p>
                </div>
              </div>
              <div className="waveform" style={{ display:"flex",alignItems:"center",gap:"2px",paddingTop:"4px" }}>
                {[0,1,2,3].map(i => <span key={i} style={{ display:"block",width:"3px",background:"rgba(0,255,180,0.5)",borderRadius:"1px",height:"8px",boxShadow:"0 0 4px rgba(0,255,180,0.3)" }} />)}
              </div>
            </div>
            <div className="nocturn-mono" style={{ marginTop:"12px",padding:"6px 10px",background:"rgba(0,255,180,0.03)",border:"1px solid rgba(0,255,180,0.08)",borderRadius:"2px",display:"flex",gap:"16px" }}>
              {["SYS:OK","NET:ACTIVE",`DB:${tracks.length}`].map((s,i) => (
                <span key={i} style={{ fontSize:"8px",color:i===0?"#00ffb3":"rgba(0,255,180,0.4)",letterSpacing:"0.1em" }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleUpload} style={{ marginBottom:"24px", position:"relative", zIndex:2 }}>
            <div className="nocturn-mono" style={{ fontSize:"8px",color:"rgba(0,229,255,0.5)",letterSpacing:"0.3em",textTransform:"uppercase",marginBottom:"8px" }}>▸ INPUT FREQUENCY SOURCE</div>
            <div style={{ display:"flex", gap:"8px" }}>
              <div style={{ flex:1, position:"relative" }}>
                <input type="url" value={youtubeUrl} onChange={e=>setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..." className="cyber-input nocturn-mono"
                  style={{ width:"100%",boxSizing:"border-box",background:"rgba(0,255,180,0.03)",border:"1px solid rgba(0,255,180,0.12)",borderRadius:"2px",padding:"10px 12px",fontSize:"10px",color:"rgba(0,255,180,0.8)",transition:"all 0.2s" }} />
                <div style={{ position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:"2px",height:"60%",background:"linear-gradient(180deg,transparent,#00ffb3,transparent)",borderRadius:"1px" }} />
              </div>
              <button type="submit" disabled={loading} className="btn-upload nocturn-mono"
                style={{ color:"#000",fontSize:"9px",fontWeight:700,padding:"10px 20px",borderRadius:"2px",border:"none",cursor:"pointer",letterSpacing:"0.2em",textTransform:"uppercase",whiteSpace:"nowrap" }}>
                {loading ? <span style={{ display:"flex",alignItems:"center",gap:"6px" }}><span className="blink">▮</span> SYNC</span> : "⬆ UPLOAD"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ marginBottom:"20px", position:"relative", zIndex:2 }}>
            <hr className="neon-divider" />
            <div style={{ textAlign:"center", marginTop:"-8px" }}>
              <span className="nocturn-mono" style={{ fontSize:"8px",color:"rgba(0,229,255,0.4)",letterSpacing:"0.4em",textTransform:"uppercase",background:"#050f0a",padding:"0 12px" }}>◈ DATABASE ◈</span>
            </div>
          </div>

          {/* Search */}
          <div style={{ marginBottom:"12px", position:"relative", zIndex:2 }}>
            <div style={{ position:"relative" }}>
              <span className="nocturn-mono" style={{ position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)",fontSize:"10px",color:"rgba(0,255,180,0.3)" }}>⌕</span>
              <input type="text" placeholder="SEARCH FREQUENCY..." onChange={e=>setSearchQuery(e.target.value)}
                className="cyber-input nocturn-mono"
                style={{ width:"100%",boxSizing:"border-box",background:"transparent",border:"none",borderBottom:"1px solid rgba(0,255,180,0.1)",padding:"8px 12px 8px 28px",fontSize:"9px",color:"rgba(0,255,180,0.6)",letterSpacing:"0.15em",transition:"all 0.2s" }} />
            </div>
          </div>

          {/* Track List */}
          <div className="cyber-scroll" style={{ maxHeight:"240px", overflowY:"auto", position:"relative", zIndex:2 }}>
            {tracks.length === 0 && (
              <div className="nocturn-mono" style={{ textAlign:"center",padding:"32px",color:"rgba(0,255,180,0.2)",fontSize:"10px",letterSpacing:"0.2em" }}>NO FREQUENCIES DETECTED</div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
              {tracks.filter(t=>t.trackTitle.toLowerCase().includes(searchQuery.toLowerCase())).map((track,idx) => (
                <div key={track.id} className="track-row" style={{ display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",borderRadius:"2px",cursor:"default" }}>
                  <span className="track-index">{String(idx+1).padStart(2,"0")}</span>
                  <div style={{ display:"flex",flexDirection:"column",gap:"2px",opacity:0.4 }}>
                    {[60,100,40].map((w,i) => <div key={i} style={{ height:"2px",width:`${w}%`,maxWidth:"16px",background:"rgba(0,255,180,0.6)",borderRadius:"1px" }} />)}
                  </div>
                  <div style={{ flex:1, overflow:"hidden" }}>
                    <h3 style={{ margin:0,fontSize:"12px",fontWeight:600,color:"rgba(255,255,255,0.85)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"0.02em" }}>{track.trackTitle}</h3>
                    <p className="nocturn-mono" style={{ margin:0,fontSize:"8px",color:"rgba(0,255,180,0.35)",textTransform:"uppercase",letterSpacing:"0.15em" }}>{track.artistName}</p>
                  </div>
                  <button onClick={()=>handleDelete(track.id)}
                    style={{ opacity:0,background:"transparent",border:"1px solid rgba(255,50,50,0)",borderRadius:"2px",padding:"4px 6px",cursor:"pointer",color:"rgba(255,80,80,0.5)",transition:"all 0.2s",fontSize:"9px",letterSpacing:"0.1em" }}
                    className="nocturn-mono"
                    onMouseEnter={e=>{const t=e.currentTarget;t.style.opacity="1";t.style.borderColor="rgba(255,50,50,0.4)";t.style.color="#ff5050";t.style.boxShadow="0 0 12px rgba(255,50,50,0.2)";}}
                    onMouseLeave={e=>{const t=e.currentTarget;t.style.opacity="0";t.style.borderColor="rgba(255,50,50,0)";t.style.boxShadow="none";}}>
                    PURGE
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:"12px",borderTop:"1px solid rgba(0,255,180,0.06)",position:"relative",zIndex:2 }}>
            <div style={{ display:"flex",alignItems:"center",gap:"6px" }}>
              <div style={{ width:"4px",height:"4px",background:"#00ffb3",borderRadius:"50%",boxShadow:"0 0 6px #00ffb3" }} className={loading?"blink":""} />
              <span className="nocturn-mono" style={{ fontSize:"8px",color:"rgba(0,255,180,0.3)",letterSpacing:"0.2em" }}>{loading?"SYNCING...":"SYSTEM READY"}</span>
            </div>
            <span className="nocturn-mono" style={{ fontSize:"8px",color:"rgba(0,255,180,0.2)",letterSpacing:"0.1em" }}>Marlboro-Powered 🐈‍🤣</span>
          </div>
        </div>
      </div>
    </>
  );
}