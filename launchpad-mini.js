'use strict';

const
    util = require( 'util' ),
    EventEmitter = require( 'events' ),
    midi = require( 'midi' ),
    brightnessSteps = require( './lib/brightness' ),
    Buttons = require( './lib/button-list' ),
    buttons = require( './lib/buttons' ),
    colors = require( './lib/colors' );

const
    /**
     * @param port MIDI port object
     * @returns {Array.<{portNumber:Number, portName:String}>}>}
     */
    findLaunchpadPorts = function ( port ) {
        return (new Array( port.getPortCount() )).fill( 0 )
            .map( ( nil, portNumber ) => ({ portNumber: portNumber, portName: port.getPortName( portNumber ) }) )
            .filter( desc => desc.portName.indexOf( 'Launchpad' ) >= 0 );
    },
    connectFirstPort = function ( port ) {
        return findLaunchpadPorts( port ).some( desc => {
            port.openPort( desc.portNumber );
            return true;
        } );
    },
    or = function ( test, alternative ) {
        return test === undefined ? !!alternative : !!test;
    };

class Launchpad extends EventEmitter {

    constructor() {

        super();

        this.midiIn = new midi.input();
        this.midiOut = new midi.output();

        this.midiIn.on( 'message', ( dt, msg ) => this._processMessage( dt, msg ) );

        /**
         * Storage format: [ {x0 y0}, {x1 y0}, ...{x9 y0}, {x0 y1}, {x1 y1}, ... ]
         * @type {Array.<{pressed:Boolean, x:Number, y:Number, cmd:Number, key:Number, id:Symbol}>}
         */
        this._buttons = Buttons.All
            .map( b => ({
                x: b[ 0 ],
                y: b[ 1 ],
                id: b.id
            }) )
            .map( b => {
                b.cmd = b.y >= 8 ? 0xb0 : 0x90;
                b.key = b.y >= 8 ? 0x68 + b.x : 0x10 * b.y + b.x;
                return b;
            } );

        /** @type {Number} */
        this._writeBuffer = 0;

        /** @type {Number} */
        this._displayBuffer = 0;

        /** @type {Boolean} */
        this._flashing = false;


        /** @type {Color} */
        this.red = colors.red;
        /** @type {Color} */
        this.green = colors.green;
        /** @type {Color} */
        this.amber = colors.amber;
        /**
         * Due to limitations in LED levels, only full brightness is available for yellow,
         * the other modifier versions have no effect.
         * @type {Color}
         */
        this.yellow = colors.yellow;
        /** @type {Color} */
        this.off = colors.off;

        return this;
    }


    /**
     * @param {Number=} port MIDI port number to use. By default, the first MIDI port where a Launchpad is found
     * will be used. See availablePorts for a list of Launchpad ports (in case more than one is connected).
     * @param {Number} outPort MIDI output port to use, if defined, port is MIDI input port, otherwise port is both input and output port.
     */
    connect( port, outPort ) {
        return new Promise( ( res, rej ) => {

            if ( port !== undefined ) {
                if( outPort === undefined){
                  // User has not specified outPort, use port also as output MIDI port.
                  outPort = port;
                }
                // User has specified a port, use it
                try {
                    this.midiIn.openPort( port );
                    this.midiOut.openPort( outPort );
                    this.emit( 'connect' );
                    res( 'Launchpad connected' );
                } catch ( e ) {
                    rej( `Cannot connect on port ${port}: ` + e );
                }

            } else {

                // Search for Launchpad and use its port
                let iOk = connectFirstPort( this.midiIn ),
                    oOk = connectFirstPort( this.midiOut );

                if ( iOk && oOk ) {
                    this.emit( 'connect' );
                    res( 'Launchpad connected.' );
                } else {
                    rej( `No Launchpad on MIDI ports found.` );
                }
            }
        } );
    }

    /**
     * Close the MIDI ports so the program can exit.
     */
    disconnect() {
        this.midiIn.closePort();
        this.midiOut.closePort();
        this.emit( 'disconnect' );
    }

    /**
     * Reset mapping mode, buffer settings, and duty cycle. Also turn all LEDs on or off.
     *
     * @param {Number=} brightness If given, all LEDs will be set to the brightness level (1 = low, 3 = high).
     * If undefined (or any other number), all LEDs will be turned off.
     */
    reset( brightness ) {
        brightness = brightness > 0 && brightness <= 3 ? brightness + 0x7c : 0;
        this.sendRaw( [ 0xb0, 0x00, brightness ] )
    }

