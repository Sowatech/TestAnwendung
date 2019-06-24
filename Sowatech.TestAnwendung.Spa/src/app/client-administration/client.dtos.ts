export class ClientListDto {
    public id: number;
    public created: Date;
    public createdBy: string;
    public edited: Date;
    public editedBy: string;

    public name: string;
    public accessEnd?: Date;
    public accessStart?: Date;
}

export class ClientDto {
    public id: number;
    public created: Date;
    public createdBy: string;
    public edited: Date;
    public editedBy: string;

    public name: string;
    public accessEnd?: Date;
    public accessStart?: Date;
}

export class InsertClientDto {
    public name: string;
    public accessEnd?: Date;
    public accessStart?: Date;

    public userName: string;
    public displayName: string;
    public email: string;
    public password: string;
}

export class InsertResult {
    public identityResult: IdentityResultDto;
    public clientId: number;
}

interface IdentityResultDto {
    Succeeded: boolean;
    Errors: Array<string>;
}

export class UpdateClientDto {
    public id: number;
    public name: string;
    public accessEnd?: Date;
    public accessStart?: Date;
}
