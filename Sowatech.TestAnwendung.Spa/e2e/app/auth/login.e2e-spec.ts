import { LoginPage } from './login.po';
import { ElementFinder } from 'protractor';

describe('Login', () => {
    let login: LoginPage;

    beforeEach(() => {
        login = new LoginPage();
    });

    it('should display username SysAdmin after login as SysAdmin', async () => {
        await login.routing.loginAs('SysAdmin');
        let userDisplay: ElementFinder = await login.getUserDisplay();
        let userDisplayName = await userDisplay.getText();
        await expect(userDisplayName).toEqual('SysAdmin');
    });

    it('should display username TestClientAdmin after login as TestClientAdmin', async () => {
        await login.routing.loginAs('TestClientAdmin');
        let userDisplay: ElementFinder = await login.getUserDisplay();
        let userDisplayName = await userDisplay.getText();
        await expect(userDisplayName).toEqual('TestClientAdmin');
    });

    it('should display username TestUser after login as TestUser', async () => {
        await login.routing.loginAs('TestUser');
        let userDisplay: ElementFinder = await login.getUserDisplay();
        let userDisplayName = await userDisplay.getText();
        await expect(userDisplayName).toEqual('TestUser');
    });
});
