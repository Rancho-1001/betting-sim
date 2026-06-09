// Derive summary stats from a list of bet records.
// Each record must have: { won: boolean, bankroll: number, stake: number }
export function computeStats(records, startBankroll) {
  const total = records.length;
  if (total === 0) {
    return {
      total: 0, wins: 0, losses: 0, winRate: 0,
      longestWinStreak: 0, longestLossStreak: 0,
      peak: startBankroll, maxDrawdown: 0, maxDrawdownPct: 0,
      totalStaked: 0, netProfit: 0, roi: 0,
    };
  }

  let wins = 0, losses = 0;
  let curWin = 0, curLoss = 0, longestWinStreak = 0, longestLossStreak = 0;
  let peak = startBankroll, maxDrawdown = 0, maxDrawdownPct = 0;
  let totalStaked = 0;

  for (const r of records) {
    if (r.won) {
      wins++;
      curWin++; curLoss = 0;
      longestWinStreak = Math.max(longestWinStreak, curWin);
    } else {
      losses++;
      curLoss++; curWin = 0;
      longestLossStreak = Math.max(longestLossStreak, curLoss);
    }
    totalStaked += r.stake ?? 0;

    if (r.bankroll > peak) peak = r.bankroll;
    const dd = peak - r.bankroll;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      maxDrawdownPct = peak > 0 ? (dd / peak) * 100 : 0;
    }
  }

  const finalBankroll = records[records.length - 1].bankroll;
  const netProfit = finalBankroll - startBankroll;

  return {
    total, wins, losses,
    winRate: total > 0 ? (wins / total) * 100 : 0,
    longestWinStreak, longestLossStreak,
    peak, maxDrawdown, maxDrawdownPct,
    totalStaked,
    netProfit,
    roi: startBankroll > 0 ? (netProfit / startBankroll) * 100 : 0,
  };
}
