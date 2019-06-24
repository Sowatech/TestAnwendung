import { ClientSettingsDto, UpdateSmtpAccountParam,  SmtpAccountDto } from "./client-settings.dtos";


export class ClientSettingsModel {

    constructor(dto?: ClientSettingsDto) {
        this.smtpAccount = new SmtpAccountModel();

        if (dto) {
            this.fromDto(dto);
        }
    }
    smtpAccount: SmtpAccountModel;

    public fromDto(dto: ClientSettingsDto) {
        this.smtpAccount.fromDto(dto.smtpAccount);
    }
}

export class SmtpAccountModel {
    serverUrl: string;
    username: string;
    email: string;
    sslEnabled: boolean;

    public fromDto(dto: SmtpAccountDto) {
        this.serverUrl = dto.serverUrl;
        this.username = dto.username;
        this.email = dto.email;
        this.sslEnabled = dto.sslEnabled;
    }
}

