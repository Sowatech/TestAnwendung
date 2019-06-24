import { UserGroupDto } from './user-group.dtos';

export class UserGroupModel extends UserGroupDto {
    constructor(dto: UserGroupDto) {
        super();
        for (var prop in dto) {
            this[prop] = dto[prop];
        }
    }
}