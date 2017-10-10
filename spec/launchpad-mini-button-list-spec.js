const Buttons = require( '../lib/button-list' );

describe( 'Launchpad Mini buttons:', () => {
    describe( 'Object All', () => {

        it( 'has correct length', () => {
            expect( Buttons.All.length ).toBe( 80 );
        } );

        it( 'provides IDs on all elements', () => {
            Buttons.All.forEach( ( button ) => {
                expect( button.id ).toBeDefined();
            } );
        } );

        it( 'uses the same IDs on multiple instances', () => {
            expect( require( '../lib/button-list' ).All[ 0 ].id ).toBe( Buttons.All[ 0 ].id );
        } );

    } );

    describe( 'Object Grid', () => {

        it( 'has correct length', () => {
            expect( Buttons.Grid.length ).toBe( 64 );
        } );

        it( 'uses identical IDs as All', () => {
            Buttons.Grid.forEach( xy => {
                let buttons = Buttons.All.filter( b => b[ 0 ] === xy[ 0 ] && b[ 1 ] === xy[ 1 ] );
                expect( buttons.length ).toBe( 1, `More than one button with coordinates ${xy[ 0 ]},${xy[ 1 ]}` );
                expect( xy.id ).toBe( buttons[ 0 ].id );
            } );
        } );
    } );

    describe( 'Object Automap', () => {

        it( 'has correct length', () => {
            expect( Buttons.Automap.length ).toBe( 8 );
        } );

        it( 'uses identical IDs as All', () => {
            Buttons.Automap.forEach( xy => {
                let buttons = Buttons.All.filter( b => b[ 0 ] === xy[ 0 ] && b[ 1 ] === xy[ 1 ] );
                expect( buttons.length ).toBe( 1, `More than one button with coordinates ${xy[ 0 ]},${xy[ 1 ]}` );
                expect( xy.id ).toBe( buttons[ 0 ].id );
            } );
        } );
    } );

    describe( 'Object Scene', () => {

        it( 'has correct length', () => {
            expect( Buttons.Scene.length ).toBe( 8 );
        } );

        it( 'uses identical IDs as All', () => {
            Buttons.Scene.forEach( xy => {
                let buttons = Buttons.All.filter( b => b[ 0 ] === xy[ 0 ] && b[ 1 ] === xy[ 1 ] );
                expect( buttons.length ).toBe( 1, `More than one button with coordinates ${xy[ 0 ]},${xy[ 1 ]}` );
                expect( xy.id ).toBe( buttons[ 0 ].id );
            } );
        } );
    } );

    describe( 'byId', () => {
        it( 'finds all buttons', () => {
            Buttons.All.forEach( b => {
                expect( Buttons.byId( b.id ) ).toBe( b );
            } );
        } );
    } );

    describe( 'byXy', () => {
        it( 'returns correct buttons', () => {
            for ( let x = 0; x < 9; x++ ) {
                for ( let y = 0; y < 9; y++ ) {
                    let b = Buttons.byXy( x, y );
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