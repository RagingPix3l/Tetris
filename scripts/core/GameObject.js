function GameObject (o){
    var me = this;
    me.pos = !isundef(o.pos) ? o.pos.clone() : new V2();
    me.vel = !isundef(o.vel) ? o.vel.clone() : new V2();
    me.size = o.size || 0;
    me.angle = o.angle || 0;
    me.alpha = 1;
    me.alphaV = 1;
    me.parent = null;
}

_ = prot(GameObject);

_.update = function (g) {
    var me = this;
    me.pos.add(me.vel);
    me.pos.x = clamp(me.pos.x,0-me.size,W+me.size);
    me.pos.y = clamp(me.pos.y,0-me.size,H+me.size);
};

_.getRoot = function () {
    if (this.parent!=null){
        return this.parent.getRoot();
    }else{
        return this;
    }
};

Object.defineProperty(_, "root", {get:function(){return this.getRoot();}});
