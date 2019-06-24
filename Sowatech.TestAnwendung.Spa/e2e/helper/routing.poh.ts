import { browser, by, ProtractorBrowser } from 'protractor';

//const NAV_ID_PREFIX = "nav_";
export class RoutingPageHelper {
    constructor(private passwords: {[username: string]: string}, private nonDefaultBrowser: ProtractorBrowser = null) {
        if (!passwords) {
            this.passwords = {
                SysAdmin: "Abcd1234!",
                TestClientAdmin: "Abcd1234!",
                TestUser: "Abcd1234!"
            };
        }
    }

    get browser(): ProtractorBrowser {
        return this.nonDefaultBrowser ? this.nonDefaultBrowser : browser;
    }

    public async loginAs(username: string) {
        let loginCommands = ["login", username, this.passwords[username]];
        let loginUrl = this.getUrl(loginCommands);
        await this.navigate(loginCommands);
        await this.waitUntilUrlChanged(loginUrl);
    }
	
    public async waitUntilUrlChanged(originalUrl: string, timeout: number = 5000) {
        return await this.browser.wait(this.urlChanged(originalUrl, Compare.IsUnequal), timeout);
    }

    public async waitUntilUrlReached(expectedUrl: string, timeout: number = 5000) {
        await this.browser.wait(this.urlChanged(expectedUrl, Compare.IsEqual), timeout);
    }

    private async urlChanged(url, comparer: Compare) {
        return await this.browser.getCurrentUrl().then(currentUrl => {
            switch (comparer) {
                case Compare.IsEqual:
                    return url == currentUrl;
                case Compare.IsUnequal:
                    return url != currentUrl;
            }
        });
    }

    public async navigate(commands: (string | number)[], timeout: number = 5000) {
        this.browser.sleep(2000); //=>fix fuer web socket is closed before connection is established todo: socket.disconnect
        let url = this.getUrl(commands);
        return this.browser.get(url, timeout);
    }

    public getUrl(commands: (string | number)[]) {
        let routeDelimiter = "#/";
        let baseUrl = this.browser.baseUrl.endsWith("/") ? this.browser.baseUrl : this.browser.baseUrl + "/";
        let url = baseUrl + routeDelimiter + commands.map(c => c.toString()).join("/");
        return url;
    }

    public createCommands(path: string, params?: (string | number)[]): (string | number)[] {
        let commands: (string | number)[] = [];
        commands.push(path);
        if (params) {
            for (var p of params) {
                commands.push(p);
            }
        }
        return commands;
    }
}

enum Compare {
    IsEqual,
    IsUnequal
}
