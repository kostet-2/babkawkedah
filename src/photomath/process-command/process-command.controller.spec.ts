import { Test, TestingModule } from '@nestjs/testing';
import { ProcessCommandController } from './process-command.controller';

describe('ProcessCommandController', () => {
    let controller: ProcessCommandController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProcessCommandController],
        }).compile();

        controller = module.get<ProcessCommandController>(ProcessCommandController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
