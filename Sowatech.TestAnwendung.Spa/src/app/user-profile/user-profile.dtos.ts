export class ChangePasswordParameters {
    public currentPassword: string;
    public newPassword: string;
}

export class ResetPasswordParameters {
    username: string;
    resetToken: string;
    newPassword: string;
}

export interface IdentityResultDto {
    Succeeded: boolean;
    Errors: Array<string>;
}

export class UpdateUserProfileDto {
    displayName: string;
    email: string;
}