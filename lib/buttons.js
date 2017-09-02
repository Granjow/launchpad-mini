'use strict';

const numbersFromCoords = function ( buttons ) {
    return Array.prototype.map.call( buttons || [], ( b, ix ) => ({
        select: b === 'x' || b === 'X',
        ix: ix === 0 ? 8 : ix - 1
    }) )
        .filter( b => b.select )
        .map( b => b.ix );
};

const asRow = function ( row, cols ) {
    return cols.map( col => [ row, col ] );
};
const asCol = function ( col, rows ) {
    return rows.map( row => [ row, col ] );
};

/**
 * Convert a modifier to data. A modifier is a human-readable string describing a button row or column
 * on the launchpad; see the description of the modifier parameter below.
 * @param {String} modifier Can be 'sc' for Scene buttons, 'am' for Automap buttons, 'rX' for row number X,
 * or 'cX' for column number X
 * @returns {{row:Boolean, nr:Number}|{error:Boolean}}
 */
const decodeModifier = function ( modifier ) {
    let mod = (modifier || '').toLowerCase(),
        nr = Number( mod[ 1 ] );
    if ( mod === 'sc' ) {
        return { row: true, nr: 8 };
    } else if ( mod === 'am' ) {
        return { row: false, nr: 8 };
    }
    if ( !isNaN( nr ) ) {
        if ( mod[ 0 ] === 'r' ) {
            return { row: true, nr: Number( mod[ 1 ] ) };
        } else if ( mod[ 0 ] === 'c' ) {
            return { row: false, nr: Number( mod[ 1 ] ) };
        }
    }
    return { error: true };
};

/**
 * Higher-order function which returns a function for the given modifier. The returned function takes a button number
 * and returns the button coordinates; the first part of the coordinate is given by the modifier, the second one
 * by the number(s) following it. For example, 'r4 1 2' describes buttons 1 and 2 on row 4; the function returns
 * those coordinates.
 * @param {String} modifier See #decodeModifier
 * @returns {function(Array.<Number>):Array.<Number>} This function takes a number and returns a button.
 */
const getDecoder = function ( modifier ) {
    let mod = decodeModifier( modifier );
    return mod.err ? () => [] : mod.row ? asRow.bind( null, mod.nr ) : asCol.bind( null, mod.nr )
};

/**
 * Returns a copy of the input array which is sorted and without duplicates.
 * @param {Array.<Number>} coords
 * @returns {Array.<Number>}
 */
const uniqueCoords = function ( coords ) {
    return coords.sort( ( a, b ) => {
        if ( a[ 0 ] !== b[ 0 ] ) {
            return a[ 0 ] - b[ 0 ];
        }
        return a[ 1 ] - b[ 1 ];
    } ).filter( ( el, ix, arr ) => {
        return ix === 0 || !(
            el[ 0 ] === arr[ ix - 1 ][ 0 ] &&
            el[ 1 ] === arr[ ix - 1 ][ 1 ]
        );
    } );
};

/**
 * Converts a string describing a row or column to button coordinates.
 * @param {String} pattern String format is 'mod:pattern', with *mod* being
 * one of rN (row N, e.g. r4), cN (column N), am (automap), sc (scene). *pattern* are buttons from 0 to 8, where an 'x' or 'X'
 * marks the button as selected, and any other character is ignored; for example: 'x..xx' or 'X  XX'.
 */
const decodeString = function ( pattern ) {
    pattern = pattern || '';
    return getDecoder( pattern.substring( 0, 2 ) )( numbersFromCoords( pattern.substring( 2 ) ) );
};

/**
 * @param {Array.<Array.<Number>>} arrays
 * @returns {Array.<Number>}
 */
const mergeArray = function ( arrays ) {
    return arrays.reduce( ( acc, cur ) => acc.concat( cur ), [] );
};

/**
 * Like decodeString(), but for an array of patterns.
 * @param {Array.<String>} patterns
 * @returns {Array.<Number>}
 */
const decodeStrings = function ( patterns ) {
    return uniqueCoords( mergeArray( patterns.map( decodeString ) ) );
};

module.exports = {
    decodeString,
    decodeStrings,
    decodeModifier,
    numbersFromCoords,
    uniqueCoords,
    asRow,
    asCol
};