'use strict';

class Color {

    constructor( level, clear, copy, name ) {
        this._level = level;
        this._clear = clear;
        this._copy = copy;
        this._name = name;
        return this;
    }

    /**
     * Turn off LEDs.
     * @return {Color}
     */
    get off() {
        return this.level( 0 );
    }

    /**
     * Low brightness
     * @return {Color}
     */
    get low() {
        return this.level( 1 );
    }

    /**
     * Medium brightness
     * @return {Color}
     */
    get medium() {
        return this.level( 2 );
    }

    /**
     * Full brightness
     * @return {Color}
     */
    get full() {
        return this.level( 3 );
    }

    /**
     * Set a numeric brightness level for this color.
     * @param {Number} n Level between 0 and 3
     * @return {Color}
     */
    level( n ) {
        return new Color( Math.min( 3, Math.max( 0, Math.round( n ) ) ), this._clear, this._copy, this._name );
    }

    /**
     * For the other buffer, turn the LED off.
     *
     * If neither clear nor copy are set, the other buffer will not be modified.
     * @return {Color}
     */
    get clear() {
        return new Color( this._level, true, this._copy, this._name );
    }

    /**
     * For the other buffer, use the same color.
     * This overrides the `clear` bit.
     *
     * If neither clear nor copy are set, the other buffer will not be modified.
     * @return {Color}
     */
    get copy() {
        return new Color( this._level, this._clear, true, this._name );
    }

    /**
     * @return {Number} MIDI code of this color
     */
    get code() {
        let r = this._level * (this._name === 'red' || this._name === 'amber'),
            g = this._level * (this._name === 'green' || this._name === 'amber');
        if ( this._name === 'yellow' && this._level > 0 ) {
            r = 2;
            g = 3;
        }
        return (
            0b10000 * g +
            0b01000 * this._clear +
            0b00100 * this._copy +
            0b00001 * r
        );
    }
}

/** @type {Color} */
const red = new Color( 3, false, false, 'red' );
/** @type {Color} */
const green = new Color( 3, false, false, 'green' );
/** @type {Color} */
const amber = new Color( 3, false, false, 'amber' );
/** @type {Color} */
const yellow = new Color( 3, false, false, 'yellow' );
/** @type {Color} */
const off = new Color( 3, false, false, 'off' );

module.exports = {
    Color,
    red,
    green,
    amber,
    yellow,
    off
};