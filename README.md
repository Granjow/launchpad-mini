JavaScript library for interacting with the [Novation Launchpad Mini](https://global.novationmusic.com/launch/launchpad-mini).

Other node.js libraries exist, which you may want to consider as well, like:

* [launchpadder](https://www.npmjs.com/package/launchpadder)
* [midi-launchpad](https://www.npmjs.com/package/midi-launchpad)
* [phi-launchpad](https://www.npmjs.com/package/phi-launchpad)

I am writing this yet-another-lauchpad-library because:

* phi-launchpad would be nice because it has support for double-buffering, but it does not even start for me
* midi-launchpad works, but is no longer maintained
* launchpadder works as well and is simple, but does not provide double-buffering

## Usage

    const Launchpad = require( 'launchpad-mini' ),
          pad = new Launchpad();
    pad.connect(); // Auto-detect Launchpad

## Documentation

Novation provides a reference on [their download page](https://global.novationmusic.com/support/product-downloads?product=Launchpad)
(direct link: [Launchpad MK2 Programmer’s Reference Manual](https://global.novationmusic.com/sites/default/files/novation/downloads/10529/launchpad-mk2-programmers-reference-guide_0.pdf))
describing the MIDI interface of the Launchpad MK2 models. 

For the Launchpad Mini, see the Programmer’s Manual in this repository’s `doc/` subdirectory. It is also
written by Novation, but for some reason it is not available on their web site.

## API

### Events

The launchpad object sends out events using the (Node.js EventEmitter)[https://nodejs.org/dist/latest-v5.x/docs/api/events.html].
Subscribe with e.g.

    pad.on( 'connect', () => console.log( 'Launchpad connected!' ) ); 

#### `'connect': ()`

Emitted when connection to a Launchpad has been established.

#### `'disconnect': ()`

Emitted when the ports have been closed, usually after calling `pad.disconnect()`.

#### `'key': (x: Number, y: Number, pressed: Boolean)`

Emitted when a key is pressed or released. Example usage:

    pad.on( 'key', k => console.log( `Key ${k.x},${k.y} has been ${k.pressed ? 'pressed' : 'released'}`) );

### Methods

#### `pad.reset( brightness:Number )`

Resets the pad's mapping mode, buffer settings, and duty cycle. The optional `brightness` parameter sets all LEDs 
to the defined brightness between `1` (low) and `3` (high), other values switch the LEDs off.
