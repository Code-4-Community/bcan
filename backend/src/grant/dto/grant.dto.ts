import {
  IsNumber,
  IsString,
  IsBoolean,
  IsArray,
  IsISO8601,
} from "class-validator";
import { IsPointOfContact } from "../customValidators";

// Tried just doing this without the ! definite statement but i got errors
// From my research definite statement just says this starts as undefined but the program will treat it as the type you said
export class CreateGrantDto {
  @IsString()
  organization_name!: string;

  @IsString()
  description!: string;

  @IsBoolean()
  is_bcan_qualifying!: boolean;

  @IsString()
  status!: string;

  @IsNumber()
  amount!: number;

  @IsISO8601()
  deadline!: string;

  @IsBoolean()
  notifications_on_for_user!: boolean;

  @IsString()
  reporting_requirements!: string;

  @IsString()
  restrictions!: string;

  @IsArray()
  @IsPointOfContact({ each: true })
  point_of_contacts!: string[];

  @IsArray()
  @IsString({ each: true })
  attached_resources!: string[];

  @IsArray()
  @IsString({ each: true })
  comments!: string;
}
