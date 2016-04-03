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

    // Top row: Automap/Live buttons set with 0x0b (Scene Launch buttons on the right are just row 8)
    pad.sendRaw( [ 0xb0, 111, 32 ] );
    // pad.sendRaw( [ 0x90, 104+4, 32 ] );
    // pad.sendRaw( [ 0x90, 104+8, 32 ] );

    if ( false ) {
        pad.col( 16, '4:xxx...xx' );
        pad.col( 3,
            'a:x..x' +
            's:..xx'
        );
    }

    // Reset pad
    pad.reset( 2 );

    pad.col( 16 + 12, [ [ 0, 0 ], [ 1, 0 ], [ 2, 0 ] ] );

    pad.col( 3, [ 0, 0 ] );
    pad.col( 3 + 4, [ 1, 0 ] ); // copy
    pad.col( 3 + 8, [ 2, 0 ] ); // clear

    pad.writeBuffer = 1;
    pad.col( 3, [ [ 4, 0 ], [ 5, 0 ] ] );
    pad.writeBuffer = 0;
    pad.col( 3, [ [ 6, 0 ], [ 7, 0 ] ] );

    // Esc button
    pad.col( Launchpad.RedFull, [ 0, 8 ] );
    pad.col( Launchpad.GreenLow, [ 1, 8 ] );
    pad.col( Launchpad.GreenLow, [ 2, 8 ] );
    pad.col( Launchpad.Off, [ 3, 8 ] );
    pad.col( Launchpad.GreenLow, [ 4, 8 ] );
    pad.col( Launchpad.GreenLow, [ 5, 8 ] );
    pad.col( Launchpad.GreenLow, [ 6, 8 ] );
    pad.col( Launchpad.Off, [ 7, 8 ] );
    pad.on( 'key', pair => {
        if ( pair.pressed ) {
            pad.col( Launchpad.RedFull, pair );
            pad.col( Launchpad.color( 1, 3, 'blink' ), pair );
        } else {
            pad.col( Launchpad.Off, pair );
        }
        if ( pair.pressed && pair.x === 8 ) {
            if ( pair.y === 0 ) {
                pad.sendRaw( [ 0xb0, 0x00, 0x20 ] );
            } else if ( pair.y === 1 ) {
                pad.sendRaw( [ 0xb0, 0x00, 0x21 ] );
            } else if ( pair.y === 4 ) {
                pad.sendRaw( [ 0xb0, 0x0, 0b110101 ] );
            }
        }
        if ( pair.pressed && pair.y === 8 ) {
            if ( pair.x === 0 ) {
                // Exit
                pad.reset( 1 );
                pad.disconnect();
            } else if ( pair.x === 1 ) {
                // Reset brightness
                pad.multiplexing();
            } else if ( pair.x === 2 ) {
                // Fade
                (new Array( 101 )).fill( 0 ).forEach( ( empty, ix ) => setTimeout( () => pad.brightness( ix / 100 ), ix * 20 ) );
            } else if ( pair.x === 4 ) {
                // Does not update correctly for 6 or more repetitions
                let btns = Launchpad.Buttons.Grid;
                for ( let i = 0; i < 8; i++ ) {
                    pad.col( Launchpad.RedLow, btns );
                    pad.col( Launchpad.RedFull, btns );
                    pad.col( Launchpad.AmberLow, btns );
                    pad.col( Launchpad.AmberFull, btns );
                    pad.col( Launchpad.GreenLow, btns );
                    pad.col( Launchpad.GreenFull, btns );
                }
            } else if ( pair.x === 5 ) {
                // Does not update correctly for 6 or more repetitions
                let btns = Launchpad.Buttons.Grid,
                    loop = ( n ) => {
                        pad.col( Launchpad.RedLow, btns )
                            .then( () => pad.col( Launchpad.RedFull, btns ) )
                            .then( () => pad.col( Launchpad.AmberLow, btns ) )
                            .then( () => pad.col( Launchpad.AmberMedium, btns ) )
                            .then( () => pad.col( Launchpad.GreenLow, btns ) )
                            .then( () => pad.col( Launchpad.GreenMedium, btns ) )
                            .then( () => n > 0 ? loop( n - 1 ) : null )
                            .catch( ( err ) => console.error( 'Oh no: ', err ) );
                    };

                loop( 32 );
            } else if ( pair.x === 6 ) {
                pad.sendRaw( [ 0xb0, 0x00, 0x28 ] );
            } else if ( pair.x === 7 ) {

            }
        }
    } );

}, err => console.error( 'Rejected: ', err ) );
