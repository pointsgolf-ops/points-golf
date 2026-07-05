"use client";

import { useMemo } from "react";

type Players = Record<string, any>;

function getScore(value: any) {
  if (typeof value === "object" && value !== null) return value.score;
  return value;
}

function calculateHolePoints(players: Players, hole: number) {
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

    return {
      name: p.name,
      score: p.score,
      points,
    };
  });
}

export default function useScorecard({
  players,
  currentHole,
  currentPlayer,
}: {
  players: Players;
  currentHole: number;
  currentPlayer: string;
}) {
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

  const holeScorecard = useMemo(() => {
    const playerData = players?.[currentPlayer]?.holes || {};

    return Object.keys(playerData)
      .map((h) => {
        const hole = Number(h);

        const holePoints = calculateHolePoints(players, hole)
          .find((p) => p.name === currentPlayer);

        return {
          hole,
          strokes: playerData[h],
          points: holePoints?.points || 0,
        };
      })
      .sort((a, b) => a.hole - b.hole);
  }, [players, currentPlayer]);

  return {
    leaderboard,
    holeScorecard,
  };
}