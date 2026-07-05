"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AppShell from "@/components/AppShell";

import GameCard from "@/components/GameCard";
import ScoreStepper from "@/components/ScoreStepper";
import Leaderboard from "@/components/Leaderboard";
import HoleBreakdown from "@/components/HoleBreakdown";
import WinnerCinematic from "@/components/WinnerCinematic";

import { haptic } from "@/lib/haptics";

type Mode = "lobby" | "game" | "breakdown" | "win";

export default function GamePage() {
  const params = useParams();
  const code = params?.code as string;

  const searchParams = useSearchParams();
  const player = searchParams.get("player") || "Unknown";

  const [players, setPlayers] = useState<any>({});
  const [currentHole, setCurrentHole] = useState(1);
  const [maxHoles, setMaxHoles] = useState(18);
  const [mode, setMode] = useState<Mode>("lobby");
  const [host, setHost] = useState("");
  const [courseName, setCourseName] = useState("");

  const [advanceAt, setAdvanceAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  // local clock ticker for countdown UI
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const pressStyle = { transition: "transform 0.08s ease" };
  const pressDown = (e: any) => (e.currentTarget.style.transform = "scale(0.96)");
  const pressUp = (e: any) => (e.currentTarget.style.transform = "scale(1)");

  function getScore(value: any) {
    if (typeof value === "object" && value !== null) return value.score;
    return value;
  }

  function calculateHolePoints(players: any, hole: number) {
    const entries = Object.keys(players || {}).map((name) => ({
      name,
      score: getScore(players[name]?.holes?.[hole]),
    }));

    const valid = entries.filter((p) => typeof p.score === "number");

    return valid.map((p) => {
      let points = 0;
      valid.forEach((o) => {
        if (o.name === p.name) return;
        if (p.score < o.score) points += 1;
      });
      return { name: p.name, score: p.score, points };
    });
  }

  const leaderboard = useMemo(() => {
    const names = Object.keys(players || {});
    return names.map((name) => {
      const player = players[name];
      let totalPoints = 0;

      Object.keys(player?.holes || {}).forEach((hole) => {
        const ranked = calculateHolePoints(players, Number(hole));
        const row = ranked.find((p) => p.name === name);
        totalPoints += row?.points || 0;
      });

      return {
        name,
        totalPoints,
        totalStrokes: player?.totalStrokes || 0,
      };
    });
  }, [players]);

  const ranked = useMemo(
    () => calculateHolePoints(players, currentHole),
    [players, currentHole]
  );

  // -----------------------------
// SCORECARD OVERLAY
// -----------------------------

const holes = (players[player]?.holes ?? {}) as Record<string, number>;

const totals = Object.entries(holes).reduce(
  (acc, [hole, strokes]) => {
    const ranking = calculateHolePoints(players, Number(hole));
    const me = ranking.find((p) => p.name === player);

    acc.strokes += Number(strokes || 0);
    acc.points += Number(me?.points || 0);

    return acc;
  },
  { strokes: 0, points: 0 }
);

const scorecard = (
  <>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 100px 70px",
        padding: "16px 0 12px",
        borderBottom: "1px solid #000",
        fontSize: 18,
        fontWeight: 600,
        opacity: 0.5,
      }}
    >
      <div>Hole</div>
      <div style={{ textAlign: "center" }}>Strokes</div>
      <div style={{ textAlign: "right" }}>Points</div>
    </div>

    {Object.entries(holes).map(([hole, strokes]: [string, number]) => {
      const ranking = calculateHolePoints(players, Number(hole));
      const me = ranking.find((p) => p.name === player);

      return (
        <div
          key={hole}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 70px",
            alignItems: "center",
            padding: "18px 0",
            fontSize: 18,
            fontWeight: 600,
            borderBottom: "0.5px solid #000",
          }}
        >
          <div style={{ fontWeight: 700 }}>Hole {hole}</div>

          <div style={{ textAlign: "center", opacity: 0.5 }}>
            {strokes}
          </div>

          <div style={{ textAlign: "right", fontWeight: 800 }}>
            +{me?.points ?? 0}
          </div>
        </div>
      );
    })}

    {/* TOTAL ROW */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 100px 70px",
        alignItems: "center",
        padding: "18px 0",
        fontSize: 18,
        fontWeight: 800,
        borderTop: "1px solid #000",
      }}
    >
      <div>Total</div>

      <div style={{ textAlign: "center" }}>
        {totals.strokes}
      </div>

      <div style={{ textAlign: "right" }}>
        +{totals.points}
      </div>
    </div>
  </>
);

  // -----------------------------
  // FIRESTORE SYNC
  // -----------------------------
  useEffect(() => {
    if (!code) return;

    const ref = doc(db, "games", code);

    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      setCourseName(data?.courseName || "");
      setPlayers(data.players || {});
      setCurrentHole(data.currentHole || 1);
      setMaxHoles(data.maxHoles || 18);
      setHost(data.host || "");

      setAdvanceAt(data.advanceAt ?? null);

      if (!data.started) {
        setMode("lobby");
        return;
      }

      const submitted =
        data.players?.[player]?.holes?.[data.currentHole] !== undefined;

      setMode(submitted ? "breakdown" : "game");
    });
  }, [code, player]);

  // -----------------------------
  // CHECK IF ALL SUBMITTED
  // -----------------------------
  const allSubmitted = useMemo(() => {
    const names = Object.keys(players || {});
    if (!names.length) return false;

    return names.every(
      (n) => players?.[n]?.holes?.[currentHole] !== undefined
    );
  }, [players, currentHole]);

  // -----------------------------
  // LAST PLAYER TRIGGERS TIMER
  // -----------------------------
  useEffect(() => {
    if (!code) return;
    if (!allSubmitted) return;
    if (advanceAt) return;

    const start = Date.now();
    const target = start + 5000;

    setDoc(
      doc(db, "games", code),
      { advanceAt: target },
      { merge: true }
    );
  }, [allSubmitted, advanceAt, code]);

  // -----------------------------
  // SYNCED COUNTDOWN + ADVANCE
  // -----------------------------
  useEffect(() => {
    if (!advanceAt) return;

    const remaining = advanceAt - now;

    if (remaining <= 0) {
      (async () => {
        const next = currentHole + 1;

        if (next > maxHoles) {
          setMode("win");
          return;
        }

        await setDoc(
          doc(db, "games", code!),
          {
            currentHole: next,
            advanceAt: null,
          },
          { merge: true }
        );

        setAdvanceAt(null);
        setMode("game");
      })();
    }
  }, [now, advanceAt, currentHole, maxHoles, code]);

  // -----------------------------
  // SUBMIT SCORE
  // -----------------------------
  async function submitScore(score: number) {
    if (!code) return;

    const ref = doc(db, "games", code);
    const snap = await getDoc(ref);

    const data = snap.data();
    const existing = data?.players || {};

    const prev = existing[player] || {};
    const currentStrokes = prev.totalStrokes ?? 0;

    await setDoc(
      ref,
      {
        players: {
          ...existing,
          [player]: {
            ...prev,
            holes: {
              ...(prev.holes || {}),
              [currentHole]: score,
            },
            totalStrokes: currentStrokes + score,
          },
        },
      },
      { merge: true }
    );
  }

  function getWinner() {
    const sorted = [...leaderboard].sort(
      (a, b) => b.totalPoints - a.totalPoints
    );

    return {
      name: sorted?.[0]?.name || "No winner",
      score: sorted?.[0]?.totalPoints || 0,
    };
  }

  async function startGame() {
    if (!code) return;
  
    await setDoc(
      doc(db, "games", code),
      {
        started: true,
        currentHole: 1,
        advanceAt: null,
      },
      { merge: true }
    );
  
    setMode("game");
  }

  // -----------------------------
  // UI
  // -----------------------------

