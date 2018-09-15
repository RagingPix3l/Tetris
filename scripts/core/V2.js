function V2 (x,y){
    this.x = typeof(x)!="undefined"? x : 0;
    this.y = typeof(y)!="undefined"? y : 0;
}

var _ = null;

_ = prot(V2);

Object.defineProperty(_, "copy", {get : function(){return this.clone();}});

_.fromAngle = function (a,r) {
    this.x = cos(a)*r;
    this.y = sin(a)*r;
    return this;
};

_.angle  = function () {
    var me = this;
    return Math.atan2(me.y, me.x);
};

_.angleTo  = function (o) {
    var me = this;
    return me.clone().add(o.clone().mul(-1)).angle();
};

_.copyFrom = function (o) {
    var me = this;
    me.x = o.x;
    me.y = o.y;
    return me;
};

_.clone = function (){
    return (new V2(this.x,this.y));
};

_.mul = function (v){
    var me = this;
    me.x*=v;
    me.y*=v;
    return me;
};

_.distSquare = function (o){
    o = o || new V2();
    var dx = this.x - o.x;
    var dy = this.y - o.y;
    return (dx*dx + dy*dy);
};

_.dist = function (o){
    return sqrt(this.distSquare(o));
};

_.add = function (x,y){
    var me = this;
    if (x instanceof V2){
        me.x+=x.x;
        me.y+=x.y;
    }else{
        me.x+=x;
        me.y+=y;
    }
    return me;
};