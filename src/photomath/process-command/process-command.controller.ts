import { Body, Controller, Post } from '@nestjs/common';
import { ProcessCommandService } from './process-command.service';

@Controller('process-command')
export class ProcessCommandController {
    constructor(private readonly service: ProcessCommandService) {}

    @Post()
    process(@Body() command) {
        return this.service.process(command);
    }
}