// -----------------------------
  // LOBBY
  // -----------------------------
  if (mode === "lobby") {
    return (
      <AppShell showScorecardButton={false}>
          <GameCard>
          <div
            style={{
              marginTop: 20,
              textAlign: "center",
              fontSize: 20,
              fontWeight: 700,
              opacity: 0.5,
            }}
          >
          Game Code:</div>
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <strong style={{ fontSize: 50 }}>{code}</strong>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 12,
                background: "#fff",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  marginBottom: 10,
                }}
              >
                {courseName.trim()
                  ? `Teeing off at ${courseName} with...`
                  : "Teeing off with..."}
              </div>

              {Object.keys(players).map((name) => (
                <div key={name} style={{fontSize: 20, fontWeight: 800, border: "0.5px solid #000", padding: 18, borderRadius: 14, marginBottom: 10, }}>
                  👤 {name}
                </div>
              ))}
            </div>

            {player === host ? (
              <button
                onClick={startGame}
                style={{
                  ...btn,
                  marginTop: 16,
                  fontSize: 20,
                  ...pressStyle,
                }}
                onMouseDown={pressDown}
                onMouseUp={pressUp}
                onMouseLeave={pressUp}
              >
                Start Game
              </button>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  marginTop: 16,
                  fontSize: 18,
                  fontWeight: 600,
                  opacity: 0.5,
                }}
              >
                Waiting for host to start game...
              </div>
            )}
          </GameCard>
      </AppShell>
    );
  }

  
  // -----------------------------
// GAME
// -----------------------------
if (mode === "game") {
  return (
    <AppShell scorecard={scorecard}>
        <GameCard>
          <div
            style={{
              padding: 18,
              textAlign: "center",
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: "-0.03em"
            }}
          >
            Hole {currentHole}
          </div>

          <ScoreStepper onSubmit={submitScore} />
        </GameCard>

        <GameCard>
          <Leaderboard players={leaderboard} currentHole={currentHole} />
        </GameCard>
    </AppShell>
  );
}

// -----------------------------
// BREAKDOWN
// -----------------------------
if (mode === "breakdown") {
  const remaining = advanceAt ? Math.max(0, advanceAt - now) : 0;
  const seconds = Math.ceil(remaining / 1000);

  return (
    <AppShell scorecard={scorecard}>
        <GameCard>
          <HoleBreakdown
            players={players}
            currentHole={currentHole}
            ranked={ranked}
          />
        </GameCard>

        {/* countdown */}
        {advanceAt && (
          <div
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: 700,
              opacity: 0.5,
            }}
          >
            Ready in {seconds}...
          </div>
        )}

    </AppShell>
  );
}

// -----------------------------
// WIN
// -----------------------------
if (mode === "win") {
  const winner = getWinner();

  return (
    <AppShell scorecard={scorecard}>
        <WinnerCinematic
  winner={winner.name}
  score={winner.score}
  leaderboard={leaderboard}
  courseName={courseName}
  players={players} />
  </AppShell>
  );
}

  return null;
}

const btn: React.CSSProperties = {
  width: "100%",
  padding: 18,
  borderRadius: 14,
  border: "none",
  background: "#c18e44",
  color: "#000",
  fontWeight: 700,
  fontSize: 20,
};