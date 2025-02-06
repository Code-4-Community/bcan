import {
  IsNumber,
  IsString,
  IsBoolean,
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsDefined,
} from "class-validator";
import { IsPointOfContact } from "../customValidators";

// Tried just doing this without the ! definite statement but i got errors
// From my research definite statement just says this starts as undefined but the program will treat it as the type you said
export class CreateGrantDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  organization_name!: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  description!: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsDefined()
  is_bcan_qualifying!: boolean;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  status!: boolean;

  @IsNumber()
  @IsNotEmpty()
  @IsDefined()
  amount!: number;

  @IsISO8601()
  @IsNotEmpty()
  @IsDefined()
  deadline!: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsDefined()
  notifications_on_for_user!: boolean;

  @IsString()
  @IsDefined()
  reporting_requirements!: string;

  @IsString()
  @IsDefined()
  restrictions!: string;

  @IsArray()
  @IsDefined()
  @IsDefined({each: true})
  @IsPointOfContact({ each: true })
  point_of_contacts!: string[];

  @IsArray()
  @IsString({ each: true })
  @IsDefined()
  @IsNotEmpty({each: true})
  attached_resources!: string[];

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  comments!: string;
}
