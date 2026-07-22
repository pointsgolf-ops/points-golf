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
  
  
    try {
      await runTransaction(db, async (transaction) => {
    
        const snap = await transaction.get(ref);
    
        if (!snap.exists()) {
          throw new Error("Game not found");
        }
    
        const data = snap.data();
    
        const existingPlayers = data.players || {};
    
        const nameTaken = Object.keys(existingPlayers).some(
          (playerName) =>
            playerName.trim().toLowerCase() === name.trim().toLowerCase()
        );
    
        if (nameTaken) {
          throw new Error("Name already taken");
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
    
    } catch (error: any) {
      alert(error.message);
    }
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
      <p><b>How does Points work?</b><br />Points is a side game played alongside your normal round of golf.<br /><br />Simply record your stroke play score as you normally would, and be awarded one point for every opponent you beat outright on that hole. Each tee box marks the beginning of a new contest, and a new opportunity to earn points.<br /><br />The player with the most points at the end of the round wins.</p>
      <p><b>Where can I play?</b><br />Points works on any course. No ratings, indexes or maps required.</p>
      <p><b>How many players and holes can I play?</b><br />You'll need at least two players and can play over 9 or 18 holes.</p>
      <p><b>Can I view my score during a round?</b><br />Yes. Your live scorecard is always available and shows both your stroke play scores and points totals.</p>
      <p><b>How do handicaps work?</b><br />Points uses gross scores by default. If your group prefers to play with handicaps, simply adjust scores before entering them each hole.</p>
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
          <object data="/points-home.svg"></object>
            <button 
              onClick={() => setMode("create")}
              style={{
                padding: 18,
                background: "#D7EE44",
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
                background: "#fff",
                borderRadius: 14,
                border: "0.5px solid rgba(0,0,0,0.3)",
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
                color: "#000",
                border: "0.5px solid rgba(0,0,0,0.3)",
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
                color: "#000",
                border: "0.5px solid rgba(0,0,0,0.3)",
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
                  border: "0.5px solid rgba(0,0,0,0.3)",
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
                  border: "0.5px solid rgba(0,0,0,0.3)",
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
                background: "#D7EE44",
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
                color: "#000",
                border: "0.5px solid rgba(0,0,0,0.3)",
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
                color: "#000",
                border: "0.5px solid rgba(0,0,0,0.3)",
                fontSize: 20,
              }}
            />
  
            <button
              onClick={handleJoinGame}
              style={{
                padding: 18,
                background: "#D7EE44",
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