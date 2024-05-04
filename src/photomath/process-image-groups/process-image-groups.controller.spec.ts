import { Test, TestingModule } from '@nestjs/testing';
import { ProcessImageGroupsController } from './process-image-groups.controller';

describe('ProcessImageGroupsController', () => {
    let controller: ProcessImageGroupsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProcessImageGroupsController],
        }).compile();

        controller = module.get<ProcessImageGroupsController>(ProcessImageGroupsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
