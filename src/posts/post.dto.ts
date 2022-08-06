import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
 
class CreatePostDto {
    // prevent create invalid document
  // @IsString()
  // @IsNotEmpty()
  // public author: string;
 
  @IsString()
    @IsOptional()
  public content: string;
 
  @IsString()
    @IsNotEmpty()
  public title: string;
}
 
export default CreatePostDto;