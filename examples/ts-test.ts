import { LaunchpadMini } from '../src';
import { Colors } from '../src/lib/colors';

const pad : LaunchpadMini;

const usePad = async () => {
    pad.connect();

    await pad.buttons( [ [ 0, 0 ], [ 1, 0 ] ] ).setColor( Colors.red );

    await pad.setAll( new Array( 8 ).fill( 0 ).map( () => new Array( 8 ).fill( Colors.green ) ) );

};