// api/_app/controllers/user.controller.js
const supabase = require("../config/supabase");

// get user data
exports.getUser = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

        if (error) throw error;

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// update user metadata
exports.updateUser = async (req, res, next) => {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "username is required." });
    }

    try {
        const { data, error } = await supabase.auth.admin.updateUserById(
            userId,
            { user_metadata: { name: username } }
        );

        if (error) throw error;

        res.status(200).json({ message: "user updated successfully", data });
    } catch (error) {
        next(error);
    }
};