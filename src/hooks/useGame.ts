"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useGame(code: string, player: string) {
  const [players, setPlayers] = useState<any>({});
  const [currentHole, setCurrentHole] = useState(1);
  const [started, setStarted] = useState(false);
  const [maxHoles, setMaxHoles] = useState(18);

  useEffect(() => {
    if (!code) return;

    const ref = doc(db, "games", code);

    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      setPlayers(data.players || {});
      setCurrentHole(data.currentHole || 1);
      setStarted(!!data.started);
      setMaxHoles(data.maxHoles || 18);
    });
  }, [code]);

  const hasSubmitted = !!players?.[player]?.holes?.[currentHole];

  return {
    players,
    currentHole,
    started,
    maxHoles,
    hasSubmitted,
  };
}