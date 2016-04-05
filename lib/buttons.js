'use strict';

var numbersFromCoords = function ( buttons ) {
    return Array.prototype.map.call( buttons || [], ( b, ix ) => ({
            select: b === 'x' || b === 'X',
            ix: ix === 0 ? 8 : ix - 1
        }) )
        .filter( b => b.select )
        .map( b => b.ix );
};

var asRow = function ( row, cols ) {
    return cols.map( col => [ row, col ] );
};
var asCol = function ( col, rows ) {
    return rows.map( row => [ row, col ] );
};

/**
 * @param {String} modifier
 * @returns {{row:Boolean, nr:Number}|{error:Boolean}}
 */
var decodeModifier = function ( modifier ) {
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
 * @param {String} modifier
 * @returns {function(Array.<Number>):Array.<Number>}
 */
var getDecoder = function ( modifier ) {
    let mod = decodeModifier( modifier );
    return mod.err ? () => [] : mod.row ? asRow.bind( null, mod.nr ) : asCol.bind( null, mod.nr )
};

/**
 * @param {Array.<Number>} coords
 * @returns {Array.<Number>}
 */
var uniqueCoords = function ( coords ) {
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
var decodeString = function ( pattern ) {
    pattern = pattern || '';
    return getDecoder( pattern.substring( 0, 2 ) )( numbersFromCoords( pattern.substring( 2 ) ) );
};

/**
 * @param {Array.<Array.<Number>>} arrays
 * @returns {Array.<Number>}
 */
var mergeArray = function ( arrays ) {
    return arrays.reduce( ( acc, cur ) => acc.concat( cur ), [] );
};

/**
 * Like decodeString(), but for an array of patterns.
 * @param {Array.<String>} patterns
 * @returns {Array.<Number>}
 */
var decodeStrings = function ( patterns ) {
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