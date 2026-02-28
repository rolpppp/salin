const supabase = require("../config/supabase");
const webpush = require("web-push");

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:admin@salin.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// save push subscription for the current user
exports.subscribe = async (req, res, next) => {
  const userId = req.user.id;
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Invalid subscription object" });
  }

  try {
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint,
        p256dh: keys.p256dh,
        auth_key: keys.auth,
      },
      { onConflict: "user_id,endpoint" }
    );

    if (error) throw error;

    res.status(201).json({ message: "Subscribed to push notifications" });
  } catch (error) {
    next(error);
  }
};

// remove push subscription (called on logout or permission revoke)
exports.unsubscribe = async (req, res, next) => {
  const userId = req.user.id;
  const { endpoint } = req.body;

  try {
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("endpoint", endpoint);

    res.status(200).json({ message: "Unsubscribed" });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a budget alert push notification to a user.
 * Called internally by the dashboard/budget controller when threshold is crossed.
 *
 * @param {string} userId
 * @param {object} payload  { title, body }
 */
exports.sendBudgetAlert = async (userId, payload) => {
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", userId);

  if (!subscriptions || subscriptions.length === 0) return;

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/icons/salin.png",
    data: { url: "/#/dashboard" },
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        notification
      );
    } catch (err) {
      // Remove expired/invalid subscriptions
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      }
    }
  }
};
