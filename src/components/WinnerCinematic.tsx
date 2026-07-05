"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

export default function WinnerCinematic({
  winner,
  score,
  leaderboard,
  courseName,
  players,
  currentHole = 18,
}: {
  winner: string;
  score: number;
  leaderboard: any[];
  courseName?: string;
  players?: any;
  currentHole?: number;
}) {
  const [show, setShow] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  // -----------------------------
  // GET WINNER PLAYER DATA
  // -----------------------------
  const winnerPlayer = players?.[winner];

  // -----------------------------
  // SHARE IMAGE
  // -----------------------------
  async function handleShare() {
    if (!cardRef.current) return;

    const exportWrap = document.createElement("div");

    exportWrap.style.width = "540px";
    exportWrap.style.height = "960px";
    exportWrap.style.backgroundImage = "url('/points-shareBG.png')";
    exportWrap.style.backgroundSize = "cover";
    exportWrap.style.backgroundPosition = "center";
    exportWrap.style.backgroundRepeat = "no-repeat";
    exportWrap.style.display = "flex";
    exportWrap.style.alignItems = "center";
    exportWrap.style.justifyContent = "center";
    exportWrap.style.position = "fixed";
    exportWrap.style.left = "-99999px";
    exportWrap.style.top = "0";

    const clone = cardRef.current.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    clone.style.width = "500px";
    
    clone.querySelectorAll('[style*="grid"]').forEach((el) => {
      (el as HTMLElement).style.fontSize = "26px";
      (el as HTMLElement).style.gridTemplateColumns = "1fr 120px 100px";
      (el as HTMLElement).style.padding = "8px 26px 26px";
    });

    exportWrap.appendChild(clone);
    document.body.appendChild(exportWrap);

    const canvas = await html2canvas(exportWrap, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
    });

    document.body.removeChild(exportWrap);

    const shareText = courseName?.trim()
      ? `${winner} won Points at ${courseName} 🏌️`
      : `${winner} won Points 🏌️`;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "result.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Points Golf",
          text: shareText,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "result.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  const sorted = [...(leaderboard || [])].sort(
    (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
  );

  const title = courseName?.trim()
    ? `won at ${courseName}`
    : "won";

  return (
    <div style={screen}>
        <div
          ref={cardRef}
          style={{
            ...card,
            transform: show ? "scale(1)" : "scale(0.9)",
          }}
        >
          <div style={exportHeader}>Game Results</div>
          <div style={exportWinnerLabel}>{winner} {title} with {score} points</div>
  
          <div style={list}>
            {sorted.map((p, index) => {
              const isWinner = p.name === winner;
  
              return (
                <div
                  key={p.name}
                  style={{
                    ...row,
                    border: isWinner
                      ? "1px solid #f0de7e"
                      : "0.5px solid #222",
                  }}
                >
                  <div style={left}>
                    <div style={rank}>{index + 1}</div>
                    <div style={pname}>{p.name}</div>
                  </div>
  
                  <div style={shots}>{p.totalStrokes}</div>
                  <div style={points}>{p.totalPoints} pts</div>
                </div>
              );
            })}
          </div>
        </div>
  
        {/* ACTIONS */}
        <div style={actions}>
        <button onClick={handleShare} style={shareBtn} >
          Share Results
        </button>
  
        <button onClick={() => router.push("/")} style={playAgainBtn}>
          Play Again
        </button>
        </div>

        </div>
  );
}

// -----------------------------
// STYLES
// -----------------------------

const card: React.CSSProperties = {
  textAlign: "center",
  padding: 20,
  borderRadius: 18,
  background: "#fff",
};

const shareBtn = {
  ...btn("#c08e43"),
  border: "none",
};

const playAgainBtn = {
  ...btn("transparent"),
  border: "0.5px solid #222",
};

const exportHeader = { fontSize: 18, fontWeight: 700, paddingBottom: 20, opacity: 0.5, };
const exportWinnerLabel = { fontSize: 22, fontWeight: 700, paddingBottom: 10, lineHeight: 1.2, };

const list: React.CSSProperties = {
  marginTop: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 70px 70px",
  padding: 18,
  fontSize: 20,
  borderRadius: 14,
  background: "#fff",
};

const left = { display: "flex", gap: 20 };
const rank = { opacity: 0.5, fontWeight: 800 };
const pname = { fontWeight: 700 };
const shots = { opacity: 0.5, textAlign: "center", fontWeight: 700 };
const points = { fontWeight: 800, textAlign: "right" };

function btn(bg: string): React.CSSProperties {
  return {
    width: "100%",
    maxWidth: 440,
    padding: 18,
    borderRadius: 14,
    fontSize: 20,
    background: bg,
    fontWeight: 700,
  };
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const modal: React.CSSProperties = {
  background: "#fff",
  borderRadius: 20,
  padding: 20,
  width: "100%",
  maxWidth: 440,
};

const closeBtn: React.CSSProperties = {
  marginTop: 12,
  width: "100%",
  padding: 12,
  borderRadius: 9999,
  border: "none",
  background: "#d7e087",
  fontWeight: 700,
};

const scoreRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 60px 60px",
  alignItems: "center",
  padding: "16px 0",
  fontSize: 16,
};

const colLeft: React.CSSProperties = {
  opacity: 0.8,
  fontWeight: 600,
};

const colCenter: React.CSSProperties = {
  textAlign: "center",
  fontWeight: 600,
};

const colRight: React.CSSProperties = {
  textAlign: "right",
  fontWeight: 800,
};

const divider: React.CSSProperties = {
  height: 1,
  background: "#eee",
};

const screen: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  alignItems: "stretch", 
};

const actions: React.CSSProperties = {
  width: "100%",
  maxWidth: 440,
  display: "flex",
  flexDirection: "column",
  gap: 10, 
};