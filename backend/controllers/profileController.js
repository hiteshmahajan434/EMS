import User from "../models/User.js";

//Get Profile
//GET /api/profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

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
            return res.status(403).json({error: "Your account is deactivated. You cannot change your profile."});
        }

        const {firstName, lastName, phone, profilePicture, bio} = req.body;

        if(firstName) user.firstName = firstName;
        if(lastName) user.lastName = lastName;
        if(phone) user.phone = phone;
        if(profilePicture) user.profilePicture = profilePicture;
        if(bio) user.bio = bio;

        await user.save();

        return res.json({success: true});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to update profile"});
    }
}