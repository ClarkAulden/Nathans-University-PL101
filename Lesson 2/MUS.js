function MUS() {
    var self = this;
    /*endtime with par in mind*/
    self.endTime = function (time, expr) {
        // your code here
        if(expr.tag === 'note')
        {return time + expr.dur;}

        if(expr.tag === 'par')
        {
            var durL, durR;
            durL = arguments.callee(time, expr.left);
            durR = arguments.callee(time, expr.right);
            return (durL > durR)? durL : durR;
        }else
        {
            return arguments.callee(time, expr.left) + arguments.callee(time, expr.right);
        }
    };

    /*par compile*/
    self.compile = function (musexpr) {
        // your code here

        var noteArr = function(musexpr, startTime){
            if(musexpr.tag === 'note')
            {
                musexpr.start = startTime; //console.log(musexpr + "note");
               return [].concat(musexpr);
            }else
            {
                if(musexpr.tag ==='par'){
                    //console.log(musexpr); console.log(" starttime: " + startTime + " par "); 
                     return [].concat(arguments.callee(musexpr.left, startTime)).concat(arguments.callee(musexpr.right, startTime));
                }else{
                    //console.log(musexpr); console.log(" starttime: " + startTime + " seq");
                    return [].concat(arguments.callee(musexpr.left, startTime)).concat(arguments.callee(musexpr.right, self.endTime(startTime, musexpr.left)));
                }
            }
        }(musexpr, 0);

        return noteArr;
    };

}

