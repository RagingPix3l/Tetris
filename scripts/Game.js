

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
    me.score = 0;
    me.scoreLbl = me.root.add(new TextLabel({pos:new V2(W*0.5+ 30, 50)}));
    me.root.add(new TextLabel({pos:new V2(W*0.5+ 30, 140), txt:"Next:"}))
    me.scoreLbl.addUpdateFn(function (g){
        this.txt = "Score: " + g.score;
    });
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
    me.spawnPreview();
    me.spawnNewGroup();

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

_.insert = function () {
    const me = this;
    var merged = me.mainGrid.merge(me.group,me.gridOffscreen);
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
        me.group.vel.y = (me.targetPosition.y - me.group.pos.y)/20;
    }
}
_.updateGroupPos = function (group){
    const me = this;
    group.pos.x = group.lastGridPos.col*(me.mainGrid.brickW+me.mainGrid.padding);
    group.pos.y = group.lastGridPos.row*(me.mainGrid.brickH+me.mainGrid.padding);
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
    me.root.update(me);

    if (me.pressed(['ArrowDown', 'KeyS'])){
        me.group.vel.y = clamp(me.group.vel.y * 1.5, 0, 15);
    }

    if (me.justPressed('Escape')){
        me.reset();
        return;
    }

    if (me.group.vel.x == 0 && me.justPressed(['Space','ArrowUp', 'KeyW'])){
        me.group.rotate(1);

        if (!me.canBePlaced(0,0)){
            me.group.rotate(3);
        }else{
            me.group.rotate(3);
            me.group.each(function (o){
                o.startFadeOut();
            });
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
    }
    if (me.group.vel.x == 0){
        if (me.pressed(['ArrowLeft', 'KeyA'])){
            if (me.canBePlaced(1,-1)){
                me.targetPosition.x = (me.group.lastGridPos.col-(me.canBePlaced(1,-1)?1:0)) * (me.mainGrid.brickW+me.mainGrid.padding)
                me.group.vel.x = (me.targetPosition.x - me.group.pos.x)/10;
            }
        }else if (me.pressed(['ArrowRight', 'KeyD'])) {
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
    if (me.shadow){
        me.root.remove(me.shadow);
    }
    var shadow = me.group.clone();
    shadow.lastGridPos = {row:me.group.lastGridPos.row, col:me.group.lastGridPos.col};

    while (me.canBePlaced(1,0,shadow)){
        shadow.lastGridPos.row++;
    }
    me.updateGroupPos(shadow);
    me.shadow = me.root.add(shadow);
    me.shadow.each(function(o){
       o.alpha = 0.15;
    });

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
