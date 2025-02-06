import {
  IsNumber,
  IsString,
  IsBoolean,
  IsArray,
  IsISO8601,
  IsNotEmpty,
} from "class-validator";
import { IsPointOfContact } from "../customValidators";

// Tried just doing this without the ! definite statement but i got errors
// From my research definite statement just says this starts as undefined but the program will treat it as the type you said
export class CreateGrantDto {
  @IsString()
  @IsNotEmpty()
  organization_name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsBoolean()
  @IsNotEmpty()
  is_bcan_qualifying!: boolean;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsISO8601()
  @IsNotEmpty()
  deadline!: string;

  @IsBoolean()
  @IsNotEmpty()
  notifications_on_for_user!: boolean;

  @IsString()
  @IsNotEmpty()
  reporting_requirements!: string;

  @IsString()
  @IsNotEmpty()
  restrictions!: string;

  @IsArray()
  @IsPointOfContact({ each: true })
  point_of_contacts!: string[];

  @IsArray()
  @IsString({ each: true })
  attached_resources!: string[];

  @IsString()
  @IsNotEmpty()
  comments!: string;
}
