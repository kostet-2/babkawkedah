import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, map } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TokenManagementService implements OnModuleInit {
    constructor(private readonly httpService: HttpService) {}

    private readonly _providerId: string = 'CA2F547A-7A17-4506-87BE-78134AF6494B';

    private readonly _URL = 'https://lapi.photomath.net/v5/me';

    private _refreshToken: string;

    private _token: string;

    get token(): string {
        return this._token;
    }

    onModuleInit() {
        this.handleToken();
    }

    @Cron(CronExpression.EVERY_WEEK)
    handleToken(): void {
        let request$: Observable<any>;

        if (this._refreshToken) {
            request$ = this.httpService.get(this._URL, {
                headers: {
                    authorization: this._refreshToken,
                },
            });
        } else {
            request$ = this.httpService.put(this._URL, {
                providerId: this._providerId,
            });
        }

        request$
            .pipe(
                map((res) => ({
                    token: 'Bearer ' + res.data.content.token,
                    refreshToken: 'Bearer ' + res.data.content.refreshToken,
                })),
            )
            .subscribe((res) => {
                this._token = res.token;
                this._refreshToken = res.refreshToken;
            });
    }
}
