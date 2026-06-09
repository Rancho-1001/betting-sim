export function simulateYear(startBankroll, units, odds, winRate, seed) {
  let bankroll = startBankroll;
  const data = [{ day: 0, bankroll: parseFloat(bankroll.toFixed(2)) }];
  const log = [];
  let wins = 0, losses = 0;
  let rng = seed;
  const nextRand = () => {
    rng = (rng * 1664525 + 1013904223) & 0xffffffff;
    return (rng >>> 0) / 0xffffffff;
  };

  for (let day = 1; day <= 365; day++) {
    const unit = bankroll / units;
    const bet = unit;
    const won = nextRand() < winRate;
    let delta;
    if (won) {
      delta = bet * (odds - 1);
      bankroll += delta;
      wins++;
    } else {
      delta = -bet;
      bankroll -= bet;
      losses++;
    }
    if (bankroll <= 0) { bankroll = 0; }
    data.push({ day, bankroll: parseFloat(bankroll.toFixed(2)) });
    log.push({
      day,
      stake: parseFloat(bet.toFixed(2)),
      won,
      delta: parseFloat(delta.toFixed(2)),
      bankroll: parseFloat(bankroll.toFixed(2)),
    });
  }
  return { data, log, wins, losses, final: bankroll };
}

export const fmt = (n) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Compact percent — keeps huge ROI numbers readable (e.g. 6.1B%)
export const fmtPct = (n) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B%`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M%`;
  if (abs >= 1e4) return `${sign}${(abs / 1e3).toFixed(1)}k%`;
  return `${sign}${abs.toFixed(1)}%`;
};
