function Keyboard () {
    this.keys = {};
    this.init();
}

_=prot(Keyboard);

_.init = function (){
    const me = this;
    winlisten("keydown", function (e) {
        me.keyStateChange(e, true);
    });
    winlisten("keyup", function (e) {
        me.keyStateChange(e, false);
    });
};

_.keyStateChange = function (e, state) {
    const me = this;
    me.keys[e.code] = state;
    //console.log(e.code);
    if (['ArrowLeft','ArrowRight','ArrowUp', 'ArrowDown', 'KeyP', 'KeyG', 'Space'].indexOf(e.code)<0){
        return;
    }
    e.preventDefault();
    e.defaultPrevented = true;
};
