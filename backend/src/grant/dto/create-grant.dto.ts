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
    @IsString()
    @IsNotEmpty()
    organization!: string;
  
    @IsString()
    @IsNotEmpty()
    description!: string;
  
    // BCAN Points of Contact
    @IsArray()
    @IsNotEmpty({ each: true })
    bcan_poc!: string[];
  
    // Grant Provider Points of Contact
    @IsArray()
    @IsNotEmpty({ each: true })
    grant_provider_poc!: string[];
  
    @IsISO8601()
    @IsNotEmpty()
    application_date!: string;
  
    @IsISO8601()
    @IsNotEmpty()
    grant_start_date!: string;
  
    @IsISO8601()
    @IsNotEmpty()
    report_date!: string;
  
    @IsNumber()
    @IsNotEmpty()
    timeline_in_years!: number;
  
    @IsNumber()
    @IsNotEmpty()
    estimated_completion_time_in_hours!: number;
  
    @IsBoolean()
    @IsNotEmpty()
    does_bcan_qualify!: boolean;
  
    // New Status enum values: 0 (Potential), 1 (Active), 2 (Inactive)
    @IsNumber()
    @IsNotEmpty()
    status!: number;
  
    @IsNumber()
    @IsNotEmpty()
    amount!: number;
  
    // Array of attachment objects. Here we keep it generic.
    @IsArray()
    @IsDefined({ each: true })
    attached_resources!: any[];
  }