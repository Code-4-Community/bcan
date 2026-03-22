import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum RevenueTypeValue {
	Grants = 'Grants',
	Donation = 'Individual Donations',
	Sponsorship = 'Corporate Sponsorships',
	Fundraising = 'Fundraising Events',
	Other = 'Other Revenue',
}

export class RevenueTypeResponseDto {
	@ApiProperty({ description: 'Unique ID for the revenue type', example: 1234567890 })
	revenueTypeId!: number;

	@ApiProperty({
		description: 'Revenue type category',
		enum: RevenueTypeValue,
		example: RevenueTypeValue.Grants,
	})
	name!: RevenueTypeValue;

	@ApiProperty({
		description: 'Additional details about this revenue type',
		required: false,
		example: 'Used for recurring and one-time funding streams.',
	})
	description?: string;

	@ApiProperty({ description: 'Whether the revenue type is active', example: true })
	isActive!: boolean;

	@ApiProperty({ description: 'ISO timestamp for when the revenue type was created', example: '2026-03-19T00:00:00.000Z' })
	createdAt!: string;

	@ApiProperty({ description: 'ISO timestamp for when the revenue type was last updated', example: '2026-03-19T00:00:00.000Z' })
	updatedAt!: string;
}

export class CreateRevenueTypeBody {
	@ApiProperty({
		description: 'Revenue type category',
		enum: RevenueTypeValue,
		example: RevenueTypeValue.Fundraising,
	})
	@IsEnum(RevenueTypeValue)
	name!: RevenueTypeValue;

	@ApiProperty({
		description: 'Optional context for this revenue type',
		required: false,
		example: 'Annual events and community campaigns.',
	})
	@IsOptional()
	@IsString()
	@MaxLength(300)
	description?: string;
}

export class UpdateRevenueTypeBody {
	@ApiProperty({
		description: 'Revenue type category',
		enum: RevenueTypeValue,
		required: false,
	})
	@IsOptional()
	@IsEnum(RevenueTypeValue)
	name?: RevenueTypeValue;

	@ApiProperty({ description: 'Optional context for this revenue type', required: false })
	@IsOptional()
	@IsString()
	@MaxLength(300)
	description?: string;

	@ApiProperty({ description: 'Whether the revenue type is active', required: false })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}