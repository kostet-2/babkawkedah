import { Module } from '@nestjs/common';
import { ProcessCommandService } from './process-command.service';
import { ProcessCommandController } from './process-command.controller';
import { HttpModule } from '@nestjs/axios';
import { TokenManagementModule } from '../token-management/token-management.module';
import { UtilsModule } from '../utils/utils.module';

@Module({
    imports: [HttpModule, TokenManagementModule, UtilsModule],
    providers: [ProcessCommandService],
    controllers: [ProcessCommandController],
})
export class ProcessCommandModule {}
