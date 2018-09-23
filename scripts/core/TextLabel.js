function TextLabel (o){
    o = o || {};
    GameObject.call(this, o);
    this.font = o.font || "Courier New";
    this.fontSize = o.fontSize || 32;
    this.color = o.color || "#fff";
    this.txt= o.txt || "";
}

_ = chain (TextLabel, GameObject);

_.draw = function (g, ctx){
    var me = this;
    ctx.font = me.fontSize + "px " + me.font;
    ctx.fillStyle = me.color;
    ctx.fillText(me.txt, me.pos.x, me.pos.y);
};