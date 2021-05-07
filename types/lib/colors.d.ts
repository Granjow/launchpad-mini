export class Color {
    constructor(level: any, clear: any, copy: any, name: any);
    _level: any;
    _clear: any;
    _copy: any;
    _name: any;
    /**
     * Turn off LEDs.
     * @return {Color}
     */
    get off(): Color;
    /**
     * Low brightness
     * @return {Color}
     */
    get low(): Color;
    /**
     * Medium brightness
     * @return {Color}
     */
    get medium(): Color;
    /**
     * Full brightness
     * @return {Color}
     */
    get full(): Color;
    /**
     * Set a numeric brightness level for this color.
     * @param {Number} n Level between 0 and 3
     * @return {Color}
     */
    level(n: number): Color;
    /**
     * For the other buffer, turn the LED off.
     *
     * If neither clear nor copy are set, the other buffer will not be modified.
     * @return {Color}
     */
    get clear(): Color;
    /**
     * For the other buffer, use the same color.
     * This overrides the `clear` bit.
     *
     * If neither clear nor copy are set, the other buffer will not be modified.
     * @return {Color}
     */
    get copy(): Color;
    /**
     * @return {Number} MIDI code of this color
     */
    get code(): number;
}
/** @type {Color} */
export const red: Color;
/** @type {Color} */
export const green: Color;
/** @type {Color} */
export const amber: Color;
/** @type {Color} */
export const yellow: Color;
/** @type {Color} */
export const off: Color;
