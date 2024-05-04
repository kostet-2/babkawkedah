import { Module } from '@nestjs/common';
import { TokenManagementModule } from './token-management/token-management.module';
import { ProcessImageGroupsModule } from './process-image-groups/process-image-groups.module';
import { ProcessCommandModule } from './process-command/process-command.module';

@Module({
    imports: [TokenManagementModule, ProcessImageGroupsModule, ProcessCommandModule],
})
export class PhotomathModule {}
