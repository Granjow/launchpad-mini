'use strict';

const
    Launchpad = require( './launchpad-mini' );

let pad = new Launchpad();

console.log( pad.availablePorts );

pad.connect().then( ( msg ) => {
    console.log( msg );

    console.log( 'Sending message ...' );
    // MIDI device inquiry
    // pad.sendRaw( [ 0xf0, 0x7e, 0x7f, 0x06, 0x01, 0xf7 ] );

    // ON all LEDs
    pad.sendRaw( [ 0xb0, 0x00, 0x7f ] );
    // OFF all LEDs
    pad.sendRaw( [ 0xb0, 0x00, 0x00 ] );

    pad.sendRaw( [ 0x80, 0, 0 ] );
    pad.sendRaw( [ 0x90, 1, 3 ] );
    pad.sendRaw( [ 0x90, 2, 32 ] );
    pad.sendRaw( [ 0x90, 3, 35 ] );

    // Top row: Autmap/Live buttons set with 0x0b (Scene Launch buttons on the right are just row 8)
    pad.sendRaw( [ 0xb0, 111, 32 ] );
    // pad.sendRaw( [ 0x90, 104+4, 32 ] );
    // pad.sendRaw( [ 0x90, 104+8, 32 ] );

    setTimeout( () => pad.disconnect(), 100 );
}, err => console.error( 'Rejected: ', err ) );
