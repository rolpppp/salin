/**
 * process-recurring Edge Function
 * Runs on a schedule (e.g., every day at midnight) to auto-create
 * recurring transaction instances that are due.
 *
 * Deploy to Supabase:
 *   supabase functions deploy process-recurring
 *
 * Schedule via Supabase Dashboard > Edge Functions > Schedules:
 *   Cron: 0 0 * * *  (daily at midnight UTC)
 *
 * Required env vars (set in Supabase Dashboard > Settings > Edge Functions):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

function computeNextDate(dateStr: string, interval: string): string {
  const d = new Date(dateStr);
  if (interval === "daily") d.setDate(d.getDate() + 1);
  else if (interval === "weekly") d.setDate(d.getDate() + 7);
  else if (interval === "monthly") d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date().toISOString().split("T")[0];

  // Find all recurring transactions due today or earlier
  const { data: due, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("is_recurring", true)
    .lte("next_recurrence_date", today)
    .not("next_recurrence_date", "is", null);

  if (fetchError) {
    return new Response(
      JSON.stringify({ error: fetchError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const results = [];

  for (const txn of due ?? []) {
    const newDate = txn.next_recurrence_date;
    const nextDate = computeNextDate(newDate, txn.recurrence_interval);

    // Insert new transaction instance (child of the recurring template)
    const { data: newTxn, error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: txn.user_id,
        title: txn.title,
        amount: txn.amount,
        type: txn.type,
        date: newDate,
        description: txn.description,
        account_id: txn.account_id,
        category_id: txn.category_id,
        is_recurring: false, // child instances are one-time
        parent_recurring_id: txn.id,
      })
      .select()
      .single();

    if (insertError) {
      results.push({ id: txn.id, status: "error", error: insertError.message });
      continue;
    }

    // Advance the parent's next_recurrence_date
    await supabase
      .from("transactions")
      .update({ next_recurrence_date: nextDate })
      .eq("id", txn.id);

    results.push({ id: txn.id, status: "created", new_transaction_id: newTxn.id });
  }

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { headers: { "Content-Type": "application/json" } }
  );
});
