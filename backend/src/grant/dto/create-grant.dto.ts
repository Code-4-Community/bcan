import {
    IsNumber,
    IsString,
    IsBoolean,
    IsArray,
    IsISO8601,
    IsNotEmpty,
    IsDefined,
  } from "class-validator";
  
  /**
   * DTO for creating a new grant.
   */
  export class CreateGrantDto {
    @IsNumber()
    @IsNotEmpty()
    grantId?: number;

    @IsString()
    @IsNotEmpty()
    organization!: string;
  
    @IsString()
    @IsNotEmpty()
    description!: string;
  
    // BCAN Points of Contact
    @IsArray()
    @IsNotEmpty({ each: true })
    grantmaker_poc!: string[];
  
    @IsISO8601()
    @IsNotEmpty()
    application_deadline!: string;
  
    /*
    @IsISO8601()
    @IsNotEmpty()
    grant_start_date!: string;
    */
  
    @IsISO8601()
    @IsNotEmpty()
    report_deadline!: string;

    @IsISO8601()
    @IsNotEmpty()
    notification_date!: string;
  
    @IsNumber()
    @IsNotEmpty()
    timeline!: number;
  
    @IsNumber()
    @IsNotEmpty()
    estimated_completion_time!: number;
  
    @IsBoolean()
    @IsNotEmpty()
    does_bcan_qualify!: boolean;
  
    @IsString()
    @IsNotEmpty()
    status!: string;
  
    @IsNumber()
    @IsNotEmpty()
    amount!: number;
  
    // Array of attachment objects. Here we keep it generic.
    @IsArray()
    @IsDefined({ each: true })
    attachments!: any[];
  }