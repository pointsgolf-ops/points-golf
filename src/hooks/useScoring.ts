export function useScoring() {
    function getScore(holeData: any) {
      if (typeof holeData === "object" && holeData !== null) {
        return holeData.score;
      }
      return holeData;
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
  
        return {
          name: p.name,
          score: p.score,
          points,
        };
      });
    }
  
    function getLeaderboard(players: any) {
      const names = Object.keys(players || {});
  
      return names.map((name) => {
        let totalPoints = 0;
  
        Object.keys(players[name]?.holes || {}).forEach((hole) => {
          const ranked = calculateHolePoints(players, Number(hole));
          const row = ranked.find((p) => p.name === name);
          totalPoints += row?.points || 0;
        });
  
        return {
          name,
          totalPoints,
        };
      });
    }
  
    return {
      calculateHolePoints,
      getLeaderboard,
      getScore,
    };
  }