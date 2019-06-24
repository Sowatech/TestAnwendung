export class TestUserAuth {

    static get usersAndPasswords(): {[username:string]:string} {
        return {
            SysAdmin: "Abcd1234!",
            TestClientAdmin: "Abcd1234!",
            TestUser: "Abcd1234!"
        }
    }

}
