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
            const el : ButtonItem = xy as any;
            el.id = Symbol();
            return el;
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

    public static byId = ( id : Symbol ) => {
        return LaunchpadButtons.mapById.get( id );
    };

    static byXy = ( x : number, y : number ) => {
        return LaunchpadButtons.All[ 9 * y + x ];
    };

}