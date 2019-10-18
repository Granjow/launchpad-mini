export class Color {

    constructor( level : number, clear : boolean, copy : boolean, name : string ) {
        this._level = level;
        this._clear = clear;
        this._copy = copy;
        this._name = name;
        return this;
    }

    /**
     * Turn off LEDs.
     */
    get off() : Color {
        return this.level( 0 );
    }

    /**
     * Low brightness
     */
    get low() : Color {
        return this.level( 1 );
    }

    /**
     * Medium brightness
     */
    get medium() : Color {
        return this.level( 2 );
    }

    /**
     * Full brightness
     */
    get full() : Color {
        return this.level( 3 );
    }

    /**
     * Set a numeric brightness level for this color.
     * @param {Number} n Level between 0 and 3
     */
    level( n : 0 | 1 | 2 | 3 ) {
        return new Color( Math.min( 3, Math.max( 0, Math.round( n ) ) ), this._clear, this._copy, this._name );
    }

    /**
     * For the other buffer, turn the LED off.
     *
     * If neither clear nor copy are set, the other buffer will not be modified.
     */
    get clear() : Color {
        return new Color( this._level, true, this._copy, this._name );
    }

    /**
     * For the other buffer, use the same color.
     * This overrides the `clear` bit.
     *
     * If neither clear nor copy are set, the other buffer will not be modified.
     */
    get copy() : Color {
        return new Color( this._level, this._clear, true, this._name );
    }

    /**
     * @return {Number} MIDI code of this color
     */
    get code() {
        let r = this._level * ( ( this._name === 'red' || this._name === 'amber' ) ? 1 : 0 ),
            g = this._level * ( ( this._name === 'green' || this._name === 'amber' ) ? 1 : 0 );
        if ( this._name === 'yellow' && this._level > 0 ) {
            r = 2;
            g = 3;
        }
        return (
            0b10000 * g +
            0b01000 * ( this._clear ? 1 : 0 ) +
            0b00100 * ( this._copy ? 1 : 0 ) +
            0b00001 * r
        );
    }

    private readonly _level : number;
    private readonly _clear : boolean;
    private readonly _copy : boolean;
    private readonly _name : string;
}

/** @type {Color} */
export const red = new Color( 3, false, false, 'red' );
/** @type {Color} */
export const green = new Color( 3, false, false, 'green' );
/** @type {Color} */
export const amber = new Color( 3, false, false, 'amber' );
/** @type {Color} */
export const yellow = new Color( 3, false, false, 'yellow' );
/** @type {Color} */
export const off = new Color( 3, false, false, 'off' );
