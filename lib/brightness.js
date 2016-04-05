'use strict';

var num = (new Array( 16 )).fill( 0 ).map( ( el, ix ) => ix + 1 ),
    den = (new Array( 16 )).fill( 0 ).map( ( el, ix ) => ix + 3 );

let arr = num.map( nu => den.map( de => [ nu, de ] ) )
    .reduce( ( acc, cur ) => acc.concat( cur ), [] )
    .filter( pair => pair[ 0 ] <= pair[ 1 ] )
    .map( pair => [ pair[ 0 ], pair[ 1 ], pair[ 0 ] / pair[ 1 ] ] )
    .sort( ( a, b ) => a[ 2 ] - b[ 2 ] )
    .filter( ( el, ix, arr ) => !(ix > 0 && arr[ ix - 1 ][ 2 ] === el[ 2 ]) );

/**
 * @param {Number} t Brightness level between 0 and 1
 * @returns {Array.<Number>} Array [ numerator, denominator, fraction ]
 */
var getNumDen = function ( t ) {
    return arr[ Math.min( arr.length - 1, Math.max( 0, Math.round( t * arr.length ) ) ) ];
};

module.exports = {
    getNumDen
};