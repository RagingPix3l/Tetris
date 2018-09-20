function GameObjectGrid (o) {
    o = o || {};
    var me = this;
    GameObjectList.call(me,o);
    me.W = o.W || W;
    me.H = o.H || H;
    me.rows = o.rows || 25;//17;
    me.cols = o.cols || 15;//11;
    me.padding = o.padding || 2;
    me.brickW = ((me.W - me.cols*me.padding)/(me.cols));
    me.brickH = ((me.H - me.rows*me.padding)/(me.rows));
}

_ = chain (GameObjectGrid, GameObjectList);

_.add = function (o) {
    const me = this;

    const row = (me.size/me.cols) >> 0;
    const col = me.size - me.cols*row;
    const added = this.super.add.call(me,o);

    added.row = row;
    added.col = col;

    return added;
};

_.getAnchorPos = function (col, row){
    const me = this;
    return new V2(col*(me.brickW+me.padding),row*(me.brickH+me.padding));

};

_.getChildAnchorPos = function (o){
    return this.getAnchorPos(o.col||0,o.row||0);
};

_.getAtXY = function (row,col){
    const me = this;
    row = clamp(row,0,me.rows - 1);
    col = clamp(col,0,me.cols - 1);
    return me.getAtIndex(me.cols*row + col);
};

_.getAtIndex = function (index) {
    return this.list[index];
};
