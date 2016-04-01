'use strict';

const
    util = require( 'util' ),
    EventEmitter = require( 'events' ),
    midi = require( 'midi' );

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
    };

const Launchpad = function () {
    EventEmitter.call( this );

    this.midiIn = new midi.input();
    this.midiOut = new midi.output();

    this.midiIn.on( 'message', ( deltaTime, message ) => {
        console.log( 'm: ' + message + ' d: ' + deltaTime );
    } );

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
    },

    /**
     * Reset mapping mode, buffer settings, and duty cycle. Also turn all LEDs on or off.
     *
     * @param {Number=} brightness If given, all LEDs will be set to the brightness level (1 = low, 3 = high).
     * If undefined, all LEDs will be turned off.
     */
    reset: function ( brightness ) {
        brightness = brightness > 0 && brightness <= 3 ? brightness + 0x7c : 0;
        this.sendRaw( [ 0xb0, 0x00, brightness ] )
    },

    sendRaw: function ( data ) {
        this.midiOut.sendMessage( data );
    },

    /**
     * @returns {{input: Array.<{portNumber:Number, portName:String}>, output: Array.<{portNumber:Number, portName:String}>}}
     * Available input and output ports with a connected Launchpad
     */
    get
        availablePorts() {
        return {
            input: findLaunchpadPorts( this.midiIn ),
            output: findLaunchpadPorts( this.midiOut )
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

/**
 * List of default colors.
 */
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

module.exports = Launchpad;