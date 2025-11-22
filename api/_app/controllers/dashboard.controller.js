const supabase = require("../config/supabase");

// get dashboard data
exports.getDashboardData = async (req, res, next) => {
  const userId = req.user.id;
  const now = new Date();
  const type = "expense";
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Start of current month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

  // End of current month (start of next month - 1 day)
  const endOfMonth = new Date(year, month, 0); // Last day of current month
  const endDate = endOfMonth.toISOString().split("T")[0];

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
        .select("title, amount, date, type")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),

      // getting the budget for current month
      supabase
        .from("budgets")
        .select("id, amount")
        .eq("user_id", userId)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle(),

      // total spent
      supabase
        .from("transactions")
        .select("total:amount.sum()")
        .eq("user_id", userId)
        .eq("type", type)
        .gte("date", startDate)
        .lte("date", endDate)
        .single(),
    ]);

    if (recentTransactionsData.error) throw recentTransactionsData.error;
    // budgetData.error can be PGRST116 (no rows) which is OK - we'll handle it below
    if (budgetData.error && budgetData.error.code !== "PGRST116")
      throw budgetData.error;
    if (totalSpentData.error) throw totalSpentData.error;

    // process the data
    const totalBalance = totalBalanceData.data.reduce(
      (sum, account) => sum + parseFloat(account.balance),
      0,
    );

    // total
    const totalSpent = totalSpentData.data?.total || 0;

    const dashboardData = {
      totalBalance: totalBalance,
      recentTransactions: recentTransactionsData.data,
      budget: {
        id: budgetData.data ? budgetData.data.id : null,
        amount: budgetData.data ? budgetData.data.amount : 0,
        spent: totalSpent,
      },
    };
    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
};
