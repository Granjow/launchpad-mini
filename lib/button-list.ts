export interface ButtonItem {
    0 : number;
    1 : number;
    id : Symbol;
}

export class LaunchpadButtons {
    /**
     * All Launchpad buttons
     * @type {Array.<Number>}
     */
    static All : ButtonItem[] = ( new Array( 80 ) ).fill( 0 )
        .map( ( empty, ix ) => [ ix % 9, ( ix - ix % 9 ) / 9 ] )
        .map( ( xy ) => {
            xy.id = Symbol();
            return xy;
        } );
    /**
     * Grid buttons (8×8 square buttons)
     * @type {Array.<Number>}
     */
    static Grid = LaunchpadButtons.All.filter( ( xy ) => xy[ 0 ] < 8 && xy[ 1 ] < 8 );
    /**
     * Automap buttons (top row of round buttons)
     * @type {Array.<Number>}
     */
    static Automap = LaunchpadButtons.All.filter( ( xy ) => xy[ 1 ] === 8 );
    /**
     * Scene buttons (right row of round buttons)
     * @type {Array.<Number>}
     */
    static Scene = LaunchpadButtons.All.filter( ( xy ) => xy[ 0 ] === 8 );

    static mapById = ( () => {
        const map = new Map();
        LaunchpadButtons.All.forEach( b => map.set( b.id, b ) );
        return map;
    } )();

    static byId = ( id ) => {
        return LaunchpadButtons.mapById.get( id );
    };

    static byXy = ( x, y ) => {
        return LaunchpadButtons.All[ 9 * y + x ];
    };

}