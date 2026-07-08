"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  doc,
  onSnapshot,
  setDoc,
  runTransaction
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check } from "lucide-react";

import AppShell from "@/components/AppShell";
import GameCard from "@/components/GameCard";
import ScoreStepper from "@/components/ScoreStepper";
import Leaderboard from "@/components/Leaderboard";
import HoleBreakdown from "@/components/HoleBreakdown";
import WinnerCinematic from "@/components/WinnerCinematic";

export default function GamePage() {
  const params = useParams();
  const code = params?.code as string;

  const router = useRouter();

  const searchParams = useSearchParams();
  const player = searchParams.get("player") || "Unknown";

  const [players, setPlayers] = useState<any>({});
  const [courseName, setCourseName] = useState("");

  const [gameState, setGameState] = useState({
    phase: "lobby",
    currentHole: 1,
    maxHoles: 18,
    host: "",
    status: "active",
  });

  const phase = gameState.phase;
  const currentHole = gameState.currentHole;
  const maxHoles = gameState.maxHoles;
  const host = gameState.host;

  const pressStyle = { transition: "transform 0.08s ease" };

const pressDown = (e: any) => {
  e.currentTarget.style.transform = "scale(0.96)";
};

const pressUp = (e: any) => {
  e.currentTarget.style.transform = "scale(1)";
};

  // -----------------------------
  // FIRESTORE SYNC (SINGLE SOURCE OF TRUTH)
  // -----------------------------
  useEffect(() => {
    if (!code) return;

    const ref = doc(db, "games", code);

    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      setCourseName(data?.courseName || "");

setPlayers((prev: any) => {
  const incoming = data?.players || {};

  return {
    ...prev,
    ...incoming,
  };
});

      setGameState({
        phase: data?.phase || "lobby",
        currentHole: data?.currentHole || 1,
        maxHoles: data?.maxHoles || 18,
        host: data?.host || "",
        status: data?.status || "active",
      });
    });
  }, [code]);

  // -----------------------------
  // SCORE SUBMISSION
  // -----------------------------
  async function submitScore(score: number) {
    if (!code) return;
  
    const ref = doc(db, "games", code);
  
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
  
      if (!snap.exists()) return;
  
      const data = snap.data();
      const players = data.players || {};
  
      const prev = players[player] || {};
      const currentStrokes = prev.totalStrokes ?? 0;
  
      const updatedPlayers = {
        ...players,
        [player]: {
          ...prev,
          holes: {
            ...(prev.holes || {}),
            [currentHole]: score,
          },
          totalStrokes: currentStrokes + score,
        },
      };
  
      const names = Object.keys(updatedPlayers);
  
      const allSubmitted = names.every(
        (n) => updatedPlayers[n]?.holes?.[currentHole] !== undefined
      );
  
      transaction.update(ref, {
        players: updatedPlayers,
        ...(allSubmitted ? { phase: "breakdown" } : {}),
      });
    });
  }

  // -----------------------------
  // NEXT HOLE (HOST ONLY)
  // -----------------------------
  async function nextHole() {
    if (player !== host) return;

    const next = currentHole + 1;

    await setDoc(
      doc(db, "games", code!),
      {
        currentHole: next,
        phase: next > maxHoles ? "win" : "game",
      },
      { merge: true }
    );
  }

  // -----------------------------
  // ABANDON GAME (HOST ONLY)
  // -----------------------------
  async function abandonGame() {
    if (player !== host) return;
  
    await setDoc(
      doc(db, "games", code!),
      {
        status: "abandoned",
      },
      { merge: true }
    );
  }

  // -----------------------------
  // START GAME
  // -----------------------------
  async function startGame() {
    if (player !== host) return;
  
    await setDoc(
      doc(db, "games", code!),
      {
        phase: "game",
        currentHole: 1,
      },
      { merge: true }
    );
  }

  // -----------------------------
  // LEADERBOARD
  // -----------------------------
  const leaderboard = useMemo(() => {
    const names = Object.keys(players || {});

    return names.map((name) => {
      const p = players[name];
      let totalPoints = 0;

      Object.keys(p?.holes || {}).forEach((hole) => {
        const entries = Object.values(players).map((pl: any) => pl.holes?.[hole]);
        const scores = entries.filter((s) => typeof s === "number");

        const myScore = p?.holes?.[hole];
        if (typeof myScore !== "number") return;

        let points = 0;
        scores.forEach((s) => {
          if (myScore < s) points += 1;
        });

        totalPoints += points;
      });

      return {
        name,
        totalPoints,
        totalStrokes: p?.totalStrokes || 0,
      };
    });
  }, [players]);

  const ranked = useMemo(() => {
    const entries = Object.keys(players || {}).map((name) => ({
      name,
      score: players[name]?.holes?.[currentHole],
    }));

    const valid = entries.filter((p) => typeof p.score === "number");

    return valid.map((p) => {
      let points = 0;
      valid.forEach((o) => {
        if (o.name === p.name) return;
        if (p.score < o.score) points += 1;
      });
      return { ...p, points };
    });
  }, [players, currentHole]);

  const winner = useMemo(() => {
    const sorted = [...leaderboard].sort(
      (a, b) => b.totalPoints - a.totalPoints
    );

    return sorted[0] || { name: "No winner", totalPoints: 0 };
  }, [leaderboard]);

  // -----------------------------
  // SCORECARD
  // -----------------------------
  const holes = (players[player]?.holes ?? {}) as Record<string, number>;

  const totals = Object.entries(holes).reduce(
    (acc, [hole, strokes]) => {
      acc.strokes += Number(strokes || 0);
      return acc;
    },
    { strokes: 0 }
  );

  const scorecard = (
    <>
      {/* HEADER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 70px",
          padding: "16px 0 12px",
          borderBottom: "1px solid rgba(0,0,0,0.3)",
          fontSize: 18,
          fontWeight: 600,
          opacity: 0.5,
        }}
      >
        <div>Hole</div>
  
        <div style={{ textAlign: "center" }}>
          Strokes
        </div>
  
        <div style={{ textAlign: "right" }}>
          Points
        </div>
      </div>
  
  
      {/* HOLES */}
      {Object.entries(holes).map(([hole, strokes]) => {
  
        const entries = Object.values(players)
          .map((p: any) => p.holes?.[hole])
          .filter((s) => typeof s === "number");
  
  
        const myScore = Number(strokes);
  
        let points = 0;
  
        entries.forEach((score) => {
          if (myScore < score) {
            points += 1;
          }
        });
  
  
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
              borderBottom: "0.5px solid rgba(0,0,0,0.3)",
            }}
          >
  
            <div
              style={{
                fontWeight: 700,
              }}
            >
              Hole {hole}
            </div>
  
  
            <div
              style={{
                textAlign: "center",
                opacity: 0.5,
              }}
            >
              {strokes}
            </div>
  
  
            <div
              style={{
                textAlign: "right",
                fontWeight: 800,
              }}
            >
              +{points}
            </div>
  
          </div>
        );
      })}
  
  
      {/* TOTAL */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 70px",
          alignItems: "center",
          padding: "18px 0",
          fontSize: 18,
          fontWeight: 800,
          borderTop: "1px solid rgba(0,0,0,0.3)",
        }}
      >
  
        <div>
          Total
        </div>
  
  
        <div style={{ textAlign: "center" }}>
          {totals.strokes}
        </div>
  
  
        <div style={{ textAlign: "right" }}>
          +
          {Object.entries(holes).reduce((total, [hole, strokes]) => {
  
            const entries = Object.values(players)
              .map((p: any) => p.holes?.[hole])
              .filter((s) => typeof s === "number");
  
            let points = 0;
  
            entries.forEach((score) => {
              if (Number(strokes) < score) {
                points++;
              }
            });
  
            return total + points;
  
          }, 0)}
        </div>
  
      </div>
    </>
  );

  // -----------------------------
  // UI
  // -----------------------------

  if (gameState.status === "abandoned") {
    return (
      <AppShell showScorecardButton={false}>
        <GameCard>
          <div
            className="font-display"
            style={{
              textAlign: "center",
              fontSize: 36,
              fontWeight: 900,
              
            }}
            onMouseDown={down}
              onMouseUp={up}
              onMouseLeave={up}
          >
            GAME OVER
          </div>
  
          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              opacity: 0.6,
              fontSize: 18,
            }}
          >
            The host has ended this game.
          </div>
  
          <button
  onClick={() => router.push("/")}
  style={{
    padding: 18,
    marginTop: 24,
    background: "none",
    borderRadius: 14,
    border: "0.5px solid rgba(0,0,0,0.3)",
    fontWeight: 700,
    fontSize: 20,
    width: "100%",
    ...pressStyle,
  }}
  onMouseDown={pressDown}
  onMouseUp={pressUp}
  onMouseLeave={pressUp}
