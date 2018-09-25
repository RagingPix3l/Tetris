const rnd = Math.random.bind(Math);
const cos = Math.cos.bind(Math);
const sin = Math.sin.bind(Math);
const sqrt = Math.sqrt.bind(Math);
const PI = Math.PI;

function rndColorComponent (){
    var c = (rnd()*256)>>0;
    c = "" + c.toString(16);
    if (c.length<2){
        c = "0" + c;
    }
    return c;
}

const rndColor = function (){
    var r = rndColorComponent();
    var g = rndColorComponent();
    var b = rndColorComponent();
    return "#" + r + g + b;
};
