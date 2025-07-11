import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Report } from './entities/report.entity';
import { Roles } from '../../common/decorator/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { ReportStatus } from './enums/report-status.enum';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Récupérer tous les signalements' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste de tous les signalements.',
    type: [Report],
  })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un signalement par son ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Le signalement a été trouvé.',
    type: Report,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Signalement non trouvé.',
  })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Get('source/:sourceId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Récupérer les sources d’un signalement' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sources du signalement récupérées avec succès.',
  })
  findReportSource(@Param('sourceId') sourceId: string) {
    return this.reportsService.getReportSource(sourceId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Créer un nouveau signalement de source' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Le signalement a été créé avec succès.',
    type: Report,
  })
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Patch()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Mettre à jour le status d'un signalement" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Les signalements ont été mis à jour avec succès.',
    type: Report,
  })
  updateBatchStatus(
    @Query('status') status: ReportStatus,
    @Query('report_ids') report_ids: string,
  ) {
    if (!status || !report_ids) {
      throw new BadRequestException('Status and report_ids are required');
    }

    const reportIdsArray = report_ids.split(',');
    return this.reportsService.updateBatchStatus(reportIdsArray, status);
  }
}
