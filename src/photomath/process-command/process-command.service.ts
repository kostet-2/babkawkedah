import { Injectable } from '@nestjs/common';
import { TokenManagementService } from '../token-management/token-management.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { UtilsService } from '../utils/utils.service';

@Injectable()
export class ProcessCommandService {
    constructor(
        private readonly tokenService: TokenManagementService,
        private readonly httpService: HttpService,
        private readonly utils: UtilsService,
    ) {}

    private readonly _URL: string = 'https://rapi.photomath.net/v1/process-command';

    async process(command) {
        const body = {
            command,
            configuration: {
                features: {
                    allowMissingTranslations: false,
                    imageCollectionOptOut: false,
                    debug: false,
                    underaged: false,
                    problemDatabase: false,
                    bookpoint: false,
                    inlineAnimations: 'Variant1',
                },
                personalization: {
                    preferredMulType: 'vertical',
                    preferredDivType: 'horizontal',
                    locale: 'ru',
                },
            },
        };
        const request$ = this.httpService
            .post(this._URL, body, {
                headers: {
                    Authorization: this.tokenService.token,
                },
            })
            .pipe(
                map((res) => res.data),
                map((res) => this.buildResponse(res)),
            );
        return await lastValueFrom(request$);
    }
    buildResponse(res) {
        const result = {
            type: 'steps',
            solution: this.utils.parseLatex(res.result.solution),
            steps: [],
            debug: res,
        };

        res.result.steps.forEach((step) => {
            result.steps.push({
                header: this.utils.localize(step.headers[0].localization),
                step: this.utils.parseLatex(step.substeps[0].left),
            });
        });
        return result;
    }
}
