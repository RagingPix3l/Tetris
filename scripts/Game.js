function State () {

    const  me = this;
    GameObjectList.call(me);
    me.created = false;
}

_ = chain (State, GameObjectList);

_.create = function () {
    const  me = this;
    me.created = true;
};

_.handleInput = function (game) {

};

function MainScreenState () {
    const me = this;
    State.call(me);
};

_ = chain (MainScreenState, State);

_.create = function () {
    const me = this;
    if (me.created) { return; }
    me.bricks = JSON.parse("{\"#b1855e\":[{\"row\":3,\"col\":4},{\"row\":3,\"col\":5},{\"row\":3,\"col\":6}],\"#3e2488\":[{\"row\":3,\"col\":8},{\"row\":4,\"col\":8},{\"row\":5,\"col\":8},{\"row\":6,\"col\":8},{\"row\":7,\"col\":8}],\"#9eb2d9\":[{\"row\":3,\"col\":9},{\"row\":3,\"col\":10}],\"#18923a\":[{\"row\":3,\"col\":12},{\"row\":3,\"col\":13},{\"row\":3,\"col\":14}],\"#46e8c0\":[{\"row\":3,\"col\":16},{\"row\":4,\"col\":16},{\"row\":5,\"col\":16},{\"row\":6,\"col\":16},{\"row\":7,\"col\":16}],\"#d65bb0\":[{\"row\":3,\"col\":17},{\"row\":3,\"col\":18}],\"#2a3396\":[{\"row\":3,\"col\":20},{\"row\":4,\"col\":20},{\"row\":5,\"col\":20},{\"row\":6,\"col\":20},{\"row\":7,\"col\":20}],\"#bd1b91\":[{\"row\":3,\"col\":22},{\"row\":3,\"col\":23},{\"row\":3,\"col\":24}],\"#88e12f\":[{\"row\":4,\"col\":5},{\"row\":5,\"col\":5},{\"row\":6,\"col\":5},{\"row\":7,\"col\":5}],\"#b0c2cc\":[{\"row\":4,\"col\":13},{\"row\":5,\"col\":13},{\"row\":6,\"col\":13},{\"row\":7,\"col\":13}],\"#043656\":[{\"row\":4,\"col\":18},{\"row\":5,\"col\":18}],\"#8204a8\":[{\"row\":4,\"col\":22}],\"#d6ab46\":[{\"row\":5,\"col\":9},{\"row\":5,\"col\":10}],\"#4a3a1a\":[{\"row\":5,\"col\":22},{\"row\":5,\"col\":23},{\"row\":5,\"col\":24}],\"#366615\":[{\"row\":6,\"col\":17},{\"row\":7,\"col\":18}],\"#a38174\":[{\"row\":6,\"col\":24}],\"#4383be\":[{\"row\":7,\"col\":9},{\"row\":7,\"col\":10}],\"#285f85\":[{\"row\":7,\"col\":22},{\"row\":7,\"col\":23},{\"row\":7,\"col\":24}]}");
    State.prototype.create.call(me);
    var title = me.title = me.add(new TextLabel({txt: "click to continue"}));
    title.pos.y = H*0.6 + H*0.25;
    title.pos.x = H*0.5 - title.txt.length * 5;
    me.grid = me.add(new BrickGrid({W:W, H:H*0.5, brickColor:"#777", cols:29, rows:11}));
    me.grid.pos.y = H*0.25;

    /*me.gridColors = me.add(new BrickGrid({W:W, H:me.grid.brickH, brickColor:"#777", cols:30, rows:1}));
    me.gridColors.pos.y = H*0.6 + H*0.25;
    me.gridColors.each(function(o){
        o.color = rndColor();
        o.solid = true;
        o.alpha = 0.5;
    });

    me.color = me.gridColors.getAtXY(0,0).color;
    me.gridColors.getAtXY(0,0).alpha = 1;
    */
    var i = 0;
    me.brickParts = me.add(new GameObjectList());

    for (var color in me.bricks){
        var letterPart = me.bricks[color];
        var pattern = me.getPattern(letterPart);
        var part = me.spawnLetterPart(pattern, "#ccc");
        part.pos.x  = me.grid.pos.x + pattern.pos.x * (me.grid.brickW+me.grid.padding);
        part.pos.y  = me.grid.pos.y + pattern.pos.y * (me.grid.brickH+me.grid.padding);
        part.targetPos = part.pos.copy;


        part.pos.y -= 400;
        part.delay = i * 35;
        part.targetColor = "" + rndColor();
        part.addUpdateFn(function(g){

            if (this.done){
                return;
            }

            if (this.delay>0){
                this.delay --;
                return;
            }

            this.pos.y += (this.targetPos.y - this.pos.y) * 0.05;
            if (Math.abs(this.pos.y - this.targetPos.y) < 0.01){
                this.each(function (o){
                    o.color = o.parent.targetColor;
                });
                this.done = true;
            }

        });
        me.brickParts.add(part);
        ++i;
    }
};

