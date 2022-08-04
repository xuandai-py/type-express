import mongoose from "mongoose";
import User from "users/user.interface";

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        select: true
    },
})

const userModel = mongoose.model<User & mongoose.Document>('User', userSchema)
export default userModel