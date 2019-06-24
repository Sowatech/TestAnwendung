var SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
        allScriptsTimeout: 30000,
        multiCapabilities: [{
                // Das sind die Appium Einstellungen. Wir deployen die Anwendung vorher selbst auf dem Gerät und geben hier
                // den Namen des Packages und der MainActivity an. Appium kann die App auch automatisch auf dem Gerät
                // deployen, dann muss hier der Pfad zur APK angegeben werden.
                browserName: '',
                appPackage: 'de.sowatech.Sowatech.TestAnwendung',
                appActivity: '.MainActivity',
                platformName: 'Android',
                // platformVersion: '6.0.1',
                deviceName: 'Testdroid', // was hier steht ist egal, darf aber nicht leer sein
                autoAcceptAlerts: 'true',
                // Vorsicht bei der Rechtschreibung, ein groß geschriebenes 'V' verhinderte bei uns die Testausführung
                autoWebview: true,
                autoWebviewTimeout: 20000,
                newCommandTimeout: 300000
        }],
        framework: 'jasmine',
        jasmineNodeOpts: {
                defaultTimeoutInterval: 30000
        },
        SELENIUM_PROMISE_MANAGER: false,
        // Pfad zum Selenium Server von Appium
        seleniumAddress: 'http://localhost:4723/wd/hub',
        specs: ['./e2e/**/*.e2e-spec.ts'],
        onPrepare: function () {
                require('ts-node').register({
                        project: 'e2e/tsconfig.e2e.json'
                });
                jasmine.getEnv().addReporter(new SpecReporter());


                //-----------Shared browserLogs Configuration
                var browserLogs = require('protractor-browser-logs'),
                        logs = browserLogs(browser);

                if (global.logs) {
                        throw new Error('global.logs: name is already reserved!');
                }
                global.logs = logs;

                beforeEach(() => {
                        logs.reset();

                        //console.log("protractor.conf: globallogs.ignores");
                        // You can put here all expected generic expectations.
                        //logs.ignore('cast_sender.js');
                        //logs.ignore('favicon.ico');
                        logs.ignore('zone.js');
                        logs.ignore(/AuthGuard.canActivate/);
                        logs.ignore(function (message) {
                                var isInfo = (message.message.indexOf('!info: ') !== -1);
                                if (isInfo) console.log(message.message);//show all not ignored info messages in e2e console
                                return !isInfo;
                        }, logs.INFO);
                        logs.ignore(logs.DEBUG);
                        logs.ignore(/element is deprecated/);
                        logs.ignore(/Angular is running in the development mode/);
                });

                afterEach(() => {
                        return logs.verify();
                });
        }
}