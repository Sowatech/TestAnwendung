// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

//for logging protractor-browser-logs realted config see
// https://www.npmjs.com/package/protractor-browser-logs

const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
	allScriptsTimeout: 11000,
	specs: [
		'./e2e/**/*.e2e-spec.ts'
	],
	capabilities: {
        'browserName': 'chrome',

        //By default browser allows recording only WARNING and SEVERE level messages.
        //In order to be able asserting any level, You need to change the loggingPrefs.browser capabilities.;
        loggingPrefs: {
            browser: 'ALL' // "OFF", "SEVERE", "WARNING", "INFO", "CONFIG", "FINE", "FINER", "FINEST", "ALL".
        }
	},
	directConnect: true,
	baseUrl: 'http://localhost:4200/',
	framework: 'jasmine',
	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 30000,
		print: function () { }
	},
	onPrepare() {
        var width = 1024;
        var height = 800;
        browser.driver.manage().window().setSize(width, height);
		require('ts-node').register({
			project: 'e2e/tsconfig.e2e.json'
		});
        jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: false } }));

        //-----------Shared browserLogs Configuration
        var browserLogs = require('protractor-browser-logs'),
            logs = browserLogs(browser);

        if (global.logs) {
            throw new Error('global.logs: name is already reserved!');
        }
        global.logs = logs;

        beforeEach(function () {
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

        afterEach(function () {
            return logs.verify();
        });
        //--------------------
	}
};
