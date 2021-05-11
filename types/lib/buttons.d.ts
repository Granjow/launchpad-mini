/**
 * Converts a string describing a row or column to button coordinates.
 * @param {String} pattern String format is 'mod:pattern', with *mod* being
 * one of rN (row N, e.g. r4), cN (column N), am (automap), sc (scene). *pattern* are buttons from 0 to 8, where an 'x' or 'X'
 * marks the button as selected, and any other character is ignored; for example: 'x..xx' or 'X  XX'.
 */
export function decodeString(pattern: string): number[];
/**
 * Like decodeString(), but for an array of patterns.
 * @param {Array.<String>} patterns
 * @returns {Array.<Number>}
 */
export function decodeStrings(patterns: Array<string>): Array<number>;
/**
 * Convert a modifier to data. A modifier is a human-readable string describing a button row or column
 * on the launchpad; see the description of the modifier parameter below.
 * @param {String} modifier Can be 'sc' for Scene buttons, 'am' for Automap buttons, 'rX' for row number X,
 * or 'cX' for column number X
 * @returns {{row:Boolean, nr:Number}|{error:Boolean}}
 */
export function decodeModifier(modifier: string): {
    row: boolean;
    nr: number;
} | {
    error: boolean;
};
export function numbersFromCoords(buttons: any): any;
/**
 * Returns a copy of the input array which is sorted and without duplicates.
 * @param {Array.<Number>} coords
 * @returns {Array.<Number>}
 */
export function uniqueCoords(coords: Array<number>): Array<number>;
export function asRow(row: any, cols: any): any;
export function asCol(col: any, rows: any): any;
