import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Post,
  ValidationPipe,
} from "@nestjs/common";
import { GrantService } from "./grant.service";
import { CreateGrantDto } from "./dto/grant.dto";

@Controller("grant")
export class GrantController {
  constructor(private readonly grantService: GrantService) {}

  @Get()
  async getAllGrants() {
    return await this.grantService.getAllGrants();
  }

  @Get(":id")
  async getGrantById(@Param("id") GrantId: string) {
    console.log("getting grant by id")
    return await this.grantService.getGrantById(parseInt(GrantId, 10));
  }

  @Put("archive")
  async archive(@Body("grantIds") grantIds: number[]): Promise<number[]> {
    return await this.grantService.unarchiveGrants(grantIds);
  }

  @Put("unarchive")
  async unarchive(@Body("grantIds") grantIds: number[]): Promise<number[]> {
    return await this.grantService.unarchiveGrants(grantIds);
  }

  @Post("new-grant")
  async addGrant(
    @Body(
      new ValidationPipe({
        whitelist: true, 
        forbidNonWhitelisted: true, 
      })
    )
    grant: CreateGrantDto
  ) {
    console.log(grant);
    return await this.grantService.addGrant(grant);
  }
}
