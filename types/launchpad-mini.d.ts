export = Launchpad;

interface AvailablePorts 
{
    input: {
        portNumber: number;
        portName: string;
    }[];
    output: {
        portNumber: number;
        portName: string;
    }[];
}

interface SetBuffersArgs
{
    write: number;
    display: number;
    copyToDisplay: boolean;
    flash: boolean;
}

declare class Launchpad {
    midiIn: any;
    midiOut: any;
    /**
     * Storage format: [ {x0 y0}, {x1 y0}, ...{x9 y0}, {x0 y1}, {x1 y1}, ... ]
     * @type {Array.<{pressed:Boolean, x:Number, y:Number, cmd:Number, key:Number, id:Symbol}>}
     */
    _buttons: {
        pressed: boolean;
        x: number;
        y: number;
        cmd: number;
        key: number;
        id: Symbol;
    }[];
    /** @type {Number} */
    _writeBuffer: number;
    /** @type {Number} */
    _displayBuffer: number;
    /** @type {Boolean} */
    _flashing: boolean;
    /** @type {Color} */
    red: any;
    /** @type {Color} */
    green: any;
    /** @type {Color} */
    amber: any;
    /**
     * Due to limitations in LED levels, only full brightness is available for yellow,
     * the other modifier versions have no effect.
     * @type {Color}
     */
    yellow: any;
    /** @type {Color} */
    off: any;

    on(event: "connect" | "disconnect" | "key", callback: (data: any) => void): void;

    /**
     * @param {Number=} port MIDI port number to use. By default, the first MIDI port where a Launchpad is found
     * will be used. See availablePorts for a list of Launchpad ports (in case more than one is connected).
     * @param {Number} outPort MIDI output port to use, if defined, port is MIDI input port, otherwise port is both input and output port.
     */
    connect(port?: number, outPort?: number): Promise<string>;
    /**
     * Close the MIDI ports so the program can exit.
     */
    disconnect(): void;
    /**
     * Reset mapping mode, buffer settings, and duty cycle. Also turn all LEDs on or off.
     *
     * @param {Number=} brightness If given, all LEDs will be set to the brightness level (1 = low, 3 = high).
     * If undefined (or any other number), all LEDs will be turned off.
     */
    reset(brightness?: number | undefined): void;
    sendRaw(data: any): void;
    /**
     * Can be used if multiple Launchpads are connected.
     * @returns {{input: Array.<{portNumber:Number, portName:String}>, output: Array.<{portNumber:Number, portName:String}>}}
     * Available input and output ports with a connected Launchpad; no other MIDI devices are shown.
     */
    get availablePorts(): AvailablePorts
    /**
     * Get a list of buttons which are currently pressed.
     * @returns {Array.<Array.<Number>>} Array containing [x,y] pairs of pressed buttons
     */
    get pressedButtons(): number[][];
    /**
     * Check if a button is pressed.
     * @param {Array.<Number>} button [x,y] coordinates of the button to test
     * @returns {boolean}
     */
    isPressed(button: Array<number>): boolean;
    /**
     * Set the specified color for the given LED(s).
     * @param {Number|Color} color A color code, or one of the pre-defined colors.
     * @param {Array.<Number>|Array.<Array.<Number>>} buttons [x,y] value pair, or array of pairs
     * @return {Promise} Resolves as soon as the Launchpad has processed all data.
     */
    col(color: number | any, buttons: Array<number> | Array<Array<number>>): Promise<any>;
    /**
     * Set colors for multiple buttons.
     * @param {Array.<Array.<>>} buttonsWithColor Array containing entries of the form [x,y,color].
     * @returns {Promise}
     */
    setColors(buttonsWithColor: Array<any[]>): Promise<any>;
    setSingleButtonColor(xy: any, color: any): boolean;
    /**
     * Select the buffer to which LED colors are written. Default buffer of an unconfigured Launchpad is 0.
     * @param {Number} bufferNumber
     */
    set writeBuffer(arg: number);
    /**
     * @return {Number} Current buffer (0 or 1) that is written to
     */
    get writeBuffer(): number;
    /**
     * Select which buffer the Launchpad uses for the LED button colors. Default is 0.
     * Also disables flashing.
     * @param {Number} bufferNumber
     */
    set displayBuffer(arg: number);
    /**
     * @return {Number} Current buffer (0 or 1) that is displayed
     */
    get displayBuffer(): number;
    /**
     * Enable flashing. This essentially tells Launchpad to alternate the display buffer
     * at a pre-defined speed.
     * @param {Boolean} flash
     */
    set flash(arg: boolean);
    /**
     * @param {{write:Number=, display:Number=, copyToDisplay:Boolean=, flash:Boolean=}=} args
     */
    setBuffers(args?: SetBuffersArgs): void;
    /**
     * Set the low/medium button brightness. Low brightness buttons are about `num/den` times as bright
     * as full brightness buttons. Medium brightness buttons are twice as bright as low brightness.
     * @param {Number=} num Numerator, between 1 and 16, default=1
     * @param {Number=} den Denominator, between 3 and 18, default=5
     */
    multiplexing(num?: number, den?: number): void;
    /**
     * Set the button brightness for buttons with non-full brightness.
     * Lower brightness increases contrast since the full-brightness buttons will not change.
     *
     * @param {Number} brightness Brightness between 0 (dark) and 1 (bright)
     */
    brightness(brightness: number): void;
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
    fromMap(map: string): Array<Array<number>>;
    /**
     * Converts a string describing a row or column to button coordinates.
     * @param {String|Array.<String>} pattern String pattern, or array of string patterns.
     * String format is 'mod:pattern', with *mod* being one of rN (row N, e.g. r4), cN (column N), am (Automap), sc (Scene).
     * *pattern* are buttons from 0 to 8, where an 'x' or 'X' marks the button as selected,
     * and any other character is ignored; for example: 'x..xx' or 'X  XX'.
     */
    fromPattern(pattern: string | Array<string>): number[];
    /**
     * @returns {{pressed: Boolean, x: Number, y: Number, cmd:Number, key:Number, id:Symbol}} Button at given coordinates
     */
    _button(xy: any): {
        pressed: boolean;
        x: number;
        y: number;
        cmd: number;
        key: number;
        id: Symbol;
    };
    _processMessage(deltaTime: any, message: any): void;
}

import Buttons = require("./lib/button-list");
import colors = require("./lib/colors");

declare namespace Launchpad {
    export { Buttons };
    export { colors as Colors };
}