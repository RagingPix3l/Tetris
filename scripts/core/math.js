const rnd = Math.random.bind(Math);
const cos = Math.cos.bind(Math);
const sin = Math.sin.bind(Math);
const sqrt = Math.sqrt.bind(Math);
const PI = Math.PI;

const rndColor = function (){
    var r = (rnd()*256)>>0;
    var g = (rnd()*256)>>0;
    var b = (rnd()*256)>>0;
    return "rgb(" + r + "," + g + "," + b +")";
};
