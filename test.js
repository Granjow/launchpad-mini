'use strict';

const
    Launchpad = require( './launchpad-mini' );

let pad = new Launchpad();

pad.on( 'disconnect', () => console.log( 'Launchpad disconnected.' ) );
pad.on( 'key', data => {
    console.log( data );
    console.log( 'Currently pressed: ', pad.pressedButtons );
} );

console.log( pad.availablePorts );

pad.connect().then( ( msg ) => {
    console.log( msg );

    // MIDI device inquiry
    // pad.sendRaw( [ 0xf0, 0x7e, 0x7f, 0x06, 0x01, 0xf7 ] );

    // ON all LEDs
    pad.sendRaw( [ 0xb0, 0x00, 0x7f ] );
    // OFF all LEDs
    pad.sendRaw( [ 0xb0, 0x00, 0x00 ] );

    pad.sendRaw( [ 0x90, 0, 11 ] );
    pad.sendRaw( [ 0x90, 1, 3 ] );
    pad.sendRaw( [ 0x90, 2, 32 ] );
    pad.sendRaw( [ 0x90, 3, 35 ] );

    pad.sendRaw( [ 0x90, 16, Launchpad.AmberLow ] );
    pad.sendRaw( [ 0x90, 17, Launchpad.AmberMedium ] );
    pad.sendRaw( [ 0x90, 18, Launchpad.AmberFull ] );
    pad.sendRaw( [ 0x90, 19, Launchpad.YellowFull ] );

    // Top row: Automap/Live buttons set with 0x0b (Scene Launch buttons on the right are just row 8)
    pad.sendRaw( [ 0xb0, 111, 32 ] );
    // pad.sendRaw( [ 0x90, 104+4, 32 ] );
    // pad.sendRaw( [ 0x90, 104+8, 32 ] );

    if ( false ) {
        pad.at( 4, 4 ).col( Launchpad.GreenFull );
        pad.ats( [ 5, 5 ], [ 6, 6 ], [ 7, 7 ] ).forEach( button => button.col( Launchpad.RedFull ) );

        // Want to easily select buttons
        pad.fromMap(
            '------xx-' +
            '-----xx--' +
            '----xx---' +
            '---xx----'
        ).forEach( button => button.col( Launchpad.AmberLow ) );

        // Want to use double buffering for setting many button colours at once
        // Want to efficiently update multiple buttons with rapid fire
        pad.col( Launchpad.YellowFull, [ [ 0, 4 ], [ 1, 5 ], [ 2, 6 ], [ 3, 7 ] ] );

        pad.col( Launchpad.GreenFull, pad.fromMap(
            'xxx--xxx '
        ) );

    }

    // Reset pad
    pad.reset( 3 );
    pad.col( Launchpad.GreenLow, [ 0, 0 ] );
    pad.col( Launchpad.GreenLow, [ [ 1, 1 ], [ 7, 6 ], [ 8, 7 ] ] );

    // Esc button
    pad.col( Launchpad.RedFull, [ 0, 8 ] );
    pad.on( 'key', pair => {
        if ( pair.x === 0 && pair.y === 8 && pair.pressed ) {
            pad.reset( 1 );
            pad.disconnect();
        }
    } );

    //setTimeout( () => pad.disconnect(), 10000 );
}, err => console.error( 'Rejected: ', err ) );
