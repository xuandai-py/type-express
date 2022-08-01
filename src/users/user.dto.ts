import { IsOptional, IsString } from "class-validator";

export default class CreateUserDto {
    @IsString()
    @IsOptional()
    public name: string

    @IsString()
    public email: string
    
    @IsString()
    public password: string
}