_.getPattern = function (letter) {
    var minRow = letter[0].row;
    var maxRow = letter[0].row;
    var minCol = letter[0].col;
    var maxCol = letter[0].col;

    for (var i = 0; i < letter.length; ++i){
        letter [i].row = letter[i].row << 0;
        letter [i].col = letter[i].col << 0;
        if (letter[i].row>maxRow){
            maxRow = letter[i].row;
        }
        if (letter[i].row<minRow){
            minRow = letter[i].row;
        }
        if (letter[i].col>maxCol){
            maxCol = letter[i].col;
        }
        if (letter[i].col<minCol){
            minCol = letter[i].col;
        }
    }

    var cols = maxCol - minCol + 1;
    var rows = maxRow - minRow + 1;
    var pattern = [];
    for (var i = 0; i<= rows;++i){
        pattern[i] = [];
        for (var j = 0;j<=cols;++j){
            pattern [i][j] = 0;
        }
    };

    for (var i = 0; i < letter.length; ++i){
        pattern[letter[i].row - minRow][letter[i].col-minCol] = 1;
    }
    return { data: pattern, rows: rows, cols: cols, pos: new V2(minCol,minRow)};
};

_.spawnLetterPart = function (pattern, color) {
    const me = this;
    color = color || rndColor();
    var blockGroupGrid = new BrickGrid({ W: pattern.cols*(me.grid.brickW+2),
        H: pattern.rows*(me.grid.brickH+2),
        cols: pattern.cols,
        rows: pattern.rows,
        brickColor: color,
        brickPattern : pattern.data,
    });
    return me.add(blockGroupGrid);
};

_.gridContainsPoint = function (grid, v2pos) {
    if (v2pos.x >= grid.pos.x && v2pos.x <= grid.pos.x + grid.W) {
        if (v2pos.y >= grid.pos.y && v2pos.y <= grid.pos.y + grid.H) {
            return true;
        }
    }
    return false;
};

_.getRowCol = function (grid,v2pos){
    var v2 = v2pos.copy.add(grid.pos.copy.mul(-1));
    v2.x/= (grid.brickW+grid.padding);
    v2.y/= (grid.brickH+grid.padding);
    v2.x = clamp(v2.x,0,grid.cols)>>0;
    v2.y = clamp(v2.y,0,grid.rows)>>0;
    return v2;
}

_.getBricksByColor = function (grid) {
    var bricks = {};
    grid.each(function (o){
        if (o.solid){
            bricks[o.color] = bricks[o.color] || [];
            bricks[o.color].push ({row:o.row,col:o.col});
        }
    });
    return bricks;
}

_.handleInput = function (game) {
    const me = this;
    State.prototype.handleInput.call(me,game);

    if (game.mouse.isDown){
        game.mouse.isDown = false;
        var i = 0;
        me.brickParts.each(function(o){
            o.targetPos.y -= 440;
            o.delay = i * 5;
            o.done = false;
            i++;
        });
        setTimeout(function () {
            game.goToState('play');
        }, 1400);
        setTimeout(function () {
            me.grid.vel.y = -25;
            me.title.vel.y = 10;
        }, 600);
    }
    /*
    if (game.mouse.isDown){
        game.mouse.isDown = false;
        if (me.gridContainsPoint(me.grid, game.mouse.pos)){
            var v2 = me.getRowCol(me.grid, game.mouse.pos);
            var brick = me.grid.getAtXY(v2.y,v2.x);
            brick.solid = ! brick.solid;
            brick.color = brick.solid ? me.color : "#777";
        }else if (me.gridContainsPoint(me.gridColors, game.mouse.pos)){
            var v2 = me.getRowCol(me.gridColors, game.mouse.pos);
            var brick = me.gridColors.getAtXY(v2.y,v2.x);
            me.color = brick.color;
            me.gridColors.each(function (o){
                o.alpha = 0.5;
            });
            brick.alpha = 1;
        }

    }

    if (game.justPressed('KeyG')){
        var bricks = me.getBricksByColor(me.grid);
        console.log(JSON.stringify(bricks));
    }
    */

}

_.update = function (game) {
    const me = this;
    State.prototype.update.call(me, game);
    // var col = (rnd()*me.grid.cols)>>0;
    // var row = (rnd()*me.grid.rows)>>0;
    // me.grid.getAtXY(row,col).solid = !me.grid.getAtXY(row,col).solid;
    // me.grid.getAtXY(row,col).color = rndColor();
}


