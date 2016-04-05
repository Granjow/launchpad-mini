var buttons = require( '../lib/buttons' );
describe( 'Line parser', () => {
    it( 'should recognize lowercase rows', () => {

    } )
} );
describe( 'Modifier parser', () => {
    it( 'parses rows', () => {
        expect( buttons.decodeModifier( 'r4' ) ).toEqual( { row: true, nr: 4 } );
        expect( buttons.decodeModifier( 'R0' ) ).toEqual( { row: true, nr: 0 } );
        expect( buttons.decodeModifier( 'r8' ) ).toEqual( { row: true, nr: 8 } );
        expect( buttons.decodeModifier( 'r' ) ).toEqual( { error: true } );
    } );
    it( 'parses columns', () => {
        expect( buttons.decodeModifier( 'c4' ) ).toEqual( { row: false, nr: 4 } );
        expect( buttons.decodeModifier( 'C0' ) ).toEqual( { row: false, nr: 0 } );
        expect( buttons.decodeModifier( 'c8' ) ).toEqual( { row: false, nr: 8 } );
        expect( buttons.decodeModifier( 'c' ) ).toEqual( { error: true } );
    } );
    it( 'parses scene buttons', () => {
        expect( buttons.decodeModifier( 'sc' ) ).toEqual( { row: true, nr: 8 } );
        expect( buttons.decodeModifier( 'SC' ) ).toEqual( { row: true, nr: 8 } );
    } );
    it( 'parses automap buttons', () => {
        expect( buttons.decodeModifier( 'am' ) ).toEqual( { row: false, nr: 8 } );
        expect( buttons.decodeModifier( 'AM' ) ).toEqual( { row: false, nr: 8 } );
    } );
    it( 'returns error for invalid modifier', () => {
        expect( buttons.decodeModifier( 'xy' ) ).toEqual( { error: true } );
        expect( buttons.decodeModifier( 'ry' ) ).toEqual( { error: true } );
        expect( buttons.decodeModifier( undefined ) ).toEqual( { error: true } );
        expect( buttons.decodeModifier( '' ) ).toEqual( { error: true } );
    } );
} );
describe( 'Number parser', () => {
    it( 'recognizes x and X as marker', function () {
        expect( buttons.numbersFromCoords( ':x.X.x.X.x.X.' ) ).toEqual( [ 0, 2, 4, 6, 8, 10 ] );
        expect( buttons.numbersFromCoords( 'xx.X.x.X.x.X.' ) ).toEqual( [ 8, 0, 2, 4, 6, 8, 10 ] );
    } );
    it( 'returns empty array for empty/invalid args', () => {
        expect( buttons.numbersFromCoords( 'asdf' ) ).toEqual( [] );
        expect( buttons.numbersFromCoords( '' ) ).toEqual( [] );
        expect( buttons.numbersFromCoords( undefined ) ).toEqual( [] );
    } );
} );
describe( 'Row/col converter', () => {
    it( 'creates rows', () => {
        expect( buttons.asRow( 2, [ 0, 3 ] ) ).toEqual( [ [ 2, 0 ], [ 2, 3 ] ] );
    } );
    it( 'creates cols', () => {
        expect( buttons.asCol( 2, [ 0, 3 ] ) ).toEqual( [ [ 0, 2 ], [ 3, 2 ] ] );
    } );
} );
describe( 'Line parser', () => {
    it( 'reads row', () => {
        expect( buttons.decodeString( 'r4:x..x' ) ).toEqual( [ [ 4, 0 ], [ 4, 3 ] ] );
        expect( buttons.decodeString( 'r6 XX XXX XX' ) ).toEqual( [ [ 6, 0 ], [ 6, 1 ], [ 6, 3 ], [ 6, 4 ], [ 6, 5 ], [ 6, 7 ], [ 6, 8 ] ] );
    } );
    it( 'uses first character as 8 overflow', () => {
        expect( buttons.decodeString( 'r2x' ) ).toEqual( [ [ 2, 8 ] ] );
        expect( buttons.decodeString( 'c2x' ) ).toEqual( [ [ 8, 2 ] ] );
    } );
    it( 'reads scene buttons', () => {
        expect( buttons.decodeString( 'sc:..xx' ) ).toEqual( [ [ 8, 2 ], [ 8, 3 ] ] );
    } );
    it( 'reads automap buttons', () => {
        expect( buttons.decodeString( 'AM ..X X' ) ).toEqual( [ [ 2, 8 ], [ 4, 8 ] ] );
    } );
} );
describe( 'Coordinate merger', () => {
    it( 'removes duplicate coordinates', () => {
        expect( buttons.uniqueCoords( [ [ 1, 2 ], [ 2, 1 ], [ 1, 2 ], [ 1, 2 ] ] ) ).toEqual( [ [ 1, 2 ], [ 2, 1 ] ] );
        expect( buttons.uniqueCoords( [] ) ).toEqual( [] );
        expect( buttons.uniqueCoords( [ [ 1, 2 ] ] ) ).toEqual( [ [ 1, 2 ] ] );
    } );
} );
describe( 'Array parser', () => {
    it( 'parses rows and columns', () => {
        expect( buttons.decodeStrings( [ 'r1:x...x', 'c4:..xx' ] ) ).toEqual( [ [ 1, 0 ], [ 1, 4 ], [ 2, 4 ], [ 3, 4 ] ] );
    } );
    it( 'purges duplicate coordinates', () => {
        expect( buttons.decodeStrings( [ 'r1:xx', 'c1:xxx' ] ) ).toEqual( [ [ 0, 1 ], [ 1, 0 ], [ 1, 1 ], [ 2, 1 ] ] );
    } );
} );