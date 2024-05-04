import { Module } from '@nestjs/common';
import { ProcessImageGroupsService } from './process-image-groups.service';
import { ProcessImageGroupsController } from './process-image-groups.controller';
import { HttpModule } from '@nestjs/axios';
import { TokenManagementModule } from '../token-management/token-management.module';
import { UtilsModule } from '../utils/utils.module';

@Module({
    imports: [HttpModule, TokenManagementModule, UtilsModule],
    providers: [ProcessImageGroupsService],
    controllers: [ProcessImageGroupsController],
})
export class ProcessImageGroupsModule {}
