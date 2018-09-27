function TextLabel (o){
    o = o || {};
    GameObject.call(this, o);
    this.font = o.font || "Courier New";
    this.fontSize = o.fontSize || 32;
    this.color = o.color || "#fff";
    this.txt= o.txt || "";
    this.visible = true;
    this.padding = 5;
}

_ = chain (TextLabel, GameObject);

Object.defineProperty(_, "txt", {set : function(v){this._txt = v; this.dimensions = measureText(this);}, get: function (){ return this._txt;}});

_.draw = function (g, ctx){
    var me = this;
    if (me.visible == false){
        return;
    }
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    roundedRect(ctx,me.pos.x - me.padding,me.pos.y - me.fontSize + me.fontSize*0.15 - me.padding,me.dimensions.x + me.padding*2,me.dimensions.y+me.padding*2,10);
    ctx.fillStyle = "#999";
    ctx.fill();
    ctx.font = me.fontSize + "px " + me.font;
    ctx.fillStyle = me.color;

    ctx.fillText(me.txt, me.pos.x, me.pos.y);

};