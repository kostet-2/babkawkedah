import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TokenManagementService } from '../token-management/token-management.service';
import { HttpService } from '@nestjs/axios';
import * as sharp from 'sharp';
import { lastValueFrom, map, catchError } from 'rxjs';
import { UtilsService } from '../utils/utils.service';

@Injectable()
export class ProcessImageGroupsService {
    constructor(
        private readonly tokenService: TokenManagementService,
        private readonly httpService: HttpService,
        private readonly utils: UtilsService,
    ) {}

    private readonly _URL: string = 'https://rapi.photomath.net/v1/process-image-groups';

    async process(image: Express.Multer.File) {
        const imageBuffer = image.buffer;
        const metadata = await sharp(imageBuffer).metadata();

        const json = {
            view: {
                x: 0,
                y: 0,
                width: metadata.width,
                height: metadata.height,
            },
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

        const form = new FormData();

        form.append('image', new Blob([imageBuffer], { type: 'image/jpeg' }));
        form.append('json', new Blob([JSON.stringify(json)], { type: 'application/json' }));

        const request$ = this.httpService
            .post(this._URL, form, {
                headers: {
                    Authorization: this.tokenService.token,
                },
            })
            .pipe(
                map((res) => res.data),
                map((data) => this.buildResponse(data)),
                catchError((e) => {
                    throw new HttpException('чайник', HttpStatus.INTERNAL_SERVER_ERROR);
                }),
            );
        return await lastValueFrom(request$);
    }

    buildResponse(data) {
        if (!data.preview) throw new HttpException('чайник', HttpStatus.INTERNAL_SERVER_ERROR);
        const res = {
            type: 'previews',
            previews: [],
            debug: data,
        };

        const groups = data.preview.groups.filter((group) => group.type === 'vertical');
        if (groups.length == 0) throw new HttpException('чайник', HttpStatus.INTERNAL_SERVER_ERROR);
        let i = 0;

        groups.forEach((group) => {
            group.entries.forEach((entry) => {
                res.previews.push({
                    command: entry.command,
                    title: this.utils.localize(entry.preview.title.localization),
                    method: this.utils.localize(entry.preview.method.localization),
                    description: this.utils.localize(entry.preview.content.description.localization),
                    problem: this.utils.parseLatex(entry.preview.content.problem),
                    solution: this.utils.parseLatex(entry.preview.content.solution),
                    id: `preview#${i++}`,
                });
            });
        });
        return res;
    }
}
