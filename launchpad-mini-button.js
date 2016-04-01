'use strict';

let Button = function ( x, y ) {
    this.x = x;
    this.y = y;
    this.pressed = false;
};
Button.prototype = {
    col: function ( colCode ) {

    },
    toString: function () {
        return `(${this.x}|${this.y}: ${this.pressed ? 1 : 0}`;
    }
};

let Grid = function () {
    let w = 9, h = 9;
    this.buttons = (new Array( w )).fill( (new Array( h )).fill( 0 ) )
        .map( ( row, ix ) => row.map( ( el, iy ) => new Button( ix, iy ) ) );
};
Grid.prototype = {
    at: function(x,y) {
        return this.buttons[x][y];
    }
};


module.exports = { Button, Grid };