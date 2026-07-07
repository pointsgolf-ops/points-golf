"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AppShell from "@/components/AppShell";

<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png"></link>

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

type Mode = "home" | "create" | "join";

export default function Home() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("home");

  const [name, setName] = useState("");
  const [maxHoles, setMaxHoles] = useState<9 | 18>(9);
  const [joinCode, setJoinCode] = useState("");

  // NEW: optional course name
  const [courseName, setCourseName] = useState("");

  // -----------------------------
  // CREATE GAME
  // -----------------------------
  async function handleCreateGame() {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    const code = generateCode();

    await setDoc(doc(db, "games", code), {
      started: false,
      currentHole: 1,
      maxHoles,
      host: name,
      courseName: courseName.trim() || "", // NEW FIELD (optional)
      players: {
        [name]: {
          name,
          holes: {},
          totalPoints: 0,
          totalStrokes: 0,
        },
      },
    });

    router.push(`/game/${code}?player=${encodeURIComponent(name)}`);
  }

  // -----------------------------
  // JOIN GAME
  // -----------------------------
  async function handleJoinGame() {

    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
  
    if (!joinCode.trim()) {
      alert("Please enter a game code");
      return;
    }
  
    const gameCode = joinCode.toUpperCase();
  
    const ref = doc(db, "games", gameCode);
  
  
    await runTransaction(db, async (transaction) => {
  
      const snap = await transaction.get(ref);
  
      if (!snap.exists()) {
        throw new Error("Game not found");
      }
  
  
      const data = snap.data();
  
      const existingPlayers = data.players || {};
  
  
      // Do nothing if player already exists
      if (existingPlayers[name]) {
        return;
      }
  
  
      transaction.update(ref, {
  
        [`players.${name}`]: {
          name,
          holes: {},
          totalPoints: 0,
          totalStrokes: 0,
        }
  
      });
  
    });
  
  
    router.push(
      `/game/${gameCode}?player=${encodeURIComponent(name)}`
    );
  }

  const press = {
    transition: "transform 0.08s ease",
  };

  const down = (e: any) =>
    (e.currentTarget.style.transform = "scale(0.96)");

  const up = (e: any) =>
    (e.currentTarget.style.transform = "scale(1)");

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <AppShell
  showScorecardButton={false}
  showFAQButton={true}
  faq={
    <>
      <p><b>How does Points work?</b><br />It’s simple. Score one point for every player you beat outright on each hole..</p>
      <p><b>Stoke play or match play?</b><br />A bit of both. Strokes are recorded each hole and used to calculate your points. The total number of points over 18 holes determines the winner. Like match play, every hole is its own contest, so one bad hole won’t ruin your round, but one great hole can quickly move you up the leaderboard.</p>
      <p><b>Where can I play?</b><br />Points works on any course. No ratings or setup required.</p>
      <p><b>How many players and holes can I play?</b><br />Points works with 2+ players and can be played over 9 or 18 holes.</p>
      <p><b>Can I view my score during a round?</b><br />Yes. Your live scorecard is always available so you can review strokes and points hole-by-hole at any time.</p>
      <p><b>How do handicaps work?</b><br />Points uses gross scores by default. If your group prefers, handicaps can be adjusted manually before entering scores for each hole.</p>
    </>
  }
>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* ---------------- HOME ---------------- */}
        {mode === "home" && (
          <>
          <img src="/points-home.svg" style={{ width: "100%", height: "auto" }} />
            <button 
              onClick={() => setMode("create")}
              style={{
                padding: 18,
                background: "#c18e44",
                border: "none",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 20,
                ...press,
              }}
              onMouseDown={down}
              onMouseUp={up}
              onMouseLeave={up}
            >
              Create Game
            </button>
  
            <button
              onClick={() => setMode("join")}
              style={{
                padding: 18,
                background: "none",
                borderRadius: 14,
                border: "0.5px solid #000",
                fontWeight: 700,
                fontSize: 20,
                ...press,
              }}
              onMouseDown={down}
              onMouseUp={up}
              onMouseLeave={up}
            >
              Join Game
            </button>
          </>
        )}
  
        {/* ---------------- CREATE ---------------- */}
        {mode === "create" && (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              style={{
                padding: 18,
                borderRadius: 14,
                background: "#fff",
                border: "0.5px solid #000",
                fontSize: 20,
              }}
            />
  
            <input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Course Name (Optional)"
              style={{
                padding: 18,
                borderRadius: 14,
                background: "#fff",
                border: "0.5px solid #000",
                fontSize: 20,
              }}
            />
  
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setMaxHoles(9)}
                style={{
                  flex: 1,
                  padding: 18,
                  borderRadius: 14,
                  fontSize: 20,
                  border: "0.5px solid #222",
                  background: maxHoles === 9 ? "#000" : "#fff",
                  color: maxHoles === 9 ? "#fff" : "#000",
                  fontWeight: 600,
                  ...press,
                }}
                onMouseDown={down}
                onMouseUp={up}
                onMouseLeave={up}
              >
                9
              </button>
  
              <button
                onClick={() => setMaxHoles(18)}
                style={{
                  flex: 1,
                  padding: 18,
                  borderRadius: 14,
                  fontSize: 20,
                  border: "0.5px solid #000",
                  background: maxHoles === 18 ? "#000" : "#fff",
                  color: maxHoles === 18 ? "#fff" : "#000",
                  fontWeight: 600,
                  ...press,
                }}
                onMouseDown={down}
                onMouseUp={up}
                onMouseLeave={up}
              >
                18
              </button>
            </div>
  
            <button
              onClick={handleCreateGame}
              style={{
                padding: 18,
                background: "#c18e44",
                border: "none",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 20,
                ...press,
              }}
              onMouseDown={down}
              onMouseUp={up}
              onMouseLeave={up}
            >
              Create Game
            </button>
  
            <button onClick={() => setMode("home")} style={{ opacity: 0.5, paddingTop: 10, fontWeight: 500,
                fontSize: 20, }}>
              Go Back
            </button>
          </>
        )}
  
        {/* ---------------- JOIN ---------------- */}
        {mode === "join" && (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              style={{
                padding: 18,
                borderRadius: 14,
                background: "#fff",
                border: "0.5px solid #000",
                fontSize: 20,
              }}
            />
  
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="GAME CODE"
              style={{
                padding: 18,
                borderRadius: 14,
                background: "#fff",
                border: "0.5px solid #000",
                fontSize: 20,
              }}
            />
  
            <button
              onClick={handleJoinGame}
              style={{
                padding: 18,
                background: "#c18e44",
                border: "none",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 20,
                ...press,
              }}
              onMouseDown={down}
              onMouseUp={up}
              onMouseLeave={up}
            >
              Join Game
            </button>
  
            <button onClick={() => setMode("home")} style={{ opacity: 0.6, paddingTop: 10, fontWeight: 500,
                fontSize: 20, }}>
              Go Back
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}