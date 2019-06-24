export class SessionDataDto {
    constructor() {
        this.userName = "";
        this.displayName = "";
        this.email = "";
        this.client_id = -1;
        this.roles = [];
    }

    public userName: string;
    public displayName: string;
    public email: string;
    public client_id: number;
    public roles: string[];
}