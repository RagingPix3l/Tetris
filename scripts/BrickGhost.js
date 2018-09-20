
function BrickGhost(p){
    var o = o || {};
    GameObject.call(this, o);
    this.alphaV = 0.95;
    this.pos = p.parent.getChildAnchorPos(p);
    this.w = p.parent.brickW;
    this.h = p.parent.brickH;
    this.color = p.color;
    this.solid = p.solid;
}

_ = chain(BrickGhost, GameObject);

_.draw = function (g,ctx) {
    var me = this;
    if (!me.solid){
        return;
    }
    ctx.save();
    ctx.globalAlpha = me.alpha;
    ctx.fillStyle = me.color;
    ctx.fillRect(me.pos.x,me.pos.y,me.w,me.h);
    ctx.restore();
};

_.update = function (g) {
    this.super.update.call(this, g);
    if (this.alpha < 0.01){
        this.parent.remove(this);
    }
};


