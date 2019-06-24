export class UserDto {
    public userName: string;
    public displayName: string;
    public email: string;
    public userGroupNames: string;
    public accessEnd: Date;
    public accessStart: Date;
}

export class AddUserParams {
    public userName: string;
    public displayName: string;
    public email: string;
    public password: string;
    public accessEnd: Date;
    public accessStart: Date;
    public userGroupIds: Array<number>;
}

export class AddUserDto extends AddUserParams {
    public userGroupSelectItems: Array<SelectItem>;
}

export class UpdateUserParams {
    public userName: string;
    public displayName: string;
    public email: string;
    public userGroupIds: Array<number>;
    public accessStart: Date;
    public accessEnd: Date;
}

export class UpdateUserDto extends UpdateUserParams {
    public userGroupSelectItems: Array<SelectItem>;
}

export class IdentityResultDto {
    Succeeded: boolean;
    Errors: Array<string>;
}

export class SetPasswordParams {
    public userName: string;
    public password: string;
}
