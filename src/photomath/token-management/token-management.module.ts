import { Module } from '@nestjs/common';
import { TokenManagementService } from './token-management.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    providers: [TokenManagementService],
    exports: [TokenManagementService],
})
export class TokenManagementModule {}
