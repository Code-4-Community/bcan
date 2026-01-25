import { Grant } from '../../../../middle-layer/types/Grant';
import { ApiProperty } from '@nestjs/swagger';

export class InactivateGrantBody {
  @ApiProperty({ 
    description: 'Array of grant IDs to inactivate',
    type: [Number],
    example: [1234567890, 1234567891]
  })
  grantIds!: number[];
}

export class AddGrantBody {
  @ApiProperty({ description: 'Organization giving the grant', example: 'Example Foundation' })
  organization!: string;
  
  @ApiProperty({ description: 'Whether BCAN qualifies for this grant', example: true })
  does_bcan_qualify!: boolean;
  
  @ApiProperty({ description: 'Current status of the grant', example: 'Active' })
  status!: string;
  
  @ApiProperty({ description: 'Amount of money given by the grant', example: 50000 })
  amount!: number;
  
  @ApiProperty({ description: 'When the grant money will start being issued', example: '2024-01-01T00:00:00.000Z' })
  grant_start_date!: string;
  
  @ApiProperty({ description: 'When grant submission is due', example: '2024-06-01T00:00:00.000Z' })
  application_deadline!: string;
  
  @ApiProperty({ description: 'Multiple report dates', type: [String], required: false, example: ['2024-12-01T00:00:00.000Z'] })
  report_deadlines?: string[];
  
  @ApiProperty({ description: 'Additional information about the grant', required: false, example: 'Grant for research purposes' })
  description?: string;
  
  @ApiProperty({ description: 'How long the grant will last in years', example: 1 })
  timeline!: number;
  
  @ApiProperty({ description: 'Estimated time to complete the grant application in hours', example: 40 })
  estimated_completion_time!: number;
  
  @ApiProperty({ description: 'Person of contact at organization giving the grant', required: false })
  grantmaker_poc?: any;
  
  @ApiProperty({ description: 'Person of contact at BCAN' })
  bcan_poc!: any;
  
  @ApiProperty({ description: 'Attachments related to the grant', type: [Object] })
  attachments!: any[];
  
  @ApiProperty({ description: 'Whether the grant is restricted (specific purpose) or unrestricted', example: false })
  isRestricted!: boolean;
}

export class UpdateGrantBody {
  @ApiProperty({ description: 'Unique ID for the grant', example: 1234567890 })
  grantId!: number;
  
  @ApiProperty({ description: 'Organization giving the grant', example: 'Example Foundation', required: false })
  organization?: string;
  
  @ApiProperty({ description: 'Whether BCAN qualifies for this grant', required: false })
  does_bcan_qualify?: boolean;
  
  @ApiProperty({ description: 'Current status of the grant', required: false })
  status?: string;
  
  @ApiProperty({ description: 'Amount of money given by the grant', required: false })
  amount?: number;
  
  @ApiProperty({ description: 'When the grant money will start being issued', required: false })
  grant_start_date?: string;
  
  @ApiProperty({ description: 'When grant submission is due', required: false })
  application_deadline?: string;
  
  @ApiProperty({ description: 'Multiple report dates', type: [String], required: false })
  report_deadlines?: string[];
  
  @ApiProperty({ description: 'Additional information about the grant', required: false })
  description?: string;
  
  @ApiProperty({ description: 'How long the grant will last in years', required: false })
  timeline?: number;
  
  @ApiProperty({ description: 'Estimated time to complete the grant application in hours', required: false })
  estimated_completion_time?: number;
  
  @ApiProperty({ description: 'Person of contact at organization giving the grant', required: false })
  grantmaker_poc?: any;
  
  @ApiProperty({ description: 'Person of contact at BCAN', required: false })
  bcan_poc?: any;
  
  @ApiProperty({ description: 'Attachments related to the grant', type: [Object], required: false })
  attachments?: any[];
  
  @ApiProperty({ description: 'Whether the grant is restricted or unrestricted', required: false })
  isRestricted?: boolean;
}
