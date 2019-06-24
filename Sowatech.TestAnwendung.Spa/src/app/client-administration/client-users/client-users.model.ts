import { UserDto } from './client-users.dtos';

export class UserModel {

    constructor(dto?: UserDto) {
        if (dto) {
            this.fromDto(dto);
        }
    }

    username: string;
    displayname: string;
    email: string;
    userGroupName: string;
    accessEnd: Date;
    accessStart: Date;

    public fromDto(dto: UserDto) {
        this.username = dto.userName;
        this.displayname = dto.displayName;
        this.email = dto.email;
        this.userGroupName = dto.userGroupName;
        this.accessEnd = dto.accessEnd;
        this.accessStart = dto.accessStart;
    }

}
