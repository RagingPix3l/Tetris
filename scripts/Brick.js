function Brick(o){
    o = o || {};
    GameObject.call(this,o);
    this.color = o.color || "#000";
    this.solid = o.solid || false;
    this.scalep = rnd()*PI*2;
    this.scale = 0.95 + cos(this.scalep)*0.05;
}

_ = chain(Brick, GameObject);

_.update = function (g){
    this.super.update.call(this,g);
    this.scalep += 0.07;
    this.scale = 0.95 + cos(this.scalep)*0.05;
};

_.draw = function (g, ctx) {
    var me = this;
    const w = me.parent.brickW;
    const h = me.parent.brickH;

    ctx.save();
    ctx.fillStyle = me.color;
    ctx.strokeStyle = me.color;
    if (me.parent.isGroup) {
        ctx.translate(me.parent.pos.x, me.parent.pos.y);
    }
    if ( !me.parent.isGroup || me.solid){
        var pos = me.parent.getChildAnchorPos(me);
        pos.add(w*0.5,h*0.5);
        ctx.translate(pos.x,pos.y);
        ctx.scale(me.scale,me.scale);
        if (!me.solid) {
            ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);
        }else{
            ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
        }
    }

    ctx.restore();
};