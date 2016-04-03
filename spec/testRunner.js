var jasmine = new (require( 'jasmine' ))();

jasmine.loadConfig( {
    spec_dir: '.',
    spec_files: [
        '**/*spec.js'
    ]
} );

jasmine.execute();