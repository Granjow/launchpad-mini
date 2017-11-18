const Launchpad = require( '../launchpad-mini' );

let pad = new Launchpad();

let binary = '00000001';
//  index     12345678

pad.connect().then( () => {
    pad.reset();
    pad.on( 'key', k => {
        if (k.pressed) {
            if (k.y === 7) { // bottom row
                if (k.x !== 8) { // exclude scene buttons
                    // let binaryDigit = 8 - k.x; // left = 8, ... , right = 1
                    // let binaryArrayKey = 8 - binaryDigit;

                    let index = k.x;
                    let is = binary.charAt(index);
                    let bool = is === '1';

                    binary = binary.replace(/./g, (c, i) => i === index ? (bool ? 0 : 1): c); // replace binary bit with opposite

                    pad.reset();
                    drawBinary();
                    drawNumber();
                }
            }
        }
    } );
    drawBinary();
    drawNumber(1);
} );

function drawBinary() {
    let i = 0;
    for (let char of binary) {
        pad.col(char === '1' ? pad.green : pad.red, [ [i++, 7] ]);
    }
}

function drawNumber() {

    let number = parseInt(binary, 2);

    var digits = (""+number).split("");

    console.log(`${binary} = ${number} = ${JSON.stringify(digits)}`);

    let right = digits.splice(-1,1)[0];
    let left = digits.splice(-1,1)[0];
    let top = digits.splice(-1,1)[0];

    if (right !== undefined) {
        pad.col( pad.amber, pad.fromPattern( numberRight5x3(parseInt(right)) ) );
    }

    if (left !== undefined) {
        pad.col( pad.amber, pad.fromPattern( numberLeft5x3(parseInt(left)) ) );
    }

    if (top !== undefined) {
        pad.col( pad.amber, [parseInt(top) -1, 8] );
    }
}

function numberRight5x3(number) {
    switch (number) {
        case 1:
            return [
                'c0        x',
                'c1        x',
                'c2        x',
                'c3        x',
                'c4        x',
            ];
        case 2:
            return [
                'c0      xxx',
                'c1        x',
                'c2      xxx',
                'c3      x  ',
                'c4      xxx',
            ];
        case 3:
            return [
                'c0      xxx',
                'c1        x',
                'c2      xxx',
                'c3        x',
                'c4      xxx',
            ];
        case 4:
            return [
                'c0      x x',
                'c1      x x',
                'c2      xxx',
                'c3        x',
                'c4        x',
            ];
        case 5:
            return [
                'c0      xxx',
                'c1      x  ',
                'c2      xxx',
                'c3        x',
                'c4      xxx',
            ];
        case 6:
            return [
                'c0      xxx',
                'c1      x  ',
                'c2      xxx',
                'c3      x x',
                'c4      xxx',
            ];
        case 7:
            return [
                'c0      xxx',
                'c1        x',
                'c2        x',
                'c3        x',
                'c4        x',
            ];
        case 8:
            return [
                'c0      xxx',
                'c1      x x',
                'c2      xxx',
                'c3      x x',
                'c4      xxx',
            ];
        case 9:
            return [
                'c0      xxx',
                'c1      x x',
                'c2      xxx',
                'c3        x',
                'c4        x',
            ];
        case 0:
            return [
                'c0      xxx',
                'c1      x x',
                'c2      x x',
                'c3      x x',
                'c4      xxx',
            ];
    }
}

function numberLeft5x3(number) {
    switch (number) {
        case 1:
            return [
                'c0   x',
                'c1   x',
                'c2   x',
                'c3   x',
                'c4   x',
            ];
        case 2:
            return [
                'c0 xxx',
                'c1   x',
                'c2 xxx',
                'c3 x  ',
                'c4 xxx',
            ];
        case 3:
            return [
                'c0 xxx',
                'c1   x',
                'c2 xxx',
                'c3   x',
                'c4 xxx',
            ];
        case 4:
            return [
                'c0 x x',
                'c1 x x',
                'c2 xxx',
                'c3   x',
                'c4   x',
            ];
        case 5:
            return [
                'c0 xxx',
                'c1 x  ',
                'c2 xxx',
                'c3   x',
                'c4 xxx',
            ];
        case 6:
            return [
                'c0 xxx',
                'c1 x  ',
                'c2 xxx',
                'c3 x x',
                'c4 xxx',
            ];
        case 7:
            return [
                'c0 xxx',
                'c1   x',
                'c2   x',
                'c3   x',
                'c4   x',
            ];
        case 8:
            return [
                'c0 xxx',
                'c1 x x',
                'c2 xxx',
                'c3 x x',
                'c4 xxx',
            ];
        case 9:
            return [
                'c0 xxx',
                'c1 x x',
                'c2 xxx',
                'c3   x',
                'c4   x',
            ];
        case 0:
            return [
                'c0 xxx',
                'c1 x x',
                'c2 x x',
                'c3 x x',
                'c4 xxx',
            ];
    }
}
