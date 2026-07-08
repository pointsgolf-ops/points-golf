"use client";

import React from "react";

type RankedPlayer = {
  name: string;
  score: number;
  points: number;
};

type Props = {
  players: any;
  currentHole: number;
  ranked: RankedPlayer[];
};

export default function HoleBreakdown({
  players,
  currentHole,
  ranked,
}: Props) {
  const sorted = [...ranked].sort((a, b) => b.points - a.points);

  // -----------------------------
  // FIND WINNER(S) OF HOLE
  // -----------------------------
  const maxPoints = Math.max(...sorted.map((p) => p.points || 0));
  const winners = sorted.filter((p) => p.points === maxPoints);

  return (
    <div style={wrap}>
    <div className="font-display" style={{ textAlign: "center", fontWeight: 900, fontSize: 25 }}>HOLE {currentHole} RESULTS</div>

      <div style={list}>
        {sorted.map((p, index) => {
          const isWinner = winners.some((w) => w.name === p.name);

          return (
            <div
              key={p.name}
              style={{
                ...row,
                border: isWinner
                  ? "1px solid #FFD700"
                  : "0.5px solid rgba(0,0,0,0.3)",

                background: isWinner ? "#fff" : "#fff",
                transition: "all 200ms ease",
              }}
            >
              <div style={left}>
                <div style={rank}>{index + 1}</div>
                <div style={name}>{p.name}</div>
              </div>

              <div style={scoreCenter}>{p.score}</div>

              <div style={points}>+{p.points} pts</div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div style={empty}>
          Waiting for all players to submit scores…
        </div>
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
  gap: 12,
};

const title: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 900,
  letterSpacing: "-0.03em",
  textAlign: "center",
  padding: 18,
};

const sub: React.CSSProperties = {
  fontSize: 12,
  textAlign: "center",
  opacity: 0.6,
};

const list: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginTop: 10,
  fontSize: 18,
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 100px 80px",
  alignItems: "center",
  padding: "18px",
  fontSize: 18,
  borderRadius: 14,
  background: "#fff",
};

const left: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const scoreCenter: React.CSSProperties = {
  textAlign: "center",
  fontWeight: 600,
  fontSize: 18,
  opacity: 0.5,
};

const points: React.CSSProperties = {
  textAlign: "right",
  fontWeight: 800,
  fontSize: 18,
};

const rank: React.CSSProperties = {
  fontWeight: 800,
  width: 30,
};

const name: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 18,
};

const empty: React.CSSProperties = {
  textAlign: "center",
  opacity: 0.5,
  padding: 1,
};