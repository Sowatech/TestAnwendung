import { UserSettingsDto, UserSettingsUpdateParam } from "./user-settings.dtos";

export class UserSettingsModel extends UserSettingsDto {

    constructor(dto?: UserSettingsDto) {
        super();
        if (dto) this.fromDto(dto);
    }


    wert: string;

    public fromDto(dto: UserSettingsDto) {
        this.wert = dto.wert;
    }
}

export class UserSettingsEditModel extends UserSettingsDto {

    constructor(dto?: UserSettingsDto) {
        super();
        if (dto) this.fromDto(dto);
    }
    wert: string;

    public fromDto(dto: UserSettingsDto) {
        this.wert = dto.wert;
    }

    public toDto(): UserSettingsUpdateParam {
        var result = new UserSettingsUpdateParam();
        result.wert = this.wert;
        return result;
    }
}
