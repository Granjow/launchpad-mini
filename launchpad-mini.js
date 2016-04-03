'use strict';

const
    util = require( 'util' ),
    EventEmitter = require( 'events' ),
    midi = require( 'midi' ),
    brightnessSteps = require( './launchpad-mini-brightness' );

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

const Launchpad = function () {
    EventEmitter.call( this );

    this.midiIn = new midi.input();
    this.midiOut = new midi.output();

    this.midiIn.on( 'message', ( dt, msg ) => this._processMessage( dt, msg ) );

    /** @type {Array.<{pressed:Boolean, x:Number, y:Number, cmd:Number, key:Number}>} */
    this._buttons = (new Array( 9 * 9 - 1 )).fill( 0 )
        .map( ( el, ix ) => ({
            pressed: false,
            y: (ix - ix % 9) / 9,
            x: ix % 9
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

    return this;
};
Launchpad.prototype = {

    /**
     * @param {Number=} port MIDI port number to use. By default, the first MIDI port where a Launchpad is found
     * will be used. See availablePorts for a list of Launchpad ports (in case more than one is connected).
     */
    connect: function ( port ) {
        return new Promise( ( res, rej ) => {

            if ( port !== undefined ) {
                // User has specified a port, use it
                try {
                    this.midiIn.openPort( port );
                    this.midiOut.openPort( port );
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
    },

    /**
     * Close the MIDI ports so the program can exit.
     */
    disconnect: function () {
        this.midiIn.closePort();
        this.midiOut.closePort();
        this.emit( 'disconnect' );
    },

    /**
     * Reset mapping mode, buffer settings, and duty cycle. Also turn all LEDs on or off.
     *
     * @param {Number=} brightness If given, all LEDs will be set to the brightness level (1 = low, 3 = high).
     * If undefined (or any other number), all LEDs will be turned off.
     */
    reset: function ( brightness ) {
        brightness = brightness > 0 && brightness <= 3 ? brightness + 0x7c : 0;
        this.sendRaw( [ 0xb0, 0x00, brightness ] )
    },

    sendRaw: function ( data ) {
        this.midiOut.sendMessage( data );
    },

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
    },

    /**
     * Get a list of buttons which are currently pressed.
     * @returns {Array.<Array.<Number>>} Array containing [x,y] pairs of pressed buttons
     */
    get pressedButtons() {
        return this._buttons.filter( b => b.pressed )
            .map( b => [ b.x, b.y ] );
    },

    /**
     * Check if a button is pressed.
     * @param {Number} x
     * @param {Number} y
     * @returns {boolean}
     * @todo Use array instead
     */
    isPressed: function ( x, y ) {
        return this._buttons.some( b => b.pressed && b.x === x && b.y === y );
    },

    /**
     * Set the specified color for the given LED(s).
     * @param {Number} color
     * @param {Array.<Number>|Array.<Array.<Number>>} buttons [x,y] value pair, or array of pairs
     * @return {Promise} Resolves as soon as the Launchpad has processed all data.
     */
    col: function ( color, buttons ) {
        // Code would look much better with the Rest operator ...

        if ( buttons.length > 0 && buttons[ 0 ] instanceof Array ) {
            buttons.forEach( btn => this.col( color, btn ) );
            return new Promise( ( res, rej ) => setTimeout( res, buttons.length / 20 ) );

        } else {
            var b = this._button( buttons[ 0 ], buttons[ 1 ] );
            if ( b ) {
                this.sendRaw( [ b.cmd, b.key, color ] );
            }
            return new Promise( ( res, rej ) => res() );
        }
    },

    /**
     * @return {Number} Current buffer (0 or 1) that is written to
     */
    get writeBuffer() {
        return this._writeBuffer;
    },

    /**
     * @return {Number} Current buffer (0 or 1) that is displayed
     */
    get displayBuffer() {
        return this._displayBuffer;
    },

    /**
     * Select the buffer to which LED colors are written. Default buffer of an unconfigured Launchpad is 0.
     * @param {Number} bufferNumber
     */
    set writeBuffer( bufferNumber ) {
        this.setBuffers( { write: bufferNumber } );
    },

    /**
     * Select which buffer the Launchpad uses for the LED button colors. Default is 0.
     * @param {Number} bufferNumber
     */
    set displayBuffer( bufferNumber ) {
        this.setBuffers( { display: bufferNumber } );
    },

    /**
     * Enable flashing. This essentially tells Launchpad to alternate the display buffer
     * at a pre-defined speed.
     * @param {Boolean} flash
     */
    set flash( flash ) {
        this.setBuffers( { flash: flash } );
    },

    /**
     * @param {{write:Number=, display:Number=, copyToDisplay:Boolean=, flash:Boolean=}=} args
     */
    setBuffers: function ( args ) {
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
    },

    /**
     * Set the low/medium button brightness. Low brightness buttons are about `num/den` times as bright
     * as full brightness buttons. Medium brightness buttons are twice as bright as low brightness.
     * @param {Number=} num Numerator, between 1 and 16, default=1
     * @param {Number=} den Denominator, between 3 and 18, default=5
     */
    multiplexing: function ( num, den ) {
        var data,
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
    },

    /**
     * Set the button brightness for buttons with non-full brightness.
     * Lower brightness increases contrast since the full-brightness buttons will not change.
     *
     * @param {Number} brightness Brightness between 0 (dark) and 1 (bright)
     */
    brightness: function ( brightness ) {
        this.multiplexing.apply( this, brightnessSteps.getNumDen( brightness ) );
    },

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
    fromMap: function ( map ) {
        return Array.prototype.map.call( map, ( char, ix ) => ({
                x: ix % 9,
                y: (ix - (ix % 9)) / 9,
                c: char
            }) )
            .filter( data => data.c === 'x' )
            .map( data => [ data.x, data.y ] );
    },

    /**
     * @returns {{pressed: Boolean, x: Number, y: Number, cmd:Number, key:Number}} Button at given coordinates
     */
    _button: function ( x, y ) {
        return this._buttons[ 9 * y + x ];
    },

    _processMessage: function ( deltaTime, message ) {

        if ( message[ 0 ] === 0x90 ) {

            // Grid pressed
            let x = message[ 1 ] % 0x10,
                y = (message[ 1 ] - x) / 0x10,
                pressed = message[ 2 ] > 0;

            console.log( message[ 1 ], x, y );

            this._button( x, y ).pressed = pressed;
            this.emit( 'key', {
                x: x, y: y, pressed: pressed,
                // Pretend to be an array so the returned object
                // can be fed back to .col()
                0: x, 1: y, length: 2
            } );

        } else if ( message[ 0 ] === 0xb0 ) {

            // Automap/Live button
            let x = message[ 1 ] - 0x68,
                y = 8,
                pressed = message[ 2 ] > 0;

            this._button( x, y ).pressed = pressed;
            this.emit( 'key', { x: x, y: y, pressed: pressed } );

        } else {
            console.log( `Unknown message: ${message} at ${deltaTime}` );
        }
    }

};
util.inherits( Launchpad, EventEmitter );


/**
 * Generates a color by setting red and green LED power individually.
 * @param {Number} r Red brightness, 0 (off) to 3 (max)
 * @param {Number} g Green brightness, 0 (off) to 3 (max)
 * @param {String=} mode Can be 'flash' for flashing LED or 'double' for double-buffering. Leave undefined for default mode.
 * @return {Number}
 */
Launchpad.color = ( r, g, mode ) => 16 * g + r + 12 * (!mode) + 8 * (mode === 'flash');

// List of default colors.

Launchpad.Off = Launchpad.color( 0, 0 );
Launchpad.RedLow = Launchpad.color( 1, 0 );
Launchpad.RedMedium = Launchpad.color( 2, 0 );
Launchpad.RedFull = Launchpad.color( 3, 0 );
Launchpad.GreenLow = Launchpad.color( 0, 1 );
Launchpad.GreenMedium = Launchpad.color( 0, 2 );
Launchpad.GreenFull = Launchpad.color( 0, 3 );
Launchpad.AmberLow = Launchpad.color( 1, 1 );
Launchpad.AmberMedium = Launchpad.color( 2, 2 );
Launchpad.AmberFull = Launchpad.color( 3, 3 );
Launchpad.YellowFull = Launchpad.color( 1, 3 );

// Button Groups

Launchpad.Buttons = {
    All: (new Array( 80 )).fill( 0 ).map( ( empty, ix ) => [ ix % 9, (ix - ix % 9) / 9 ] ),
    Grid: (new Array( 64 )).fill( 0 ).map( ( empty, ix ) => [ ix % 8, (ix - ix % 8) / 8 ] )
};

module.exports = Launchpad;