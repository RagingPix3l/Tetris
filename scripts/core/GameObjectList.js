function GameObjectList (o) {
    o = o || {};
    GameObject.call(this, o);
    this.list = [];
}

_ = chain(GameObjectList, GameObject);

Object.defineProperty(_, 'size', {get:function(){return this.getLength();}});

_.getLength = function () {
    return this.list.length;
};

_.each = function (fn) {
    var me=this;
    me.list.forEach(function (o){
        fn(o);
    });
};

_.update=function(g) {
    var me=this;
    this.super.update.call(me,g);
    me.each(function (o){
        o.update(g);
    });
};

_.clear = function () {
    this.list = [];
};

_.draw=function(g,ctx){
    var me = this;
    me.each(function (o){
        o.draw(g,ctx);
    });
}

_.add = function (o) {
    var me = this;
    me.list.push(o);
    o.parent = me;
    return o;
};

_.random = function () {
    return this.list[(this.size*rnd())>>0];
}

_.remove = function (o) {
    var me = this;
    for (var i = me.size - 1;i>=0;--i){
        if (me.list[i] === o){
            me.list[i] = me.list[me.list.length-1];
            me.list.length--;
            return;
        }
    }
};
