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
            'A:x..x' +
            'S:..xx' +
            '2r:x  x x' // row
        );

        Launchpad.Red( 'full', 'copy' );
        Launchpad.Green( 'medium', 'clear' );
        Launchpad.Amber( 'low' );
        Launchpad.Off();

        Launchpad.Red().full();
        Launchpad.Green().clear();
        Launchpad.Off().copy();

        pad.Red().full();
        pad.Green().clear();
        pad.Off().copy();

        pad.red.full;
        pad.green.clear;
        pad.off.copy;
    }

    // Reset pad
    pad.reset( 2 );

    pad.col( pad.green.copy, [ [ 0, 0 ], [ 1, 0 ], [ 2, 0 ] ] );
    pad.col( pad.red, [ 0, 0 ] );
    pad.col( pad.red.copy, [ 1, 0 ] ); // copy
    pad.col( pad.red.clear, [ 2, 0 ] ); // clear

    pad.writeBuffer = 1;
    pad.col( 3, [ [ 4, 0 ], [ 5, 0 ] ] );
    pad.writeBuffer = 0;
    pad.col( 3, [ [ 6, 0 ], [ 7, 0 ] ] );

    // Esc button
    pad.col( pad.red.full, [ 0, 8 ] );
    pad.col( pad.green.low, [ 1, 8 ] );
    pad.col( pad.green.low, [ 2, 8 ] );
    pad.col( pad.off, [ 3, 8 ] );
    pad.col( pad.green.low, [ 4, 8 ] );
    pad.col( pad.green.low, [ 5, 8 ] );
    pad.col( pad.off, [ 6, 8 ] );
    pad.col( pad.off, [ 7, 8 ] );
    pad.on( 'key', pair => {
        if ( pair.pressed ) {
            pad.col( pad.red.full, pair );
            pad.writeBuffer = 1;
            pad.col( pad.red.low, pair );
            pad.writeBuffer = 0;
        } else {
            pad.col( pad.off, pair );
        }
        if ( pair.pressed && pair.x === 8 ) {
            if ( pair.y === 0 ) {
                pad.displayBuffer = 0;
            } else if ( pair.y === 1 ) {
                pad.displayBuffer = 1;
            } else if ( pair.y === 2 ) {
                pad.flash = true;
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
                    pad.col( pad.red.low, btns );
                    pad.col( pad.red.full, btns );
                    pad.col( pad.amber.low, btns );
                    pad.col( pad.amber.full, btns );
                    pad.col( pad.green.low, btns );
                    pad.col( pad.green.full, btns );
                }
            } else if ( pair.x === 5 ) {
                // Does not update correctly for 6 or more repetitions
                let btns = Launchpad.Buttons.Grid,
                    loop = ( n ) => {
                        pad.col( pad.red.low, btns )
                            .then( () => pad.col( pad.red.full, btns ) )
                            .then( () => pad.col( pad.amber.low, btns ) )
                            .then( () => pad.col( pad.amber.medium, btns ) )
                            .then( () => pad.col( pad.green.low, btns ) )
                            .then( () => pad.col( pad.green.medium, btns ) )
                            .then( () => n > 0 ? loop( n - 1 ) : null )
                            .catch( ( err ) => console.error( 'Oh no: ', err ) );
                    };

                loop( 32 );
            }
        }
    } );

}, err => console.error( 'Rejected: ', err ) );
