
function Mouse () {
    this.pos = new V2();
    this.isDown = false;
}

_ = prot(Mouse);

/**
 * @param e MouseEvent
 */
_.onMove = function (e) {
    this.pos.mul(0);
    this.pos.add(e.offsetX, e.offsetY);
};

/**
 * @param e MouseEvent
 */
_.onDown = function (e) {
    this.pos.mul(0);
    this.pos.add(e.offsetX, e.offsetY);
    this.isDown = true;
};

/**
 * @param e MouseEvent
 */
_.onUp = function (e) {
    this.pos.mul(0);
    this.pos.add(e.offsetX, e.offsetY);
    this.isDown = false;
};

_.init = function (canvas) {
    const me = this;
    canvas.addEventListener('mousemove', function (e) { me.onMove(e); });
    canvas.addEventListener('mousedown', function (e) { me.onDown(e); });
    canvas.addEventListener('mouseup', function (e) { me.onUp(e); });
};