const supabase = require("../config/supabase");

// get dashboard data
exports.getDashboardData = async (req, res, next) => {
  const userId = req.user.id;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

  try {
    // getting total balance, 5 recent transactions, budget, total spent
    const [
      totalBalanceData,
      recentTransactionsData,
      budgetData,
      totalSpentData,
    ] = await Promise.all([
      // getting total balance from all accounts
      supabase.from("accounts").select("balance").eq("user_id", userId),

      // getting 5 most recent transactions
      supabase
        .from("transactions")
        .select("title, amount, type, date")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(5),

      // getting the budget for current month
      supabase
        .from("budgets")
        .select("amount")
        .eq("user_id", userId)
        .eq("month", month)
        .eq("year", year)
        .single(),

      // getting total spent for the current month
      supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "expenses")
        .gte("date", startDate)
        .lte("date", now.toISOString().split("T")[0]),
    ]);

    if (totalBalanceData.error) throw totalBalanceData.error;
    if (recentTransactionsData.error) throw recentTransactionsData.error;
    // budgetData.error can be PGRST116 (no rows) which is OK - we'll handle it below
    if (budgetData.error && budgetData.error.code !== "PGRST116")
      throw budgetData.error;
    if (totalSpentData.error) throw totalSpentData.error;

    // process the data
    const totalBalance = totalBalanceData.data.reduce(
      (sum, account) => sum + parseFloat(account.balance),
      0
    );
    const totalSpent = totalSpentData.data.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0
    );

    const dashboardData = {
      totalBalance: totalBalance,
      recentTransactions: recentTransactionsData.data,
      budget: {
        amount: budgetData.data ? budgetData.data.amount : 0,
        spent: totalSpent,
      },
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
};
