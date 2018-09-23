

function Game (canvasOrcanvasId) {
    var me = this;
    me.lvl = 1;
    me.linesCompleted = 0;
    me.speedByLvl = [/*00*/	48, /*01*/	43, /*02*/	38, /*03*/33, /*04*/ 28, /*05*/	23,/*06*/ 18, /*07*/ 13, /*08*/	8, /*09*/ 6, /*10*/ 5, /*11*/ 5 , /*12*/ 5, /*13*/ 4, /*14*/ 4, /*15*/ 4, /*16*/ 4, /*17*/ 4, /*18*/ 4, /*19*/ 2, 2 ,2 ,2, 2, 2, 2 ,2, 2, 1];

    me.linesByLvl = 10;

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
    me.score = 0;
    me.scoreLbl = me.root.add(new TextLabel({pos:new V2(W*0.5+ 30, 50)}));
    me.scoreLbl.addUpdateFn(function (g){
        this.txt = "Score: " + g.score;
    });
    me.linesLbl = me.root.add(new TextLabel({pos:new V2(W*0.5+ 30, 250)}));
    me.linesLbl.addUpdateFn(function (g){
        this.txt = "Lines: " + g.linesCompleted + " / " + me.linesToGo();
    });

    me.lvlLbl = me.root.add(new TextLabel({pos:new V2(W*0.5+ 30, 280)}));
    me.lvlLbl.addUpdateFn(function (g){
        this.txt = "Lvl: " + g.lvl;
    });

    me.root.add(new TextLabel({pos:new V2(W*0.5+ 30, 140), txt:"Next:"}))
    me.showGhost = true;
    me.startLvl = 1;

};

_ = prot(Game);


_.start = function () {
    var me = this;
    me.interval = setInterval(function () {
        me.update();
        me.draw();
    }, 1000/ 60);
};

_.init = function () {
    var me = this;

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

    var r = this.pressed(keys);
    for (var i = 0; i < keys.length; ++i){
        this.keyboard.keys[keys[i]] = false;
    }
    return r;
};

_.update = function () {
    const me = this;
    me.time = Date.now();

    if (me.justPressed('KeyP')){
        me.paused = !me.paused;
        return;
    }
    
    if (me.paused){
        return;
    }
    me.root.update(me);

    if (me.pressed(['ArrowDown', 'KeyS'])&&(isundef(me.lastAccelerated) || me.lastAccelerated == me.group)){
        me.lastAccelerated = me.group;
        me.group.vel.y = (me.group.brickH + me.group.padding)/2;
    }else{
        me.group.vel.y = me.calculateSpeed();
    }

    if (me.justPressed('Escape')){
        me.reset();
        return;
    }




    if (me.group.vel.x == 0 && me.justPressed(['ArrowUp', 'KeyW'])){
        me.group.rotate(1);

        if (!me.canBePlaced(0,0)){
            me.group.rotate(3);
        }else{

        }
    }

    if (me.group.vel.x == 0 && me.justPressed('Space')) {
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
        if (me.pressed(['ArrowLeft', 'KeyA'])) {
            if (me.canBePlaced(1, -1)) {
                me.group.lastGridPos.col--;
                me.updateGroupPos(me.group, false, true);
                me.lastMoveHorizontal = me.time;
            }
        } else if (me.pressed(['ArrowRight', 'KeyD'])) {
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

    if (me.justPressed('KeyG')){
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
            o.alpha = 0.15;
        });
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
