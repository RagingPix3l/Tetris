

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

    if (me.keyboard.keys['Escape']){
        me.keyboard.keys['Escape'] = false;
        me.reset();
        return;
    }

    if (me.keyboard.keys['Space'] || me.keyboard.keys['ArrowUp']){
        me.keyboard.keys['Space'] = me.keyboard.keys['ArrowUp'] = false;
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
