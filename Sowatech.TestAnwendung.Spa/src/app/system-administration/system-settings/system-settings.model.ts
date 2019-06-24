import { SystemSettingsDto, SmtpAccountDto } from "./system-settings.dtos";

export class SystemSettingsModel extends SystemSettingsDto {
    constructor(dto: SystemSettingsDto) {
        super();
        return { ...dto }
    }
}

