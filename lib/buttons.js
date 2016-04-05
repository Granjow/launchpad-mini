var numbersFromCoords = function ( buttons ) {
    return Array.prototype.map.call( buttons, ( b, ix ) => ({ select: b === 'x' || b === 'X', ix: ix }) )
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
 *
 * @param {String} str
 */
var fromLine = function ( str ) {
    var modifier = str.substring( 0, 3 ).toLowerCase(),
        buttons = str.substring( 3 );
    console.log( modifier, buttons );
    var list = numbersFromCoords( buttons );

    if ( modifier[ 0 ] === 'r' ) {
        return asRow( Number( modifier[ 1 ] ), numbersFromCoords( buttons ) );
    } else if ( modifier[ 0 ] === 'c' ) {
        return asCol( Number( modifier[ 1 ] ), numbersFromCoords( buttons ) );
    } else if ( modifier.startsWith( 'sc' ) ) {
        return asRow( 8, numbersFromCoords( buttons ) );
    } else if ( modifier.startsWith( 'au' ) ) {
        return asCol( 8, numbersFromCoords( buttons ) );
    }

    return [];
};

console.log( fromLine( 'r4 x..x' ) );
console.log( fromLine( 'sc x..x' ) );