const W = 800;
const H = 600;

const LEFT = 37;
const RIGHT = 39;
const UP = 38;
const SPACE = 32;

winlisten("load", function (){start();});

var clear = null;

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
    GameObject.prototype.update.call(this,g);
    this.scalep += 0.07;
    this.scale = 0.95 + cos(this.scalep)*0.05;
}

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

function BrickGhost(p){
    var o = o || {};
    GameObject.call(this, o);
    this.alphaV = 0.95;
    this.pos = p.parent.getChildAnchorPos(p);
    this.w = p.parent.brickW;
    this.h = p.parent.brickH;
    this.color = p.color;
    this.solid = p.solid;
}

_ = chain(BrickGhost, GameObject);

_.draw = function (g,ctx) {
    var me = this;
    if (!me.solid){
        return;
    }
    ctx.save();
    ctx.globalAlpha = me.alpha;
    ctx.fillStyle = me.color;
    ctx.fillRect(me.pos.x,me.pos.y,me.w,me.h);
    ctx.restore();
};

_.update = function (g) {
    GameObject.prototype.update.call(this, g);
    if (this.alpha < 0.01){
        this.parent.remove(this);
    }
};



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

_.draw = function (g, ctx) {
    var me = this;
    if (me.bgColor){
        ctx.fillStyle=me.bgColor;
        ctx.fillRect(me.pos.x,me.pos.y,me.W,me.H);
    }

    GameObjectGrid.prototype.draw.call(me,g,ctx);
};

_.update = function (g) {
    const me = this;
    var oldPos = me.pos.clone();
    GameObjectGrid.prototype.update.call(me,g);

    if (!me.isGroup){
        return;
    }

    if (g.mainGrid.collidesAtSide(me) !== false){
        me.pos.x = oldPos.x;
    }

    me.pos.x = clamp(me.pos.x, 0, g.mainGrid.W - me.W);
    var bMerge = false;

    if (g.mainGrid.shouldMerge(me)){
        bMerge = true;
    }

    if (me.pos.y >= g.mainGrid.H  - me.H){
        bMerge = true;
    }

    if (bMerge) {
        console.log("!");
        me.vel.y = 0;
        g.mainGrid.merge(me);
        g.root.remove(me);
        g.group = g.root.add(g.mainGrid.spawnBrickGroup(g));
        g.group.pos.x = g.calculateAnchor();
    }
};

_.calculatePlacement = function (group) {
  const me = this;
  var row = group.pos.y / (me.brickH+2);
  row = row >> 0;
  var col = Math.ceil(group.pos.x / (me.brickW+2));
  col = col >> 0;
  return {row:row,
            col: col};
};

_.collidesAtSide = function (group) {
    const me = this;
    const pos = me.calculatePlacement(group);
    const startRow = pos.row;
    const startCol = pos.col;
    var colsToCheck = [0,group.cols-1];
    for (var i = 0; i < group.rows; ++i){
        for (var k = 0; k < colsToCheck.length; ++k) {
            var j = colsToCheck[k];

            if (startCol + j - 1 <= 0){
                continue;
            }
            const srcBrick = group.getAtXY(i,j);

            var dstBrick = me.getAtXY(startRow + i,startCol + j - 1);

            if (dstBrick.solid && srcBrick.solid){
                return "left";
            }

            if (startCol + j + 1 >= me.cols){
                continue;
            }
            var dstBrick = me.getAtXY(startRow + i,startCol + j + 1);

            if (dstBrick.solid && srcBrick.solid){
                return "right";
            }

        }
    }
    return false;
};

_.shouldMerge = function (group) {
    const me = this;
    const pos = me.calculatePlacement(group);
    const startRow = pos.row;
    const startCol = pos.col;
    for (var i = 0; i < group.rows; ++i){
        for (var j = 0; j < group.cols; ++j) {
            if (startRow+i+1 >= me.rows){
                continue;
            }
            if (startCol+j >= me.cols){
                continue;
            }
            const dstBrick = me.getAtXY(startRow + i + 1,startCol+j);
            const srcBrick = group.getAtXY(i,j);
            if (dstBrick.solid && srcBrick.solid){
                return true;
            }

        }
    }
    return false;
};

_.merge = function (group) {
    const me = this;
    const pos = me.calculatePlacement(group);
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
    me.checkFullLines(rows);
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
}


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
    blockGroupGrid.vel.y = 3;
    blockGroupGrid.pos.x = g.mainGrid.W*0.5;

    if (me.shouldMerge(blockGroupGrid)){
        me.isFull = true;
    };
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
    me.W = me.cols*(me.brickW+2);
    me.H = me.rows*(me.brickH+2)
};

function Game (canvasOrcanvasId) {
    var me = this;
    me.canvas = typeof(canvasOrcanvasId) == "string" ? getById(canvasOrcanvasId) : canvasOrcanvasId;
    var ctx = this.ctx = this.canvas.getContext('2d');
    clear = function () { ctx.clearRect(0,0,W,H);};
    me.root = new GameObjectList();
    me.interval = -1;
    me.paused = false;
    me.init();
    me.mouse = new Mouse();
    me.mouse.init(me.canvas);
    me.keyboard = new Keyboard();

};

_ = prot(Game);

_.start = function () {
    var me = this;
    me.interval = setInterval(function () {
        me.update();
        me.draw();
    }, 1000/50);
};

_.init = function () {
    var me = this;
    me.mainGrid = me.root.add(new BrickGrid({W:W*0.5,extraRows: 5,bgColor: "rgb(45,165,128)",}));
    me.group = me.root.add(me.mainGrid.spawnBrickGroup(me));
    me.group.pos.x = me.calculateAnchor();
};

_.reset = function () {
    var me = this;
    me.root.remove(me.mainGrid);
    me.root.remove(me.group);
    me.init();
};

_.calculateAnchor = function (){
    var me = this;
    return me.mainGrid.calculatePlacement(me.group).col*(me.mainGrid.brickW+me.mainGrid.padding);
};

_.update = function () {
    const me = this;
    me.root.update(me);

    if (me.mainGrid.isFull){
        me.reset();
    }

    const anchor = me.calculateAnchor();

    if (me.group.vel.x == 0){
        me.group.startPosX = anchor;
    }

    if (me.keyboard.keys['ArrowLeft'] || me.keyboard.keys['ArrowRight']){
        if (me.keyboard.keys['ArrowLeft']){
            me.group.vel.x = -6;
        }else{
            me.group.vel.x = 6;
        }
    }else{
        if (me.group.startPosX != anchor) {
            me.group.vel.x = 0;
            me.group.pos.x = anchor;
        }
    }
    if (me.keyboard.keys['Space']){
        me.group.rotate(1);
        me.keyboard.keys['Space'] = false;
    }

};

_.draw = function () {
    clear();
    this.root.draw(this,this.ctx);
};

_.loop = function () {
    var me = this;
    me.update();
    me.draw();
}

function start(){
    var game = new Game('canvas');
    game.start();
};

