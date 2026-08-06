import User from "../models/User.js";

//Get Profile
//GET /api/profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");

        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        
        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to fetch profile"});
    }
}

//Update Profile
//PUT /api/profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        if(user.isDeleted){
            return res.status(403).json({error: "Your account is deactivated. You cannot update your profile."});
        }

        await User.findByIdAndUpdate(user._id, {
            bio: req.body.bio
        });

        return res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile", error);
        return res.status(500).json({error: "Failed to update profile"});
    }
}