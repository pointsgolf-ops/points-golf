"use client";

import React, { useMemo } from "react";

type PlayerRow = {
  name: string;
  totalPoints: number;
  totalStrokes?: number;
};

type Props = {
  players: PlayerRow[];
  currentHole?: number;
};

export default function Leaderboard({ players }: Props) {
  const sorted = useMemo(() => {
    return [...(players || [])].sort(
      (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
    );
  }, [players]);

  const holeWinnerPoints = useMemo(() => {
    return Math.max(...(players || []).map(p => p.totalPoints || 0));
  }, [players]);

  return (
    <div style={wrap}>
      <div className="font-display" style={title}>LEADERBOARD</div>

      <div style={list}>
        {sorted.map((p, index) => {
          const isWinner = p.totalPoints === holeWinnerPoints;

          return (
            <div
              key={p.name}
              style={{
                ...row,
                background: isWinner ? "#fff" : "#fff",
                border: isWinner
                  ? "1px solid #FFD700"
                  : "0.5px solid rgba(0,0,0,0.3)",
              }}
            >
              {/* LEFT */}
              <div style={left}>
                <div style={rank}>{index + 1}</div>
                <div style={name}>{p.name}</div>
              </div>

              {/* SHOTS */}
              <div style={shots}>{p.totalStrokes || 0}</div>

              {/* POINTS */}
              <div style={points}>{p.totalPoints} pts</div>

              {/* WINNER BADGE */}
              {isWinner && (
                <div style={badge}></div>
              )}
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div style={empty}>Waiting for players…</div>
      )}
    </div>
  );
}

// -----------------------------
// STYLES
// -----------------------------
const wrap: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const title: React.CSSProperties = {
  fontSize: 25,
  fontWeight: 900,
  textAlign: "center",
};

const list: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  fontSize: 18,
  fontWeight: 700,
  gap: 8,
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 80px 80px",
  alignItems: "center",
  padding: "18px 18px",
  borderRadius: 14,
  background: "#fff",
  border: "0.5px solid rgba(0,0,0,0.3)",

  transition: "all 300ms ease",
  willChange: "transform",
};

const left: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const rank: React.CSSProperties = {
  width: 28,
  fontWeight: 800,
  opacity: 0.6,
};

const name: React.CSSProperties = {
  fontWeight: 700,
};

const shots: React.CSSProperties = {
  textAlign: "center",
  fontWeight: 700,
  opacity: 0.6,
};

const points: React.CSSProperties = {
  textAlign: "right",
  fontWeight: 900,
};

const badge: React.CSSProperties = {
  position: "absolute",
  right: 12,
  fontSize: 14,
};

const empty: React.CSSProperties = {
  textAlign: "center",
  opacity: 0.5,
  padding: 10,
};