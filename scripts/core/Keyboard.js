function Keyboard () {
    this.keys = {};
    this.keyMap = [];

    this.keyMap [37] = 'ArrowLeft';
    this.keyMap [39] = 'ArrowRight';
    this.keyMap [38] = 'ArrowUp';
    this.keyMap [40] = 'ArrowDown';
    this.keyMap [80] = 'KeyP';
    this.keyMap [71] = 'KeyG';
    this.keyMap [32] = 'Space';
    this.keyMap [27] = 'Escape';
    this.keyMap [65] = 'KeyA';
    this.keyMap [87] = 'KeyW';
    this.keyMap [83] = 'KeyS';
    this.keyMap [68] = 'KeyD';

    this.init();
}

_=prot(Keyboard);

_.init = function (){
    const me = this;

    winlisten("keydown", function (e) {
        return me.keyStateChange(e, true);
    });
    winlisten("keyup", function (e) {
        return me.keyStateChange(e, false);
    });
};

_.keyStateChange = function (e, state) {
    const me = this;


    if (isundef(e.code) && (!isundef(me.keyMap[e.keyCode]))&& typeof(me.keyMap[e.keyCode]) == "string") {
        e.code = me.keyMap[e.keyCode];
    }

    if (isundef(e.code)){
        return;
    }

    me.keys[e.code] = state;

    //console.log(e.code);
    //console.log(e.keyCode);

    if (['ArrowLeft','ArrowRight','ArrowUp', 'ArrowDown', 'KeyP', 'KeyG', 'Space', 'KeyA', 'KeyW', 'KeyS', 'KeyD'].indexOf(e.code)<0){
        return;
    }
    e.preventDefault();
    e.defaultPrevented = true;
    return false;
};
