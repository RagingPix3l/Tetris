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
        ctx.fillStyle=me.bgColor
        ;
        ctx.fillRect(me.pos.x,me.pos.y,me.W,me.H);
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
    me.checkFullLines(rows,offscreenGrid);
};

_.checkFullLines = function (rows,offscreenGrid) {
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
    me.W = me.cols*(me.brickW+2);
    me.H = me.rows*(me.brickH+2)
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
    }, 1000/ 50);
};

_.init = function () {
    var me = this;

    me.mainGrid = me.root.add(new BrickGrid({W:W*0.5,bgColor: "#555",}));
    me.spawnNewGroup();
};

_.reset = function () {
    var me = this;
    me.root.remove(me.mainGrid);
    me.root.remove(me.group);
    me.init();
};


_.canBePlaced = function (row,col){
    const me = this;
    return me.group.canBePlaced(me.group,me.mainGrid,me.group.lastGridPos.row +row,me.group.lastGridPos.col + col);
};

_.insert = function () {
    const me = this;
    me.mainGrid.merge(me.group,me.gridOffscreen);
};

_.spawnNewGroup = function () {
    const me = this;

    me.group = me.root.add(me.mainGrid.spawnBrickGroup(me));
    const groupStartPos = me.mainGrid.calculateGroupStartingPosition(me.group,me.mainGrid);
    if (groupStartPos === false){
        console.log("cannot place group O.o");
        me.reset();
    }else{
        me.group.lastGridPos = groupStartPos;
        me.updateGroupPos();
        me.targetPosition = {
            x: me.group.pos.x,
            y: me.group.pos.y +(me.mainGrid.brickH+me.mainGrid.padding)
        };
        me.group.vel.y = (me.targetPosition.y - me.group.pos.y)/20;
    }
}
_.updateGroupPos = function (){
    const me = this;
    me.group.pos.x = me.group.lastGridPos.col*(me.mainGrid.brickW+me.mainGrid.padding);
    me.group.pos.y = me.group.lastGridPos.row*(me.mainGrid.brickH+me.mainGrid.padding);
}
_.update = function () {
    const me = this;
    me.root.update(me);

    if (me.keyboard.keys['ArrowDown']){
        me.group.vel.y = clamp(me.group.vel.y * 1.5, 0, 15);
    }

    if (me.keyboard.keys['Space']){
        me.keyboard.keys['Space'] = false;
        me.group.rotate(1);

        if (!me.canBePlaced(0,0)){
            me.group.rotate(3);
        }

    }

    if (me.group.pos.y >= me.targetPosition.y){
        me.group.pos.y = me.targetPosition.y;
        if (me.canBePlaced(1,0)){
            me.group.lastGridPos.row ++;
            me.targetPosition.y = (me.group.lastGridPos.row+(me.canBePlaced(1,0)?1:0)) * (me.mainGrid.brickH+me.mainGrid.padding);
        } else {
            me.insert();
            me.root.remove(me.group);
            me.spawnNewGroup();
        }
        //me.updateGroupPos();


    }
    if (me.group.vel.x == 0){
        if (me.keyboard.keys['ArrowLeft']){
            if (me.canBePlaced(1,-1)){
                me.targetPosition.x = (me.group.lastGridPos.col-(me.canBePlaced(1,-1)?1:0)) * (me.mainGrid.brickW+me.mainGrid.padding)
                me.group.vel.x = (me.targetPosition.x - me.group.pos.x)/10;
            }
        }else if (me.keyboard.keys['ArrowRight']) {
            if (me.canBePlaced(1, 1)) {
                me.targetPosition.x = (me.group.lastGridPos.col + (me.canBePlaced(1, 1) ? 1 : 0)) * (me.mainGrid.brickW + me.mainGrid.padding)
                me.group.vel.x = (me.targetPosition.x - me.group.pos.x) / 10;
            }
        }
    }else{
        if (me.group.vel.x < 0){
            if (me.group.pos.x <= me.targetPosition.x){
                me.group.vel.x = 0;
                me.group.lastGridPos.col --;
                me.group.pos.x = me.targetPosition.x;
            }
        }else if (me.group.vel.x > 0){
            if (me.group.pos.x >= me.targetPosition.x){
                me.group.vel.x = 0;
                me.group.lastGridPos.col ++;
                me.group.pos.x = me.targetPosition.x;
            }
        }
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

