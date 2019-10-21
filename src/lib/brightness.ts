export class Brightness {
    /*
     Launchpad describes brightness levels as a “duty cycle” fraction described by
     f = num/den. num is a number between 1 and 16, den is a number between 3 and 18.
     */

    private static num = ( new Array( 16 ) ).fill( 0 ).map( ( el, ix ) => ix + 1 );
    private static den = ( new Array( 16 ) ).fill( 0 ).map( ( el, ix ) => ix + 3 );

    private static arr = Brightness.num.map( nu => Brightness.den.map( de => [ nu, de ] ) )
        .reduce( ( acc, cur ) => acc.concat( cur ), [] )
        .filter( pair => pair[ 0 ] <= pair[ 1 ] ) // Remove all numbers where the fraction is > 1
        .map( pair => [ pair[ 0 ], pair[ 1 ], pair[ 0 ] / pair[ 1 ] ] ) // now contains all [ num, den, f ] pairs
        .sort( ( a, b ) => a[ 2 ] - b[ 2 ] ) // Sort by size
        .filter( ( el, ix, arr ) => !( ix > 0 && arr[ ix - 1 ][ 2 ] === el[ 2 ] ) ); // Remove all duplicates

    /**
     * This method finds the best duty cycle match for the given brightness.
     * @param {Number} t Brightness level between 0 and 1
     * @returns {Array.<Number>} Array [ numerator, denominator, fraction ]
     */
    static getNumDen = function ( t : number ) {
        return Brightness.arr[ Math.min( Brightness.arr.length - 1, Math.max( 0, Math.round( t * Brightness.arr.length ) ) ) ];
    };

}