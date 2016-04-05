var Color = require( '../lib/colors' );

describe( 'Color assembly', function () {
    it( 'uses correct red brightness', () => {
        expect( Color.red.full.code ).toBe( 3 );
        expect( Color.red.medium.code ).toBe( 2 );
        expect( Color.red.low.code ).toBe( 1 );
        expect( Color.red.off.code ).toBe( 0 );
    } );
    it( 'uses correct green brightness', () => {
        expect( Color.green.full.code ).toBe( 48 );
        expect( Color.green.medium.code ).toBe( 32 );
        expect( Color.green.low.code ).toBe( 16 );
        expect( Color.green.off.code ).toBe( 0 );
    } );
    it( 'uses correct amber brightness', () => {
        expect( Color.amber.full.code ).toBe( Color.red.full.code + Color.green.full.code );
        expect( Color.amber.medium.code ).toBe( Color.red.medium.code + Color.green.medium.code );
        expect( Color.amber.low.code ).toBe( Color.red.low.code + Color.green.low.code );
        expect( Color.amber.off.code ).toBe( Color.red.off.code + Color.green.off.code );
    } );
    it( 'uses correct yellow brightness', () => {
        expect( Color.yellow.medium.code ).toBe( 50 );
        expect( Color.yellow.off.code ).toBe( 0 );
    } );
    it( 'uses correct off brightness', () => {
        expect( Color.off.code ).toBe( 0 );
    } );
    it( 'applies clear modifier', () => {
        expect( Color.red.full.clear.code ).toBe( Color.red.full.code + 8 );
        expect( Color.red.medium.clear.code ).toBe( Color.red.medium.code + 8 );
    } );
    it( 'applies copy modifier', () => {
        expect( Color.amber.medium.copy.code ).toBe( Color.amber.medium.code + 4 );
    } );
} );