"use client";

import { useRef, useState } from "react";

export default function ScoreStepper({
  onSubmit,
  disabled,
  submitted,
}: {
  onSubmit: (score: number) => void;
  disabled?: boolean;
  submitted?: boolean;
}) {
  const [scoreValue, setScoreValue] = useState(0);
  const ref = useRef(0);

  function inc() {
    if (disabled || submitted) return;
    ref.current += 1;
    setScoreValue(ref.current);
  }

  function dec() {
    if (disabled || submitted) return;
    ref.current = Math.max(0, ref.current - 1);
    setScoreValue(ref.current);
  }

  function submit() {
    if (submitted) return;
    onSubmit(ref.current);
  }

  const press = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "scale(0.94)";
  };

  const release = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "scale(1)";
  };

  if (submitted) {
    return (
      <div
        style={{
          textAlign: "center",
          fontSize: 18,
          fontWeight: 600,
          opacity: 0.5,
          padding: 10,
        }}
      >
        <p className="font-display" style={{fontSize: 22,
          fontWeight: 900}}>SCORE SUBMITTED</p>
        Waiting for other players...
      </div>
    );
  }
  
  return (
    <div style={wrap}>
      <div style={row}>
        <button
          onClick={dec}
          style={btn}
          onMouseDown={press}
          onMouseUp={release}
        >
          −
        </button>
  
        <div className="font-display" style={scoreDisplay}>{scoreValue}</div>
  
        <button
          onClick={inc}
          style={btn}
          onMouseDown={press}
          onMouseUp={release}
        >
          +
        </button>
      </div>
  
      <button
        onClick={submit}
        style={submitBtn}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        Submit Score
      </button>
    </div>
  );
}

// -----------------------------
// STYLES
// -----------------------------

const wrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 14,
};

const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 24,
};

const scoreDisplay: React.CSSProperties = {
  fontSize: 150,
  fontWeight: 700,
  minWidth: 140,
  textAlign: "center",
};

const btn: React.CSSProperties = {
  width: 70,
  height: 70,
  borderRadius: 9999,
  border: "0.5px solid rgba(0,0,0,0.3)",
  color: "#000",
  background: "#fff",
  fontSize: 28,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.08s ease",
};

const submitBtn: React.CSSProperties = {
  width: "100%",
  padding: 18,
  borderRadius: 14,
  background: "#C2DD00",
  color: "#000",
  fontSize: 20,
  fontWeight: 700,
  border: "none",
  transition: "transform 0.08s ease",
};