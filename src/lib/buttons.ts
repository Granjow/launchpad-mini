export interface ButtonCoordinate {
    row : boolean;
    nr : number;
}

export class DecodeError extends Error {

}

interface IntermediateCoordinate {
    select : boolean;
    ix : number;
}

export class Buttons {

    static numbersFromCoords = function ( buttons : string ) {
        return Array.prototype.map.call( buttons || [], ( b : string, ix : number ) => ( {
            select: b === 'x' || b === 'X',
            ix: ix === 0 ? 8 : ix - 1
        } as IntermediateCoordinate ) )
            .filter( ( b : IntermediateCoordinate ) => b.select )
            .map( ( b : IntermediateCoordinate ) => b.ix );
    };

    static asRow = function ( row : number, cols : number[] ) {
        return cols.map( col => [ row, col ] );
    };
    static asCol = function ( col : number, rows : number[] ) {
        return rows.map( row => [ row, col ] );
    };

    /**
     * Convert a modifier to data. A modifier is a human-readable string describing a button row or column
     * on the launchpad; see the description of the modifier parameter below.
     * @param modifier Can be 'sc' for Scene buttons, 'am' for Automap buttons, 'rX' for row number X,
     * or 'cX' for column number X
     * @returns {{row:Boolean, nr:Number}|{error:Boolean}}
     */
    static decodeModifier = ( modifier : string ) : ButtonCoordinate | DecodeError => {
        let mod = ( modifier || '' ).toLowerCase(),
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
        return new DecodeError();
    };

    /**
     * Higher-order function which returns a function for the given modifier. The returned function takes a button number
     * and returns the button coordinates; the first part of the coordinate is given by the modifier, the second one
     * by the number(s) following it. For example, 'r4 1 2' describes buttons 1 and 2 on row 4; the function returns
     * those coordinates.
     * @param modifier See #decodeModifier
     * @returns This function takes a number and returns a button.
     */
    static getDecoder = function ( modifier : string ) : ( n : number[] ) => number[] {
        let mod = Buttons.decodeModifier( modifier );
        if ( mod instanceof DecodeError ) {
            return () : number[] => [];
        } else {
            return mod.row ? Buttons.asRow.bind( null, mod.nr ) : Buttons.asCol.bind( null, mod.nr );
        }
    };

    /**
     * Returns a copy of the input array which is sorted and without duplicates.
     * @param {Array.<Number>} coords
     * @returns {Array.<Number>}
     */
    static uniqueCoords = function ( coords : number[] ) {
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
     * @param pattern String format is 'mod:pattern', with *mod* being
     * one of rN (row N, e.g. r4), cN (column N), am (automap), sc (scene). *pattern* are buttons from 0 to 8, where an 'x' or 'X'
     * marks the button as selected, and any other character is ignored; for example: 'x..xx' or 'X  XX'.
     */
    static decodeString = function ( pattern : string ) {
        return Buttons.getDecoder( pattern.substring( 0, 2 ) )( Buttons.numbersFromCoords( pattern.substring( 2 ) ) );
    };

    /**
     * Matrix to vector function
     */
    static mergeArray = function ( arrays : number[][] ) : number[] {
        return arrays.reduce( ( acc, cur ) => acc.concat( cur ), [] );
    };

    /**
     * Like decodeString(), but for an array of patterns.
     * @returns {Array.<Number>}
     */
    static decodeStrings = function ( patterns : string[] ) {
        return Buttons.uniqueCoords( Buttons.mergeArray( patterns.map( Buttons.decodeString ) ) );
    };

}