    sendRaw( data ) {
        this.midiOut.sendMessage( data );
    }

    /**
     * Can be used if multiple Launchpads are connected.
     * @returns {{input: Array.<{portNumber:Number, portName:String}>, output: Array.<{portNumber:Number, portName:String}>}}
     * Available input and output ports with a connected Launchpad; no other MIDI devices are shown.
     */
    get availablePorts() {
        return {
            input: findLaunchpadPorts( this.midiIn ),
            output: findLaunchpadPorts( this.midiOut )
        }
    }

    /**
     * Get a list of buttons which are currently pressed.
     * @returns {Array.<Array.<Number>>} Array containing [x,y] pairs of pressed buttons
     */
    get pressedButtons() {
        return this._buttons.filter( b => b.pressed )
            .map( b => Buttons.byXy( b.x, b.y ) );
    }

    /**
     * Check if a button is pressed.
     * @param {Array.<Number>} button [x,y] coordinates of the button to test
     * @returns {boolean}
     */
    isPressed( button ) {
        return this._buttons.some( b => b.pressed && b.x === button[ 0 ] && b.y === button[ 1 ] );
    }

    /**
     * Set the specified color for the given LED(s).
     * @param {Number|Color} color A color code, or one of the pre-defined colors.
     * @param {Array.<Number>|Array.<Array.<Number>>} buttons [x,y] value pair, or array of pairs
     * @return {Promise} Resolves as soon as the Launchpad has processed all data.
     */
    col( color, buttons ) {
        // Code would look much better with the Rest operator ...

        if ( buttons.length > 0 && buttons[ 0 ] instanceof Array ) {
            buttons.forEach( btn => this.col( color, btn ) );
            return new Promise( ( res, rej ) => setTimeout( res, buttons.length / 20 ) );

        } else {
            let b = this._button( buttons );
            if ( b ) {
                this.sendRaw( [ b.cmd, b.key, color.code || color ] );
            }
            return Promise.resolve( !!b );
        }
    }

    /**
     * Set colors for multiple buttons.
     * @param {Array.<Array.<>>} buttonsWithColor Array containing entries of the form [x,y,color].
     * @returns {Promise}
     */
    setColors( buttonsWithColor ) {
        buttonsWithColor.forEach( btn => this.setSingleButtonColor( btn, btn[ 2 ] ) );
        return new Promise( ( res ) => setTimeout( res, buttonsWithColor.length / 20 ) );
    }

    setSingleButtonColor( xy, color ) {
        let b = this._button( xy );
        if ( b ) {
            this.sendRaw( [ b.cmd, b.key, color.code || color ] );
        }
        return !!b;
    }

    /**
     * @return {Number} Current buffer (0 or 1) that is written to
     */
    get writeBuffer() {
        return this._writeBuffer;
    }

    /**
     * @return {Number} Current buffer (0 or 1) that is displayed
     */
    get displayBuffer() {
        return this._displayBuffer;
    }

    /**
     * Select the buffer to which LED colors are written. Default buffer of an unconfigured Launchpad is 0.
     * @param {Number} bufferNumber
     */
    set writeBuffer( bufferNumber ) {
        this.setBuffers( { write: bufferNumber } );
    }

    /**
     * Select which buffer the Launchpad uses for the LED button colors. Default is 0.
     * Also disables flashing.
     * @param {Number} bufferNumber
     */
    set displayBuffer( bufferNumber ) {
        this.setBuffers( { display: bufferNumber, flash: false } );
    }

    /**
     * Enable flashing. This essentially tells Launchpad to alternate the display buffer
     * at a pre-defined speed.
     * @param {Boolean} flash
     */
    set flash( flash ) {
        this.setBuffers( { flash: flash } );
    }

    /**
     * @param {{write:Number=, display:Number=, copyToDisplay:Boolean=, flash:Boolean=}=} args
     */
    setBuffers( args ) {
        args = args || {};
        this._flashing = or( args.flash, this._flashing );
        this._writeBuffer = 1 * or( args.write, this._writeBuffer );
        this._displayBuffer = 1 * or( args.display, this._displayBuffer );

        let cmd =
            0b100000 +
            0b010000 * or( args.copyToDisplay, 0 ) +
            0b001000 * this._flashing +
            0b000100 * this.writeBuffer +
            0b000001 * this.displayBuffer;

        this.sendRaw( [ 0xb0, 0x00, cmd ] );
    }

