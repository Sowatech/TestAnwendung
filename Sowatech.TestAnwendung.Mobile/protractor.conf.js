var SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
    allScriptsTimeout: 11000,
    baseUrl: 'http://localhost:8100',
    capabilities: {
        'browserName': 'chrome',

        //By default browser allows recording only WARNING and SEVERE level messages.
        //In order to be able asserting any level, You need to change the loggingPrefs.browser capabilities.; 
        loggingPrefs: {
            browser: 'ALL' // "OFF", "SEVERE", "WARNING", "INFO", "CONFIG", "FINE", "FINER", "FINEST", "ALL".
        }
    },
    // 'true' für direkte Verbindung mit Chrome oder Firefox (statt über einen Selenium Server)
    directConnect: true,
    framework: 'jasmine',
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        print: function () { }
    },
    // diese Einstellung muss 'false' sein, wenn mit async/await Syntax gearbeitet werden soll
    SELENIUM_PROMISE_MANAGER: false,
    // welche Spezifikationen sollen ausgeführt werden (hier alle im Ordner e2e)
    specs: ['./e2e/**/*.e2e-spec.ts'],
    onPrepare: function () {
        // Compiler-Optionen die ts-node verwenden soll
        require('ts-node').register({
            project: 'e2e/tsconfig.e2e.json'
        });
        // führt aktuell im Ordner www gebaute App aus
        require('connect')().use(require('serve-static')('www')).listen(8100);

        // Auswahl des Spec-Reporters
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