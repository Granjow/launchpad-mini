import { Colors } from '../src/lib/colors';

describe( 'Color assembly', function () {
    it( 'uses correct red brightness', () => {
        expect( Colors.red.full.code ).toBe( 3 );
        expect( Colors.red.medium.code ).toBe( 2 );
        expect( Colors.red.low.code ).toBe( 1 );
        expect( Colors.red.off.code ).toBe( 0 );
    } );
    it( 'uses correct green brightness', () => {
        expect( Colors.green.full.code ).toBe( 48 );
        expect( Colors.green.medium.code ).toBe( 32 );
        expect( Colors.green.low.code ).toBe( 16 );
        expect( Colors.green.off.code ).toBe( 0 );
    } );
    it( 'uses correct amber brightness', () => {
        expect( Colors.amber.full.code ).toBe( Colors.red.full.code + Colors.green.full.code );
        expect( Colors.amber.medium.code ).toBe( Colors.red.medium.code + Colors.green.medium.code );
        expect( Colors.amber.low.code ).toBe( Colors.red.low.code + Colors.green.low.code );
        expect( Colors.amber.off.code ).toBe( Colors.red.off.code + Colors.green.off.code );
    } );
    it( 'uses correct yellow brightness', () => {
        expect( Colors.yellow.medium.code ).toBe( 50 );
        expect( Colors.yellow.off.code ).toBe( 0 );
    } );
    it( 'uses correct off brightness', () => {
        expect( Colors.off.code ).toBe( 0 );
    } );
    it( 'applies clear modifier', () => {
        expect( Colors.red.full.clear.code ).toBe( Colors.red.full.code + 8 );
        expect( Colors.red.medium.clear.code ).toBe( Colors.red.medium.code + 8 );
    } );
    it( 'applies copy modifier', () => {
        expect( Colors.amber.medium.copy.code ).toBe( Colors.amber.medium.code + 4 );
    } );
} );