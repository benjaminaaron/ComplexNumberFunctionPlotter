
var C = function(r, i){
    this.r = r;
    this.i = i;
    this.length = Math.sqrt(Math.pow(r,2) + Math.pow(i,2));
    //this.angle = Math.atan(i / r);
};

C.prototype = {
    toString: function(){
        return '(' + roundVal(this.r,2) + ' ' + (this.i < 0 ? '-' : '+') + ' ' +
                (Math.abs(this.i) == 1 ? 'i' : roundVal(Math.abs(this.i),2) +
                'i') + ')';
    },
    add: function(C2){
        return new C(this.r + C2.r, this.i + C2.i);
    },
    sub: function (C2){
        return new C(this.r - C2.r, this.i - C2.i);
    },
    mul: function(C2){//(a + bi) (g + hi) = ag + ahi + big - bh
        var newR = this.r * C2.r - this.i * C2.i;
        var newI = this.r * C2.i + this.i * C2.r;
        return new C(newR, newI);
    },
    div: function(C2){
        var divisor = Math.pow(C2.r,2) + Math.pow(C2.i,2);
        var newR = (this.r * C2.r + this.i * C2.i) / divisor;
        var newI = (this.i * this.r - this.r * C2.i) / divisor;
        return new C(newR, newI);
    },
    pow: function(exp){
        if(exp === 0)
            return new C(1, 0);
        var temp = new C(this.r, this.i);
        for(var i = 1; i < exp; i++){
            temp = temp.mul(this);
        }
        return temp;
    }
};
