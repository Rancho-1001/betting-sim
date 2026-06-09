# 🎲 Bankroll Compounder

A browser-based unit-betting simulator that models compound bankroll growth over 365 days. Adjust your starting bankroll, unit count, decimal odds, and win rate with live sliders **or typed number inputs**, and watch the chart update instantly. Toggle multi-scenario overlays to visualise variance, and flip between dark and light themes — all settings persist across reloads.

It also includes two trackers: a **Simulation Log** that breaks the modelled year down day-by-day, and a **Bet Journal** for recording your own real-world bets and checking your true hit rate over time.

## Features

- **Live controls** — every parameter has both a slider and an editable number field that stay in sync
- **Compound growth chart** — 365-day bankroll curve with an optional 5-scenario variance overlay
- **Dark / light themes** — toggle in the top-right, persisted to `localStorage`
- **Simulation Log** — full day-by-day table (stake, win/loss, P/L, running bankroll) plus actual win %, longest win/loss streaks, peak bankroll, and max drawdown
- **Bet Journal** — log your own bets (date, description, stake, odds, result) and track real bankroll, win %, profit/ROI, streaks, and drawdown; persisted to `localStorage`

## Screenshots

> _(Add screenshots here)_

## Parameter Reference

| Parameter | Description |
|---|---|
| **Starting Bankroll** | Initial capital in USD ($500–$20,000) |
| **Units** | Number of units to divide the bankroll into. Smaller = larger bets per unit |
| **Decimal Odds** | Payout multiplier in decimal format (e.g. 3.0 = win 2× your stake) |
| **Win Rate** | % of bets won per day. Break-even = 1 ÷ decimal odds |

## Trackers

### Simulation Log

Expands the simulated year into a scrollable, day-by-day table — each row shows the day, stake, win/loss, profit/loss, and running bankroll. Summary chips report the **actual** win rate, longest winning and losing streaks, peak bankroll, max drawdown, and net profit / ROI. Everything is derived from the same simulation that drives the chart, so the numbers always agree.

### Bet Journal ("My Bets")

A persistent journal for your own real bets, so you can check your percentages against reality rather than the model:

1. Set your starting bankroll.
2. Add a bet — date, optional description, stake, decimal odds, and result (Win / Loss / Push).
3. The journal computes a running bankroll after every bet, plus your real win %, net profit, ROI, total staked, longest win streak, and max drawdown.

Bets are stored in `localStorage` (`bcsim-journal`, `bcsim-journal-start`) and survive reloads. Rows can be deleted individually, or cleared all at once.

## Run Locally

```bash
git clone https://github.com/your-username/betting-sim.git
cd betting-sim
npm install
npm run dev
# Open http://localhost:5173
```

## Deploy

### Vercel (recommended)

Vercel auto-detects Vite. Just import the repo at [vercel.com/new](https://vercel.com/new) — no configuration needed. The `vercel.json` handles SPA routing.

### GitHub Pages (via Actions)

1. Go to **Settings → Pages** in your repo and set the source to **GitHub Actions**.
2. Push to `main`. The `deploy.yml` workflow builds and publishes `dist/` automatically.
3. Your site will be live at `https://your-username.github.io/betting-sim/`.

## CI Status

![CI](https://github.com/your-username/betting-sim/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/your-username/betting-sim/actions/workflows/deploy.yml/badge.svg)
