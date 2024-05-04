import { Test, TestingModule } from '@nestjs/testing';
import { TokenManagementService } from './token-management.service';

describe('TokenManagementService', () => {
    let service: TokenManagementService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TokenManagementService],
        }).compile();

        service = module.get<TokenManagementService>(TokenManagementService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