>
  Play Again
</button>
  
        </GameCard>
      </AppShell>
    );
  }

  if (phase === "lobby") {
    return (
      <AppShell showScorecardButton={false}>
        <GameCard>
          <div className="font-display" style={{ textAlign: "center", fontWeight: 900, fontSize: 22, opacity: 0.5, }}>GAME CODE</div>
          <div style={{ textAlign: "center", fontWeight: 900, fontSize: 50 }}>{code}</div>
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
    Teeing off with...
  </div>

  {Object.keys(players).map((name) => (
    <div
    key={name}
    style={{
      fontSize: 20,
      fontWeight: 800,
      border: "0.5px solid rgba(0,0,0,0.3)",
      padding: 18,
      borderRadius: 14,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <Check size={26} /> {name}
  </div>
  ))}
</div>

          {player === host ? (
            <button
            onClick={startGame}
            style={{ ...btn, marginTop: 16, ...pressStyle }}
            onMouseDown={pressDown}
            onMouseUp={pressUp}
            onMouseLeave={pressUp}
          >
            Start Game
          </button>
          ) : (
            <div>Waiting for host...</div>
          )}
        </GameCard>
      </AppShell>
    );
  }

  const submitted =
  players?.[player]?.holes?.[currentHole] !== undefined;
  
  if (phase === "game") {
    return (
      <AppShell scorecard={scorecard}>
        <GameCard>
          <div className="font-display" style={{ textAlign: "center", fontWeight: 900, fontSize: 25 }}>HOLE {currentHole}</div>
          <ScoreStepper
  onSubmit={submitScore}
  submitted={submitted}
/>

{player === host && (
  <button
    onClick={abandonGame}
    style={{
      ...btn,
      marginTop: 16,
      background: "#fff",
      border: "0.5px solid #000",
    }}
  >
    End Game
  </button>
)}
        </GameCard>

        <GameCard>
          <Leaderboard players={leaderboard} currentHole={currentHole} />
        </GameCard>
      </AppShell>
    );
  }

  if (phase === "breakdown") {
    return (
      <AppShell scorecard={scorecard}>
        <GameCard>
          <HoleBreakdown
            players={players}
            currentHole={currentHole}
            ranked={ranked}
          />
        </GameCard>

        {player === host ? (
          <button
          onClick={nextHole}
          style={{ ...btn, ...pressStyle }}
          onMouseDown={pressDown}
          onMouseUp={pressUp}
          onMouseLeave={pressUp}
        >
          Next Hole
        </button>
        ) : (
          <div style={{ textAlign: "center" }}>
            Waiting for host...
          </div>
        )}
      </AppShell>
    );
  }

  if (phase === "win") {
    return (
      <AppShell scorecard={scorecard}>
        <WinnerCinematic
          winner={winner.name}
          score={winner.totalPoints}
          leaderboard={leaderboard}
          courseName={courseName}
          players={players}
        />
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
  background: "#C2DD00",
  color: "#000",
  fontWeight: 700,
  fontSize: 20,
};