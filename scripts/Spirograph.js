function Spirograph(o,i){
    o = o || {
        angleV : 0.1,
    };
    GameObject.call(this,o);
    this.color = o.color || rndColor();
    this.pos.x = rnd()*W*0.5;
    this.pos.y = (H/10)*i;
    this.vel.x = - rnd()*1 - 0.3;
    this.r = 5;
    this.R = 10 + (5*rnd())>>0;
    this.O = 2;
    this.angleV = 0.1
}

_ = chain(Spirograph, GameObject);

_.update = function (g){
    GameObject.prototype.update.call(this,g);
    var me = this;
    if (me.pos.x <= 0 || me.pos.x >= W*0.5) {
        me.vel.x *= -1;
    }
};

_.draw = function (g, ctx) {
    var me = this;
    ctx.save();
    ctx.strokeStyle = me.color;
    ctx.translate(me.pos.x, me.pos.y);
    ctx.rotate(me.angle);
    ctx.globalAlpha = 0.2;
    drawSpirograph(ctx, me.R , me.r, me.O);
    ctx.restore();
};

