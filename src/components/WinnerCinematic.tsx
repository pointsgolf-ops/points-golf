"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

export default function WinnerCinematic({
  winners,
  score,
  leaderboard,
  courseName,
  players,
  currentHole = 18,
}: {
  winners: any[];
  score: number;
  leaderboard: any[];
  courseName?: string;
  players?: any;
  currentHole?: number;
}) {
  const [show, setShow] = useState(false);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [showScorecard, setShowScorecard] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
  const t = setTimeout(() => setShow(true), 80);

  generateShareImage();

  return () => clearTimeout(t);
}, []);

  async function generateShareImage() {
  if (!cardRef.current) return;

  const exportWrap = document.createElement("div");

  exportWrap.style.width = "540px";
  exportWrap.style.height = "960px";
  exportWrap.style.position = "fixed";
  exportWrap.style.left = "-99999px";
  exportWrap.style.top = "0";

  // SVG BACKGROUND
  exportWrap.style.backgroundImage =
    "url('/share-background.svg')";
  exportWrap.style.backgroundSize = "540px 960px";
  exportWrap.style.backgroundRepeat = "no-repeat";
  exportWrap.style.backgroundPosition = "center";

  exportWrap.style.display = "flex";
  exportWrap.style.alignItems = "center";
  exportWrap.style.justifyContent = "center";


  // Clone results card
  const clone = cardRef.current.cloneNode(true) as HTMLElement;

  clone.style.transform = "none";
  clone.style.width = "460px";
  clone.style.padding = "24px";

  // Export card styling
  clone.style.background = "#fff";
  clone.style.border = "none";
  clone.style.borderRadius = "24px";
  clone.style.boxShadow =
    "0 12px 30px rgba(0,0,0,0.12)";


  // Make rows larger for share image
  clone.querySelectorAll('[style*="grid"]').forEach((el) => {
    const item = el as HTMLElement;

    item.style.fontSize = "26px";
    item.style.gridTemplateColumns =
      "1fr 120px 100px";
    item.style.padding =
      "12px 24px";
  });


  exportWrap.appendChild(clone);

  document.body.appendChild(exportWrap);


  const canvas = await html2canvas(exportWrap, {
    backgroundColor: null,
    scale: 3,
    useCORS: true,
  });


  document.body.removeChild(exportWrap);


  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve)
  );


  if (!blob) return;


  setShareFile(
    new File([blob], "result.png", {
      type: "image/png",
    })
  );
}
}


  // -----------------------------
  // SHARE IMAGE
  // -----------------------------
  async function handleShare() {
  if (!shareFile) return;

  const shareNames =
    winners.length === 1
      ? winners[0].name
      : winners.map((w) => w.name).join(" & ");

  const shareText = courseName?.trim()
    ? `${shareNames} ${winners.length === 1 ? "won" : "tied"} Points at ${courseName} 🏌️`
    : `${shareNames} ${winners.length === 1 ? "won" : "tied"} Points 🏌️`;

  if (navigator.canShare?.({ files: [shareFile] })) {
    await navigator.share({
      title: "Points Golf",
      text: shareText,
      files: [shareFile],
    });
  }
}

  const sorted = [...(leaderboard || [])].sort(
    (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
  );

  const winnerText =
  winners.length === 1
    ? winners[0].name
    : winners.map((w) => w.name).join(" & ");

const title =
  winners.length === 1
    ? "won"
    : "tied";


  return (
    <div style={screen}>
        <div
          ref={cardRef}
          style={{
            ...card,
            transform: show ? "scale(1)" : "scale(0.9)",
          }}
        >
          <div className="font-display" style={exportHeader}>GAME RESULTS</div>
          <div style={exportWinnerLabel}>
  {winnerText} {title}
  {courseName ? ` at ${courseName}` : ""}
  {" "}with {score} points
</div>
  
          <div style={list}>
            {sorted.map((p, index) => {
              const isWinner = winners.some(
                (w) => w.name === p.name
              );
  
              return (
                <div
                  key={p.name}
                  style={{
                    ...row,
                    border: isWinner
                      ? "1px solid #FFD700"
                      : "0.5px solid rgba(0,0,0,0.3)",
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
        <button
  onClick={handleShare}
  style={shareBtn}
>
  Save Results
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
  border: "0.5px solid rgba(0,0,0,0.3)",
  width: "100%",
};

const shareBtn = {
  ...btn("#C2DD00"),
  border: "none",
};

const playAgainBtn = {
  ...btn("#fff"),
  border: "0.5px solid rgba(0,0,0,0.3)",
};

const exportHeader = { fontSize: 22, fontWeight: 900, paddingBottom: 20, opacity: 0.5, };
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
const shots: React.CSSProperties = {
  opacity: 0.5,
  textAlign: "center",
  fontWeight: 600,
};
const points: React.CSSProperties = {
  fontWeight: 800,
  textAlign: "right",
};

function btn(bg: string): React.CSSProperties {
  return {
    width: "100%",
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
  background: "rgba(0,0,0,0.3)",
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