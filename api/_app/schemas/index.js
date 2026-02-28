const { z } = require("zod");

// ---- Auth ----
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ---- Transaction ----
const createTransactionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  account_id: z.string().uuid("Invalid account ID"),
  category_id: z.string().uuid("Invalid category ID"),
  description: z.string().max(500, "Description too long").optional().nullable(),
  is_recurring: z.boolean().optional(),
  recurrence_interval: z.enum(["daily", "weekly", "monthly"]).optional().nullable(),
  idempotency_key: z.string().uuid("Invalid idempotency key").optional(),
  split_with: z.string().max(100).optional().nullable(),
  split_amount: z.number().positive().optional().nullable(),
});

const updateTransactionSchema = createTransactionSchema.partial();

// ---- Account ----
const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  type: z.enum(["cash", "bank", "e-wallet", "credit_card"]),
  balance: z.number().optional(),
});

const updateAccountSchema = createAccountSchema.partial();

// ---- Category ----
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  type: z.enum(["income", "expense"]),
  keywords: z.array(z.string()).optional(),
});

const updateCategorySchema = createCategorySchema.partial();

// ---- Budget ----
const createBudgetSchema = z.object({
  amount: z.number().positive("Budget amount must be positive"),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  category_id: z.string().uuid("Invalid category ID").optional().nullable(),
  period_type: z.enum(["monthly", "semester"]).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

const updateBudgetSchema = createBudgetSchema.partial();

// ---- User ----
const updateUserSchema = z.object({
  username: z.string().min(1).max(50).optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
  createTransactionSchema,
  updateTransactionSchema,
  createAccountSchema,
  updateAccountSchema,
  createCategorySchema,
  updateCategorySchema,
  createBudgetSchema,
  updateBudgetSchema,
  updateUserSchema,
};
