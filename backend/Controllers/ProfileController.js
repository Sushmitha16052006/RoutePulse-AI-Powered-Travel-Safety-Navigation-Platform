import User from "../Models/UserModel.js";
import bcrypt from "bcryptjs";

const DEFAULT_PHOTO = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const AddProfilePhoto = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "UserId not received" });
    try {
        // Cloudinary disabled for local dev - using placeholder photo
        const photo = DEFAULT_PHOTO;
        const user = await User.findByIdAndUpdate(userId, { profilePhoto: photo }, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "Profile photo updated successfully", updatedUser: user });
    } catch (error) {
        console.error("Error in AddProfilePhoto:", error);
        return res.status(500).json({ message: "An error occurred while updating the profile photo" });
    }
};

const UpdateUsername = async (req, res) => {
    try {
        const { userId, username } = req.body;
        if (!userId || !username) return res.status(400).json({ success: false, message: "Please provide userId and username" });
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ success: false, message: "Username already taken" });
        }
        const updatedUser = await User.findByIdAndUpdate(userId, { username }, { new: true }).select('-password');
        if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, message: "Username updated successfully", user: updatedUser });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const UpdateEmail = async (req, res) => {
    try {
        const { userId, email, isGoogleUser } = req.body;
        if (!userId || !email) return res.status(400).json({ success: false, message: "Please provide userId and email" });
        if (isGoogleUser) return res.status(400).json({ success: false, message: "Cannot update the email of a Google account" });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already in use" });
        user.email = email;
        await user.save();
        res.status(200).json({ success: true, message: "Email updated successfully", user: user.toObject({ virtuals: true }) });
    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const UpdatePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        if (!userId || !currentPassword || !newPassword) return res.status(400).json({ success: false, message: "Please provide all required fields" });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });
        if (currentPassword === newPassword) return res.status(400).json({ success: false, message: "New password cannot be same as current" });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.status(200).json({ success: true, message: "Password updated successfully", user: user.toObject({ virtuals: true }) });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { AddProfilePhoto, UpdateUsername, UpdateEmail, UpdatePassword };
