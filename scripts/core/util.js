const winlisten = window.addEventListener.bind(window);
const getById = document.getElementById.bind(document);

function prot(fn) { return fn.prototype; };

function chain(t,p) {
    t.prototype = Object.create(prot(p));
    t.prototype.constructor = t;
    t.prototype.super = prot(p);
    return prot(t);
}

function isundef(o){ return typeof(o) == "undefined";}

function wrapclamp (v,min,max){
    if (v<=min){
        v=max;
    }else if (v>=max){
        v=min;
    }
    return v;
}

function clamp (v,min,max){
    if (v<=min){
        v=min;
    }else if (v>=max){
        v=max;
    }
    return v;
}

function roundedRect(ctx,x,y,width,height,radius){
    ctx.beginPath();
    ctx.moveTo(x,y+radius);
    ctx.lineTo(x,y+height-radius);
    ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
    ctx.lineTo(x+width-radius,y+height);
    ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
    ctx.lineTo(x+width,y+radius);
    ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
    ctx.lineTo(x+radius,y);
    ctx.quadraticCurveTo(x,y,x,y+radius);
    ctx.stroke();
}

function drawSpirograph(ctx,R,r,O){
    var x1 = R-O;
    var y1 = 0;
    var i  = 1;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    do {
        if (i>20000) break;
        var x2 = (R+r)*Math.cos(i*Math.PI/72) - (r+O)*Math.cos(((R+r)/r)*(i*Math.PI/72))
        var y2 = (R+r)*Math.sin(i*Math.PI/72) - (r+O)*Math.sin(((R+r)/r)*(i*Math.PI/72))
        ctx.lineTo(x2,y2);
        x1 = x2;
        y1 = y2;
        i++;
    } while (x2 != R-O && y2 != 0 );
    ctx.stroke();
}