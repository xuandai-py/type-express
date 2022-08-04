import { Request } from "express";
import User from '../users/user.interface'

export default interface UserRequest extends Request {
    user: User
}