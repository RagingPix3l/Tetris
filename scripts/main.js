const W = 800;
const H = 600;

winlisten("load", function (){start();});

var clear = null;

function start(){
    var game = new Game('canvas');
    game.start();
};

