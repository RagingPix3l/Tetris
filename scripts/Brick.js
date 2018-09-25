function Brick(o){
    o = o || {};
    GameObject.call(this,o);
    this.color = o.color || "#000";
    this.solid = o.solid || false;
    this.scalep = rnd()*PI*2;
    this.scale = 0.95 + cos(this.scalep)*0.05;
}

_ = chain(Brick, GameObject);

_.clone = function () {
    const me = this;
    var ret = new Brick();
    ret.color = me.color;
    ret.solid = me.solid;
    ret.scalep = me.scalep;
    ret.scale = me.scale;
    ret.row = me.row;
    ret.col = me.col;
    return ret;
};

_.update = function (g){
    this.super.update.call(this,g);
    this.scalep += 0.07;
    this.scale = 0.95 + cos(this.scalep)*0.05;
    if (this.alphaV < 1){
        if (this.alpha < 0.1){
            this.alphaV = 1.1;
            var me = this;
            if (me.parent.list.indexOf(this)>=me.parent.list.length-1){
                me.parent.rotate(1);
            }
        }
    }else if (this.alpha>1.0){
        if (this.alpha>=1.0){
            this.alpha = 1;
            this.alphaV = 1;

        }
    }
};

_.draw = function (g, ctx) {
    var me = this;
    const w = me.parent.brickW;
    const h = me.parent.brickH;

    ctx.save();
    ctx.fillStyle = me.color;
    ctx.strokeStyle = me.color;

    ctx.translate(me.parent.pos.x, me.parent.pos.y);

    if ( !me.parent.isGroup || me.solid){
        var pos = me.parent.getChildAnchorPos(me);
        pos.add(w*0.5,h*0.5);
        ctx.translate(pos.x,pos.y);
        ctx.scale(me.scale,me.scale);
        ctx.globalAlpha = this.alpha;
        if (!me.solid) {
            ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);

        }else{
            ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
            ctx.globalAlpha = 0.4 * me.alpha;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 6;
            ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);
        }
    }

    ctx.restore();
};

_.startFadeOut = function () {
    this.alphaV = 0.5;
};