function Game (canvasOrcanvasId) {
    const me = this;
    me.canvas = typeof(canvasOrcanvasId) == "string" ? getById(canvasOrcanvasId) : canvasOrcanvasId;
    const ctx = me.ctx = me.canvas.getContext('2d');

    me.mouse = new Mouse();
    me.mouse.init(me.canvas);
    me.keyboard = new Keyboard();
    clear = function () { ctx.clearRect(0,0,W,H); ctx.fillStyle = "#000"; ctx.fillRect(0,0,W,H); };

    me.states = {};
    me.currentState = null;
    me.registerState ('main', new MainScreenState(), true);
    me.registerState ('play', new PlayState(), false);
};


_ = prot(Game);

_.goToState = function (stateName) {
    const me = this;
    me.currentState = me.states[stateName];
};

_.registerState = function (name, o, start) {
    const me = this;
    if (isundef(start)){
        start = false;
    }
    var state = me.states[name] = o;
    state.create();

    if (start){
        me.currentState = state;
    }
};

_.start = function () {
    const me = this;
    me.interval = setInterval(function () {
        me.loop();
    }, 1000/ 60);
};

_.pressed = function (keys) {
    if (!(keys instanceof Array)){
        keys = [keys];
    }
    for (var i = 0; i < keys.length; ++i){
        if (this.keyboard.keys[keys[i]])
            return true;
    }
    return false;
};

_.justPressed = function (keys){
    if (!(keys instanceof Array)){
        keys = [keys];
    }

    const r = this.pressed(keys);
    for (var i = 0; i < keys.length; ++i){
        this.keyboard.keys[keys[i]] = false;
    }
    return r;
};


_.draw = function () {
    clear();
    if (!this.currentState){ return; };
    this.currentState.draw(this,this.ctx);
};

_.handleInput = function () {
    if (!this.currentState){ return; };
    this.currentState.handleInput(this);
};

_.update = function () {
    if (!this.currentState){ return; };
    this.currentState.update(this);
}

_.loop = function () {
    const me = this;
    me.handleInput();
    me.update();
    me.draw();

};


function PlayState () {
    State.call(this);
    var me = this;
    me.lvl = 1;
    me.startLvl = 1;
    me.showGhost = true;
    me.linesCompleted = 0;
    me.score = 0;
    me.speedByLvl = [/*00*/	48, /*01*/	43, /*02*/	38, /*03*/33, /*04*/ 28, /*05*/	23,/*06*/ 18, /*07*/ 13, /*08*/	8, /*09*/ 6, /*10*/ 5, /*11*/ 5 , /*12*/ 5, /*13*/ 4, /*14*/ 4, /*15*/ 4, /*16*/ 4, /*17*/ 4, /*18*/ 4, /*19*/ 2, 2 ,2 ,2, 2, 2, 2 ,2, 2, 1];

    me.linesByLvl = 10;


    me.root = me;
    me.interval = -1;
    me.paused = false;
    me.init();

    me.scoreLbl = me.root.add(new TextLabel({pos:new V2(W*0.5+ 30, 50)}));
    me.scoreLbl.addUpdateFn(function (g){
        this.txt = "Score: " + me.score;
    });
    me.linesLbl = me.root.add(new TextLabel({pos:new V2(W*0.5+ 30, 250)}));
    me.linesLbl.addUpdateFn(function (g){
        this.txt = "Lines: " + me.linesCompleted + " / " + me.linesToGo();
    });

    me.lvlLbl = me.root.add(new TextLabel({pos:new V2(W*0.5+ 30, 280)}));
    me.lvlLbl.addUpdateFn(function (g){
        this.txt = "Lvl: " + me.lvl;
    });

    me.root.add(new TextLabel({pos:new V2(W*0.5+ 30, 140), txt:"Next:"}));

    me.pauseLabel=  me.root.add(new TextLabel({pos:new V2(W*0.5 - 110, 340), txt:"P A U S E D"}));
};

_ = chain(PlayState, State);

_.init = function () {
    const me = this;

    me.mainGrid = me.root.add(new BrickGrid({W:W*0.5,bgColor: "#555",}));
    me.spawnPreview();
    me.spawnNewGroup();
    me.lastMoveHorizontal = Date.now();
};

_.linesToCompleteOnStart = function (startLevel){
    return Math.min( (startLevel * 10 + 10) , Math.max(100, (startLevel * 10 - 50)));
};

_.spawnPreview = function () {
    const me = this;

    me.groupPreview = me.root.add(me.mainGrid.spawnBrickGroup(me));

    me.groupPreview.vel.y = 0;
    me.groupPreview.pos.x = W*0.5 + 140;
    me.groupPreview.pos.y = 100;

};

_.reset = function () {
    var me = this;
    me.score = 0;
    me.lvl = 1;
    me.linesCompleted = 0;
    me.root.remove(me.mainGrid);
    me.root.remove(me.group);
    me.root.remove(me.groupPreview);
    me.init();
};


