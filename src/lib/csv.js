// Minimal CSV (de)serialization for the bet journal.
// Columns: date, description, stake, odds, result

const COLUMNS = ["date", "description", "stake", "odds", "result"];

const escapeField = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function betsToCSV(bets) {
  const header = COLUMNS.join(",");
  const lines = bets.map((b) =>
    [b.date, b.desc, b.stake, b.odds, b.result].map(escapeField).join(",")
  );
  return [header, ...lines].join("\n");
}

// Parse a single CSV line, respecting quoted fields with embedded commas/quotes.
function parseLine(line) {
  const fields = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

export function csvToBets(text) {
  const rows = text.replace(/\r\n/g, "\n").trim().split("\n");
  if (rows.length === 0) return [];

  // Detect + skip a header row if present.
  const first = parseLine(rows[0]).map((f) => f.trim().toLowerCase());
  const hasHeader = first.includes("date") && first.includes("result");
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const validResults = new Set(["win", "loss", "push"]);
  return dataRows
    .filter((r) => r.trim() !== "")
    .map((r, i) => {
      const [date, desc, stake, odds, result] = parseLine(r);
      const res = (result ?? "").trim().toLowerCase();
      return {
        id: Date.now() + i,
        date: (date ?? "").trim(),
        desc: (desc ?? "").trim(),
        stake: (stake ?? "").trim(),
        odds: (odds ?? "").trim(),
        result: validResults.has(res) ? res : "loss",
      };
    })
    .filter((b) => b.stake !== "" && b.odds !== "");
}
