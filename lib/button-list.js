/**
 * All Launchpad buttons
 * @type {Array.<Number>}
 */
const All = (new Array( 80 )).fill( 0 )
    .map( ( empty, ix ) => [ ix % 9, (ix - ix % 9) / 9 ] )
    .map( ( xy ) => {
        xy.id = Symbol();
        return xy;
    } );
/**
 * Grid buttons (8×8 square buttons)
 * @type {Array.<Number>}
 */
const Grid = All.filter( ( xy ) => xy[ 0 ] < 8 && xy[ 1 ] < 8 );
/**
 * Automap buttons (top row of round buttons)
 * @type {Array.<Number>}
 */
const Automap = All.filter( ( xy ) => xy[ 1 ] === 8 );
/**
 * Scene buttons (right row of round buttons)
 * @type {Array.<Number>}
 */
const Scene = All.filter( ( xy ) => xy[ 0 ] === 8 );

const mapById = new Map();
All.forEach( b => mapById.set( b.id, b ) );

const byId = ( id ) => {
    return mapById.get( id );
};

const byXy = ( x, y ) => {
    return All[ 9 * y + x ];
};

const Buttons = {
    All,
    Grid,
    Automap,
    Scene,
    byId,
    byXy
};

module.exports = Buttons;