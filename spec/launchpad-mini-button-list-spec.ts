import { LaunchpadButtons } from '../src/lib/button-list';

const Buttons = require( '../src/lib/button-list' );

describe( 'Launchpad Mini buttons:', () => {
    describe( 'Object All', () => {

        it( 'has correct length', () => {
            expect( LaunchpadButtons.All.length ).toBe( 80 );
        } );

        it( 'provides IDs on all elements', () => {
            LaunchpadButtons.All.forEach( ( button ) => {
                expect( button.id ).toBeDefined();
            } );
        } );

        it( 'uses the same IDs on multiple instances', () => {
            expect( require( '../src/lib/button-list' ).All[ 0 ].id ).toBe( LaunchpadButtons.All[ 0 ].id );
        } );

    } );

    describe( 'Object Grid', () => {

        it( 'has correct length', () => {
            expect( Buttons.Grid.length ).toBe( 64 );
        } );

        it( 'uses identical IDs as All', () => {
            LaunchpadButtons.Grid.forEach( xy => {
                let buttons = LaunchpadButtons.All.filter( b => b[ 0 ] === xy[ 0 ] && b[ 1 ] === xy[ 1 ] );
                expect( buttons.length ).toBe( 1, `More than one button with coordinates ${xy[ 0 ]},${xy[ 1 ]}` );
                expect( xy.id ).toBe( buttons[ 0 ].id );
            } );
        } );
    } );

    describe( 'Object Automap', () => {

        it( 'has correct length', () => {
            expect( LaunchpadButtons.Automap.length ).toBe( 8 );
        } );

        it( 'uses identical IDs as All', () => {
            LaunchpadButtons.Automap.forEach( xy => {
                let buttons = Buttons.All.filter( b => b[ 0 ] === xy[ 0 ] && b[ 1 ] === xy[ 1 ] );
                expect( buttons.length ).toBe( 1, `More than one button with coordinates ${xy[ 0 ]},${xy[ 1 ]}` );
                expect( xy.id ).toBe( buttons[ 0 ].id );
            } );
        } );
    } );

    describe( 'Object Scene', () => {

        it( 'has correct length', () => {
            expect( LaunchpadButtons.Scene.length ).toBe( 8 );
        } );

        it( 'uses identical IDs as All', () => {
            LaunchpadButtons.Scene.forEach( xy => {
                let buttons = Buttons.All.filter( b => b[ 0 ] === xy[ 0 ] && b[ 1 ] === xy[ 1 ] );
                expect( buttons.length ).toBe( 1, `More than one button with coordinates ${xy[ 0 ]},${xy[ 1 ]}` );
                expect( xy.id ).toBe( buttons[ 0 ].id );
            } );
        } );
    } );

    describe( 'byId', () => {
        it( 'finds all buttons', () => {
            LaunchpadButtons.All.forEach( b => {
                expect( LaunchpadButtons.byId( b.id ) ).toBe( b );
            } );
        } );
    } );

    describe( 'byXy', () => {
        it( 'returns correct buttons', () => {
            for ( let x = 0; x < 9; x++ ) {
                for ( let y = 0; y < 9; y++ ) {
                    let b = LaunchpadButtons.byXy( x, y );
                    if ( x === 8 && y === 8 ) {
                        expect( b ).toBeUndefined();
                    } else {
                        expect( [ b[ 0 ], b[ 1 ] ] ).toEqual( [ x, y ] );
                    }
                }
            }
        } );
    } )

} );