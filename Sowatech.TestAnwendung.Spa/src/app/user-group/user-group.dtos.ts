export class UserGroupDto {
    public id: number;
    public name: string;
    public comment: string;
    public rolesCommaList: string;
}

export class EditUserGroupDtoBase {
    public name: string;
    public comment: string;
    public userRoles: string[];
}

export class InsertUserGroupDto extends EditUserGroupDtoBase {
    public client_Id: number;
}

export class UpdateUserGroupDto extends EditUserGroupDtoBase {
    public id: number;
}
