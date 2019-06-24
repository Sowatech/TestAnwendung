export class ClientSettingsDto {
    public smtpAccount: SmtpAccountDto;
}

export class SmtpAccountDto {
    public serverUrl: string;
    public username: string;
    public email: string;
    public sslEnabled: boolean;
}

export class UpdateSmtpAccountParam extends SmtpAccountDto {
    public password: string;
    public clientId: number;
}
