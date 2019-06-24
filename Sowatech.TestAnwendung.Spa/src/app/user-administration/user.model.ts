import { UserDto } from "./user.dtos";

export class UserModel extends UserDto {
    constructor(dto?: UserDto) {
        super();
        if (dto) {
            return { ...dto }
        }
    }
}
