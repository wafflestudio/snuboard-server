import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAccessGuard } from '../auth/auth.guard';
import { UserRequest } from '../types/custom-type';
import { Department } from './department.entity';
import { FollowDto } from './dto/follow.dto';
import { DepartmentService } from './department.service';

@UseGuards(JwtAccessGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Get()
  getAllDepartments(@Req() req: UserRequest): Promise<Department[]> {
    return this.departmentService.getAllDepartments(req);
  }

  @Get('/:id')
  getDepartment(
    @Req() req: UserRequest,
    @Param('id') id: number,
  ): Promise<Department> {
    return this.departmentService.getDepartment(req, id);
  }

  @Post('/:id/follow')
  createFollow(
    @Req() req: UserRequest,
    @Param('id') id: number,
    @Body() followData: FollowDto,
  ): Promise<Department> {
    return this.departmentService.createFollow(req, id, followData);
  }

  @Delete('/:id/follow')
  deleteFollow(
    @Req() req: UserRequest,
    @Param('id') id: number,
    @Body() followData: FollowDto,
  ): Promise<Department> {
    return this.departmentService.deleteFollow(req, id, followData);
  }
}
