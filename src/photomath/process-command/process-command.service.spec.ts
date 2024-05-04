import { Test, TestingModule } from '@nestjs/testing';
import { ProcessCommandService } from './process-command.service';

describe('ProcessCommandService', () => {
    let service: ProcessCommandService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProcessCommandService],
        }).compile();

        service = module.get<ProcessCommandService>(ProcessCommandService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