    /**
     * Set the low/medium button brightness. Low brightness buttons are about `num/den` times as bright
     * as full brightness buttons. Medium brightness buttons are twice as bright as low brightness.
     * @param {Number=} num Numerator, between 1 and 16, default=1
     * @param {Number=} den Denominator, between 3 and 18, default=5
     */
    multiplexing( num, den ) {
        let data,
            cmd;
        num = Math.max( 1, Math.min( num || 1, 16 ) );
        den = Math.max( 3, Math.min( den || 5, 18 ) );
        if ( num < 9 ) {
            cmd = 0x1e;
            data = 0x10 * (num - 1) + (den - 3);
        } else {
            cmd = 0x1f;
            data = 0x10 * (num - 9) + (den - 3);
        }
        this.sendRaw( [ 0xb0, cmd, data ] );
    }

    /**
     * Set the button brightness for buttons with non-full brightness.
     * Lower brightness increases contrast since the full-brightness buttons will not change.
     *
     * @param {Number} brightness Brightness between 0 (dark) and 1 (bright)
     */
    brightness( brightness ) {
        this.multiplexing.apply( this, brightnessSteps.getNumDen( brightness ) );
    }

    /**
     * Generate an array of coordinate pairs from a string “painting”. The input string is 9×9 characters big
     * and starts with the first button row (including the scene buttons on the right). The last row is for the
     * Automap buttons which are in reality on top on the Launchpad.
     *
     * Any character which is a lowercase 'x' will be returned in the coordinate array.
     *
     * The generated array can be used for setting button colours, for example.
     *
     * @param {String} map
     * @returns {Array.<Array.<Number>>} Array containing [x,y] coordinate pairs.
     */
    fromMap( map ) {
        return Array.prototype.map.call( map, ( char, ix ) => ({
            x: ix % 9,
            y: (ix - (ix % 9)) / 9,
            c: char
        }) )
            .filter( data => data.c === 'x' )
            .map( data => Buttons.byXy( data.x, data.y ) );
    }

    /**
     * Converts a string describing a row or column to button coordinates.
     * @param {String|Array.<String>} pattern String pattern, or array of string patterns.
     * String format is 'mod:pattern', with *mod* being one of rN (row N, e.g. r4), cN (column N), am (Automap), sc (Scene).
     * *pattern* are buttons from 0 to 8, where an 'x' or 'X' marks the button as selected,
     * and any other character is ignored; for example: 'x..xx' or 'X  XX'.
     */
    fromPattern( pattern ) {
        if ( pattern instanceof Array ) {
            return buttons.decodeStrings( pattern );
        }
        return buttons.decodeString( pattern )
            .map( xy => Buttons.byXy( xy[ 0 ], xy[ 1 ] ) );
    }

    /**
     * @returns {{pressed: Boolean, x: Number, y: Number, cmd:Number, key:Number, id:Symbol}} Button at given coordinates
     */
    _button( xy ) {
        return this._buttons[ 9 * xy[ 1 ] + xy[ 0 ] ];
    }

    _processMessage( deltaTime, message ) {

        let x, y, pressed;

        if ( message[ 0 ] === 0x90 ) {

            // Grid pressed
            x = message[ 1 ] % 0x10;
            y = (message[ 1 ] - x) / 0x10;
            pressed = message[ 2 ] > 0;

        } else if ( message[ 0 ] === 0xb0 ) {

            // Automap/Live button
            x = message[ 1 ] - 0x68;
            y = 8;
            pressed = message[ 2 ] > 0;

        } else {
            console.log( `Unknown message: ${message} at ${deltaTime}` );
            return;
        }


        let button = this._button( [ x, y ] );
        button.pressed = pressed;
        this.emit( 'key', {
            x: x, y: y, pressed: pressed, id: button.id,
            // Pretend to be an array so the returned object
            // can be fed back to .col()
            0: x, 1: y, length: 2
        } );
    }

}

util.inherits( Launchpad, EventEmitter );

// Button Groups

Launchpad.Buttons = Buttons;

Launchpad.Colors = colors;

module.exports = Launchpad;
