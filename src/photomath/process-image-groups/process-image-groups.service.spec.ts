import { Test, TestingModule } from '@nestjs/testing';
import { ProcessImageGroupsService } from './process-image-groups.service';

describe('ProcessImageGroupsService', () => {
    let service: ProcessImageGroupsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProcessImageGroupsService],
        }).compile();

        service = module.get<ProcessImageGroupsService>(ProcessImageGroupsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
