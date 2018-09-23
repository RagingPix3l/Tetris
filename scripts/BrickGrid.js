
function BrickGrid (o) {
    o = o || {};
    const me = this;
    GameObjectGrid.call(me,o);
    me.brickPattern = o.brickPattern || null;
    me.isGroup = me.brickPattern != null;
    var brickColor = o.brickColor || "#000";
    me.bgColor = o.bgColor || null;

    for (var i = 0, m=me.rows;i<m;++i){
        for (var j = 0, n = me.cols; j<n; ++j){
            var brick = me.add(new Brick({color: brickColor}));
            if (me.brickPattern){
                brick.solid = me.brickPattern[i][j] == 1;
                brick.color = brick.solid ? brickColor : "#000";
            }
        }
    }
}

_ = chain(BrickGrid, GameObjectGrid);

_.clone = function (){
    var r =  new BrickGrid();
    var me = this;
    r.cols = me.cols;
    r.rows = me.rows;
    r.isGroup = me.isGroup;
    r.bgColor = me.bgColor;
    r.W = me.W;
    r.H = me.H;
    r.brickW = me.brickW;
    r.brickH = me.brickH;

    for (var i = 0; i < me.size; ++i){
        r.list[i] = me.list[i].clone();
        r.list[i].parent = r;
    }

    return r;
};

_.draw = function (g, ctx) {
    var me = this;
    if (me.bgColor){
        ctx.fillStyle=me.bgColor;
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillRect(me.pos.x,me.pos.y,me.W,me.H);
        ctx.restore();
    }

    GameObjectGrid.prototype.draw.call(me,g,ctx);
};

_.calculatePlacement = function (group) {
    const me = this;
    var row = group.pos.y / (me.brickH+2);
    row = row >> 0;
    var col = 0;
    var x = group.pos.x;
    while (x>me.padding){
        col++;
        x -= (me.brickW+me.padding)
    }
    col = col >> 0;
    return {row:row,
        col: col};
};

_.merge = function (group,offscreenGrid) {
    const me = this;
    const pos = group.lastGridPos;
    const startRow = pos.row;
    const startCol = pos.col;
    var rows = [];
    for (var i = 0; i < group.rows; ++i){
        rows.push (startRow + i);
        for (var j = 0; j < group.cols; ++j) {
            const dstBrick = me.getAtXY(startRow+i,startCol+j);
            const srcBrick = group.getAtXY(i,j);
            if (!dstBrick.solid){
                dstBrick.color = srcBrick.color;
                dstBrick.solid = srcBrick.solid;
            }

        }
    }
    return me.checkFullLines(rows,offscreenGrid);
};

_.checkFullLines = function (rows) {
    var me = this;
    rows = rows.sort(function(a,b){
        return a - b;
    });
    var removed = 0;
    for (var i = 0; i<rows.length;++i){
        var row = rows[i];
        var isSolid = true;
        for (var j = 0; j<me.cols;++j){
            if (!me.getAtXY(row, j).solid){
                isSolid = false;
                break;
            }
        }
        if (isSolid){
            removed++;
            for (var trow = row; trow>0;--trow){
                for (var col = 0; col<me.cols;++col){
                    var oBrick = me.getAtXY(trow,col);
                    var mBrick = me.getAtXY(trow-1,col);
                    if (trow == row){
                        me.parent.add(new BrickGhost(oBrick));
                    };
                    oBrick.solid = mBrick.solid;
                    oBrick.color = mBrick.color;

                }
            }
        }
    }
    return removed;
};


_.spawnBrickGroup = function (g) {
    var me = this;
    var bricks = [
        [   "11",
            "11"
        ],
        [
            "001",
            "111"
        ],
        [
            "100",
            "111"
        ],
        [
            "1111",
        ],
        [
            "010",
            "111"
        ],
        [
            "110",
            "011"
        ],
        [
            "011",
            "110"
        ],
    ];
    var brickPattern = bricks[(bricks.length*rnd())>>0].concat([]);
    var cols = brickPattern[0].split("").length;
    var rows = brickPattern.length;
    for (var i = 0; i<brickPattern.length;++i){
        brickPattern[i] = brickPattern[i].split("");
        for (var j = 0;j<brickPattern[i].length;++j){
            brickPattern[i][j] = parseInt(brickPattern[i][j]);
        }
    }
    var pattern = {
        cols: cols,
        rows: rows,
        data: brickPattern,
    };


    var rotations = (rnd()*4)>>0;

    var blockGroupGrid = new BrickGrid({ W: pattern.cols*(me.brickW+2),
        H: pattern.rows*(me.brickH+2),
        cols: cols,
        rows: rows,
        brickColor: rndColor(),
        brickPattern : pattern.data,
    });

    blockGroupGrid.rotate(rotations);
    blockGroupGrid.vel.y = 1.5;
    blockGroupGrid.pos.x = g.mainGrid.W*0.5;

    return blockGroupGrid;
}

_.rotate = function (n) {
    if (n<=0){
        return this;
    }
    var me = this;

    var trows = me.cols;
    var tcols = me.rows;

    var tlist = [];

    var index = 0;
    var i = 0;
    var j = 0;

    var dstindexes = [];
    index = 0;

    for (i=0;i<tcols;++i){
        for(j=trows-1;j>=0;--j){
            dstindexes[i+j*tcols]=(index++);
        }
    }
    index = 0;
    for(j=0;j<trows;++j){
        for (i=0;i<tcols;++i){
            index = dstindexes[i+j*tcols];
            var brick = me.getAtIndex(index);
            brick.col = i;
            brick.row = j;
            tlist.push(brick);
            index++;
        }
    }

    me.list = tlist;
    me.cols = tcols;
    me.rows = trows;
    me.updateSize();
    return me.rotate(n-1);
}

_.updateSize = function () {
    const me = this;
    me.W = me.cols*(me.brickW+me.padding);
    me.H = me.rows*(me.brickH+me.padding);
};

_.calculateGroupStartingPosition = function (group,gridOffscreen) {
    var me = this;
    var row = 0;
    var col = (me.cols>>1) - (group.cols>>1);
    return me.canBePlaced(group,gridOffscreen,row,col) ? {row:row, col:col} : false;
};

_.canBePlaced = function (group,gridOffscreen,row,col) {
    var me = this;

    if (row>=gridOffscreen.rows || row<0){
        return false;
    }
    if (col>=gridOffscreen.cols || col<0){
        return false;
    }

    for (var i = group.rows - 1; i>=0;--i){
        for (var j = group.cols - 1; j>=0; --j){
            if (row + i>=gridOffscreen.rows || row +i <0){
                return false;
            }
            if (col+j>=gridOffscreen.cols || col+j<0){
                return false;
            }
            if (gridOffscreen.getAtXY(i+row,j + col).solid && group.getAtXY(i,j).solid){
                return false;
            }
        }
    }
    return true;
};

