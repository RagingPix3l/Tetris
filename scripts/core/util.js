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