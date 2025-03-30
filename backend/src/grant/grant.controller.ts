import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Patch,
  Query,
} from "@nestjs/common";
import { GrantService } from "./grant.service";
import { Grant } from "../../../middle-layer/types/Grant";

@Controller("grant")
export class GrantController {
  constructor(private readonly grantService: GrantService) {}

  @Get()
  async getAllGrants() {
    return await this.grantService.getAllGrants();
  }

  @Get(":id")
  async getGrantById(@Param("id") GrantId: string) {
    return await this.grantService.getGrantById(parseInt(GrantId, 10))
  }

  @Get("history:id") // Add :id to the path
  async getGrantHistory(@Param("id") grantId: string) {
    return await this.grantService.getGrantHistory(parseInt(grantId, 10));
  }

  @Put("archive")
  async archive(@Body("grantIds") grantIds: number[]): Promise<number[]> {
    return await this.grantService.unarchiveGrants(grantIds);
  }

  @Put("unarchive")
  async unarchive(@Body("grantIds") grantIds: number[]): Promise<number[]> {
    return await this.grantService.unarchiveGrants(grantIds);
  }

  @Put("save")
  async saveGrant(@Body() grantData: Grant) {
    return await this.grantService.updateGrant(grantData);
  }
}
