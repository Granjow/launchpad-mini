export interface Button {
    x : number;
    y : number;
}

export interface Color {
    code : number;
}

export interface ButtonWithColor {
    button : Button;
    color : Color;
}

export interface LaunchpadMini {

    reset( brightness : number ) : void;

    pressedButtons() : Button[];

    isPressed( button : Button ) : boolean;

    setColor( button : Button, color : Color ) : void;

    setColors( entries : ButtonWithColor[] ) : void;

}