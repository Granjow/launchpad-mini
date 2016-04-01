JavaScript library for interacting with the Novation Launchpad MINI.

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

For the Launchpad MINI, see the Programmer’s Manual in this repository’s `doc/` subdirectory. It is also
written by Novation, but for some reason it is not available on their web site.

