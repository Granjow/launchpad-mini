const ConsoleReporter = require( 'jasmine-console-reporter' );

jasmine.getEnv().addReporter( new ConsoleReporter( {
    verbosity: 1
} ) );