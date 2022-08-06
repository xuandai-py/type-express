import mongoose from "mongoose";
import User from "users/user.interface";

const addressSchema = new mongoose.Schema({
    city: String,
    country: String
})

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
    address: addressSchema,
    // posts: [
    //     {
    //         ref: 'Post',
    //         type: mongoose.Schema.Types.ObjectId
    //     }
    // ]
})

const userModel = mongoose.model<User & mongoose.Document>('User', userSchema)
export default userModel