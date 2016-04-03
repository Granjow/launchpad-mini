JavaScript library for interacting with the Novation Launchpad Mini.

Other node.js libraries exist, which you may want to consider as well, like:

* [launchpadder](https://www.npmjs.com/package/launchpadder)
* [midi-launchpad](https://www.npmjs.com/package/midi-launchpad)
* [phi-launchpad](https://www.npmjs.com/package/phi-launchpad)

This yet-another-lauchpad-library exists because other libraries did not compile, did not start,
are no longer maintained, or lack some useful features.

Some of the bonus features of this library:

* Auto-detects launchpad
* Accurate documentation of Launchpad and library features
* ES6 Promises avoid flooding the Launchpad (and corrupting button colours)

![Sample](img/smile.jpg)

## Usage

    const Launchpad = require( 'launchpad-mini' ),
          pad = new Launchpad();
    pad.connect()                       // Auto-detect Launchpad
        .then( () => pad.reset( 2 ) );  // Make Launchpad glow yellow

## Documentation

Product page: [Novation Launchpad Mini](https://global.novationmusic.com/launch/launchpad-mini)

Novation provides a reference on [their download page](https://global.novationmusic.com/support/product-downloads?product=Launchpad)
(direct link: [Launchpad MK2 Programmer’s Reference Manual](https://global.novationmusic.com/sites/default/files/novation/downloads/10529/launchpad-mk2-programmers-reference-guide_0.pdf))
describing the MIDI interface of the Launchpad MK2 models. 

For the Launchpad Mini, see the Programmer’s Manual in this repository’s `doc/` subdirectory. It is also
written by Novation, but for some reason it is not available on their web site.

## API

All methods are documented in the code, so your IDE should provide you with documentation and type annotation.
The documentation below is mainly an overview and not equally precise.

**Buttons:**

The Launchpad has

* 8 round *Automap/Live Buttons* on top,
* 8 round *Scene Buttons* on the right,
* 64 square *Grid Buttons* on the main area.

In code, the Automap buttons have column number 8 (not 0).

        0 1 2 3 4 5 6 7 8 (x)
     8  o o o o o o o o
     0  [][][][][][][][] o
     1  [][][][][][][][] o
     2  [][][][][][][][] o
     3  [][][][][][][][] o
     4  [][][][][][][][] o
     5  [][][][][][][][] o
     6  [][][][][][][][] o
     7  [][][][][][][][] o
    (y)

**Colors:** 

Launchpad buttons are lit by a red and a green LED each; combined, they give Amber.
Each LED supports 3 power levels: off, low, medium, and full.

    Launchpad.Off
    Launchpad.RedLow
    Launchpad.RedMedium
    Launchpad.RedFull
    Launchpad.GreenLow
    Launchpad.GreenMedium
    Launchpad.GreenFull
    Launchpad.AmberLow
    Launchpad.AmberMedium
    Launchpad.AmberFull
    Launchpad.YellowFull

**Buffers:**

The Launchpad has two buffers `0` and `1` which contain two separate LED states. For example,
in one buffer, all LEDs can be red, and in the other buffer, all LEDs can be green.

By default, buffer `0` is used for displaying and for writing. The assignment can be chosen
freely, for example:


    Buffer 0            Buffer 1

    r r r r r r r r     g g g g g g g g
    r r r r r r ...     g g g g g g ...
    ...
              ↑              ↑
              └── display    │
                  write to ──┘

By alternating the displayed buffer, buttons can be made blinking.

---

### Events

The launchpad object sends out events using the [Node.js EventEmitter](https://nodejs.org/dist/latest-v5.x/docs/api/events.html).
Subscribe with e.g.

    pad.on( 'connect', () => console.log( 'Launchpad connected!' ) ); 

#### connect

Emitted when connection to a Launchpad has been established.

#### disconnect

Emitted when the ports have been closed, usually after calling `pad.disconnect()`.

#### key

Emitted when a key is pressed or released. The callback receives an object of
the following format:

    { x: 1, y: 3, pressed: true }

Example usage:

```js
pad.on( 'key', k => {
    console.log( `Key ${k.x},${k.y} down: ${k.pressed}`);
} );
```

Actually, there are a few more properties defined on the object:

    { x: 1, y: 3, pressed: true, 0: 1, 1: 3, length: 2 }

The keys `0` and `1` allow to use the object like an array, and it can be passed
to e.g. `.col` directly. Example for highlighting the pressed button:

```js
pad.on( 'key', pair => {
    if ( pair.pressed ) {
        // Red when button is pressed
        pad.col( Launchpad.RedFull, pair );
    } else {
        // Off when button is released
        pad.col( Launchpad.Off, pair );
    }
} );
```

---

### Launchpad object

#### new Launchpad()

Constructor function.

```js
let pad = new Launchpad();
```

#### Launchpad.Buttons

Contains predefined button coordinates:

```js
Launchpad.Buttons.All  // All buttons
Launchpad.Buttons.Grid // 8x8 Grid buttons
```

---

### Methods

#### pad.connect( port )

Connects to the launchpad. The MIDI `port` can optionally be specified; if not given, the first Launchpad that is found
is taken. Returns an ES6 Promise.

```js
pad.connect().then( () => {
    // Connected; do something!
}, msg => { console.log('Could not connect: ', msg); } )
```

#### pad.disconnect()

Disconnect.

#### pad.availablePorts

A getter which returns available MIDI ports where a Launchpad is connected (other MIDI devices are not returned).
Probably useful if you have more than one Launchpad connected.

---

#### pad.reset( brightness )

Resets the pad's mapping mode, buffer settings, and duty cycle. The optional `brightness` parameter sets all LEDs 
to the defined brightness between `1` (low) and `3` (high), other values switch the LEDs off.

    pad.reset(); // Turn off all LEDs

#### pad.col( color, buttons ): Promise

Sets the color for the given buttons. The `buttons` parameter is either a value pair `[0,0]` to `[8,8]` specifying 
a single button, or an array of such pairs. Example:

    pad.col( Launchpad.GreenFull, [ [0,0], [1,1], [2,2] ] );

This function returns an ES6 promise. It is possible to send data much faster than it
can be processed by Launchpad (according to their docs it is because they use a low-speed
USB version which supports at most 400 messages per second). Then, data gets lost and
the button colours are not correct anymore. To avoid this problem, wait until the data
has been sent before sending more data.

For example, the following code will fail, and at the end the butons have random colors
instead of full green:

```js
let btns = Launchpad.Buttons.All;
for ( let i = 0; i < 10; i++ ) {
    pad.col( Launchpad.RedLow, btns );
    pad.col( Launchpad.RedFull, btns );
    pad.col( Launchpad.AmberLow, btns );
    pad.col( Launchpad.AmberFull, btns );
    pad.col( Launchpad.GreenLow, btns );
    pad.col( Launchpad.GreenFull, btns );
}
```

Instead, use promises like so:

```js
let btns = Launchpad.Buttons.All,
    loop = ( n ) => {
        pad.col( Launchpad.RedLow, btns )
            .then( () => pad.col( Launchpad.RedFull, btns ) )
            .then( () => pad.col( Launchpad.AmberLow, btns ) )
            .then( () => pad.col( Launchpad.AmberFull, btns ) )
            .then( () => pad.col( Launchpad.GreenLow, btns ) )
            .then( () => pad.col( Launchpad.GreenFull, btns ) )
            .then( () => n > 0 ? loop( n - 1 ) : null )
            .catch( ( err ) => console.error( 'Oh no: ', err ) );
    };

loop( 32 );
```

---

#### pad.flash

Setter which enables button flashing. This activates a Launchpad internal routine which
alternates the LED buffer which is displayed in an internal interval.

If a LED is red in buffer `0` and off in buffer `1`, it will flash red as expected. If it
is amber in buffer `1`, it will toggle between red and amber instead. If it is red in both
buffers, there is no visual change.

```js
pad.flash = true;
```

#### pad.displayBuffer

Getter and setter for choosing the buffer used for displaying the button colours.
Can be set to `0` or `1`. Default is `0`.

```js
pad.displayBuffer;
// -> 0
pad.displayBuffer = 1;
```

#### pad.writeBuffer

Getter and setter for the buffer where LED colours are written to.
Can be set to `0` or `1`. Default is `0`.

```js
pad.writeBuffer;
// -> 0
pad.writeBuffer = 1;
```

#### setBuffers( args )

Alternative interface for changing all buffer settings at once. The `args` parameter
looks as follows:

```js
args = {
    write: 0,               // Write buffer (0 or 1)
    display: 0,             // Display buffer (0 or 1)
    copyToDisplay: false,   // Copy write to display
    flash: false            // Enable flashing
}
```

`copyToDisplay` is useful if you want to change the display buffer while keeping the
LED colours. The contents of the given write buffer (i.e. buffer `args.write`) are then
written to the given display buffer (i.e. `args.display`).

---

#### pad.pressedButtons

A getter, which returns an array of `[x,y]` pairs of buttons which are currently pressed.

```js
pad.pressedButtons
// -> [ [0,0], [2,7] ]
```

#### pad.isPressed( button )

Checks if the given `button` is pressed.

```js
pad.isPressed( [ 0, 1 ] );
// -> true (if the top left grid button is pressed)
```

---

#### pad.brightness( brightness )

Set the button brightness. Buttons have 3 brightness levels:

* *full* — constant brightness, can be changed by switching between low and full power mode
  (hold down the four rightmost Automap buttons while plugging in the Launchpad, and press one
  of the red grid buttons to toggle)
* *low* — defined by the brightness level, defaults to 1/5
* *medium* — twice as bright as low brightness

Launchpad uses fractions for setting the brightness (see `pad.multiplexing()` if you need this
low-level access); this function is a simplified version and takes `brightness` as number
between 0 and 1.

Example for a fade effect:

```js
// First, set all LEDs to low brightness
pad.reset( 1 );

// Fade from dark to bright ...
(new Array( 100 )).fill( 0 ).forEach(
    // Set a bunch of timeouts which will change brightness
    ( empty, ix ) => setTimeout(
        () => pad.brightness( ix / 99 ), // ix ranges from 0 to 99
        ix * 20 // set new brightness every 20 ms
    )
);
```

#### pad.multiplexing( num, den )

Set the low/medium button brightness. Low brightness buttons are about `num/den` times as bright
as full brightness buttons. Medium brightness buttons are twice as bright as low brightness.

`num` must be between 1 and 16, `den` between 3 and 18.

Default is `1/5` when `num` and `den` are not given.

    pad.multiplexing( 2, 4 );

---

#### pad.fromMap( map )

Generates a coordinate array from a string map, like the template for the picture on top:

```js
pad.col( Launchpad.GreenFull, pad.fromMap(
        '-x----x-o' +
        'x-x--xxxo' +
        'x-x--xxxo' +
        '--------o' +
        '--------o' +
        '-x----x-o' +
        '--xxxx--o' +
        '--------o' +
        'oooxxooo '
    ) );
```

The string map is **9×9 characters** long without line breaks. The 9th character per row
is the scene button on the right. The last row consists of the 8 buttons on top.

(Yes; there are in fact 80 and not 81 buttons.)

All buttons with a lowercase `x` will be returned, all others
will not. The map can be shorter, e.g. `-xx` would produce `[ [1,0], [2,0] ]`.

Copy/paste template (replace the desired buttons by an `x`):

```js
pad.fromMap(
    '--------o' +
    '--------o' +
    '--------o' +
    '--------o' +
    '--------o' +
    '--------o' +
    '--------o' +
    '--------o' +
    'oooooooo '
)
```