_.canBePlaced = function (row,col,group){
    const me = this;
    var groupToCheck = group || me.group;
    return me.group.canBePlaced(groupToCheck,me.mainGrid,groupToCheck.lastGridPos.row +row,groupToCheck.lastGridPos.col + col);
};

_.linesToGo = function (){
    const me = this;
    return me.lvl == me.startLvl ? me.linesToCompleteOnStart(me.startLvl) : 10;
};

_.insert = function () {
    const me = this;
    var merged = me.mainGrid.merge(me.group,me.gridOffscreen);
    me.linesCompleted+=merged;
    if (me.linesCompleted>= me.linesToGo()){
        me.lvl++;
        me.linesCompleted = 0;
    }
    delete me.lastAccelerated;
    me.score += merged * 25 + 1;
};

_.spawnNewGroup = function () {
    const me = this;
    me.root.remove(me.groupPreview);
    me.group = me.root.add(me.groupPreview);
    me.spawnPreview();
    const groupStartPos = me.mainGrid.calculateGroupStartingPosition(me.group,me.mainGrid);
    if (groupStartPos === false){
        console.log("cannot place group O.o");
        me.reset();
    }else{
        me.group.lastGridPos = groupStartPos;
        me.updateGroupPos(me.group);

        me.targetPosition = {
            x: me.group.pos.x,
            y: me.group.pos.y +(me.mainGrid.brickH+me.mainGrid.padding)
        };
        me.group.vel.y = me.calculateSpeed();
    }
}

_.calculateSpeed = function () {
    const me = this;
    const frames = me.speedByLvl[me.lvl - 1];
    return (me.group.brickH/(frames));
}

_.updateGroupPos = function (group,row,col){
    const me = this;
    if (isundef(row)){ row = true; }
    if (isundef(col)){ col = true; }
    if (col) {
        group.pos.x = group.lastGridPos.col*(me.mainGrid.brickW+me.mainGrid.padding);
    }
    if (row){
        group.pos.y = group.lastGridPos.row*(me.mainGrid.brickH+me.mainGrid.padding);
    }
};



_.update = function (game) {
    const me = this;
    me.time = Date.now();

    if (game.justPressed('KeyP')){
        me.paused = !me.paused;
        return;
    }

    me.pauseLabel.visible = me.paused;

    if (me.paused){
        return;
    }

    State.prototype.update.call(this,game);

    if (game.pressed(['ArrowDown', 'KeyS'])&&(isundef(me.lastAccelerated) || me.lastAccelerated == me.group)){
        me.lastAccelerated = me.group;
        me.group.vel.y = (me.group.brickH + me.group.padding)/2;
    }else{
        me.group.vel.y = me.calculateSpeed();
    }

    if (game.justPressed('Escape')){
        me.reset();
        return;
    }




    if (me.group.vel.x == 0 && game.justPressed(['ArrowUp', 'KeyW'])){
        me.group.rotate(1);

        if (!me.canBePlaced(0,0)){
            me.group.rotate(3);
        }
    }

    if (me.group.vel.x == 0 && game.justPressed('Space')) {
        while (me.canBePlaced(1,0)){
            me.group.lastGridPos.row++;
        }
        me.updateGroupPos(me.group);
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
    }
    if (me.time - me.lastMoveHorizontal  > 90) {
        if (game.pressed(['ArrowLeft', 'KeyA'])) {
            if (me.canBePlaced(1, -1)) {
                me.group.lastGridPos.col--;
                me.updateGroupPos(me.group, false, true);
                me.lastMoveHorizontal = me.time;
            }
        } else if (game.pressed(['ArrowRight', 'KeyD'])) {
            if (me.canBePlaced(1, 1)) {
                me.group.lastGridPos.col++;
                me.updateGroupPos(me.group, false, true);
                me.lastMoveHorizontal = me.time;
            }
        }
    }


    if (me.shadow){
        me.root.remove(me.shadow);
    }

    if (game.justPressed('KeyG')){
        me.showGhost = !me.showGhost;
    }

    if (me.showGhost) {
        var shadow = me.group.clone();
        shadow.lastGridPos = {row: me.group.lastGridPos.row, col: me.group.lastGridPos.col};
        if (me.group.vel.x < 0) {
            shadow.lastGridPos.col--;
        } else if (me.group.vel.x > 0) {
            shadow.lastGridPos.col++;
        }
        while (me.canBePlaced(1, 0, shadow)) {
            shadow.lastGridPos.row++;
        }
        me.updateGroupPos(shadow);
        me.shadow = me.root.add(shadow);
        me.shadow.each(function (o) {
            o.alpha = 0.05;
        });
    }

};

