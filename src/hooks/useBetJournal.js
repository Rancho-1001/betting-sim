import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

// Map between the DB row shape and the shape the UI components expect.
const fromRow = (r) => ({
  id: r.id,
  date: r.bet_date,
  desc: r.description ?? "",
  stake: String(r.stake),
  odds: String(r.odds),
  result: r.result,
});

const toRow = (b, userId) => ({
  user_id: userId,
  bet_date: b.date,
  description: b.desc ?? "",
  stake: Number(b.stake),
  odds: Number(b.odds),
  result: b.result,
});

export function useBetJournal() {
  const { user } = useAuth();
  const [bets, setBets] = useState([]);
  const [start, setStartState] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initial load whenever the logged-in user changes.
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      const [betsRes, settingsRes] = await Promise.all([
        supabase.from("bets").select("*").order("created_at", { ascending: true }),
        supabase.from("settings").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (!active) return;
      if (betsRes.error) setError(betsRes.error.message);
      setBets((betsRes.data ?? []).map(fromRow));
      if (settingsRes.data) setStartState(Number(settingsRes.data.start_bankroll));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const addBet = useCallback(
    async (bet) => {
      const { data, error } = await supabase
        .from("bets")
        .insert(toRow(bet, user.id))
        .select()
        .single();
      if (error) {
        setError(error.message);
        return;
      }
      setBets((prev) => [...prev, fromRow(data)]);
    },
    [user]
  );

  const removeBet = useCallback(async (id) => {
    const { error } = await supabase.from("bets").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setBets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    const { error } = await supabase.from("bets").delete().eq("user_id", user.id);
    if (error) {
      setError(error.message);
      return;
    }
    setBets([]);
  }, [user]);

  // Replace the whole journal (used by CSV import).
  const importBets = useCallback(
    async (incoming) => {
      await supabase.from("bets").delete().eq("user_id", user.id);
      const rows = incoming.map((b) => toRow(b, user.id));
      const { data, error } = await supabase.from("bets").insert(rows).select();
      if (error) {
        setError(error.message);
        return;
      }
      setBets((data ?? []).map(fromRow));
    },
    [user]
  );

  const setStart = useCallback(
    async (val) => {
      setStartState(val);
      await supabase.from("settings").upsert({
        user_id: user.id,
        start_bankroll: val,
        updated_at: new Date().toISOString(),
      });
    },
    [user]
  );

  return { bets, start, loading, error, addBet, removeBet, clearAll, importBets, setStart };
}
