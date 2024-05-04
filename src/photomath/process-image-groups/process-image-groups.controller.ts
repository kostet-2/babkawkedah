import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProcessImageGroupsService } from './process-image-groups.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('process-image-groups')
export class ProcessImageGroupsController {
    constructor(private readonly service: ProcessImageGroupsService) {}

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    process(@UploadedFile() file: Express.Multer.File) {
        return this.service.process(file);
    }
}
