if(typeof exports === "undefined") {
    //console.log(this);
   exports = {};
} //Naievely scrambling to make the same code usable in node and webpage;

exports.MUS = function MUS() {
    var self = this;
    /*endtime with par and rest in mind*/
    self.endTime = function (time, expr) {
        // your code here
        if(expr.tag === 'note' || expr.tag === 'rest')
        {return time + expr.dur;}

        if(expr.tag === "repeat")
        {
            return time + (expr.count * self.endTime(0,expr.section));
        }

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

    /*compile MUS expressions to NOTE with par and rest*/
    self.compile = function (musexpr) {

         var noteArr = function(musexpr, startTime){
            if(musexpr.tag === 'rest'){return []} //return nothing for rests, they only affect endtimes and starttimes

            if(musexpr.tag === 'note'){
                musexpr.start = startTime; //console.log(musexpr + "note");
               return [].concat(musexpr);
            }

            if(musexpr.tag ==='par'){
                //console.log(musexpr); console.log(" starttime: " + startTime + musexpr.tag); 
                 return [].concat(arguments.callee(musexpr.left, startTime)).concat(arguments.callee(musexpr.right, startTime));
            }

            if(musexpr.tag ==='seq'){
                //console.log(musexpr); console.log(" starttime: " + startTime + musexpr.tag);
                return [].concat(arguments.callee(musexpr.left, startTime)).concat(arguments.callee(musexpr.right,  startTime + self.endTime(0, musexpr.left)));
            }

            if(musexpr.tag ==='repeat'){
                //console.log(musexpr); console.log(" starttime: " + startTime + musexpr.tag);
                var repeated = [] ;
                for (var i = 0 ; i <  musexpr.count -1 ; i++) {
                    repeated.concat(arguments.callee(musexpr.section, startTime + (i*self.endTime(0, musexpr.section) ))) ;
                }
                
                return repeated;
            }
            
        }(musexpr, 0);

        noteArr = noteArr.map(function (note){note.pitch = self.convertSpnToMidi(note.pitch); return note;} );

        return noteArr;
    };

    self.convertSpnToMidi = function(SPN){

      var notePositionHash = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].reduce(function(hash,str){hash.count++; hash[str] = hash.count; return hash; }, {count:0}); // maybe just use indexOf?
      var lowestC_Midi = 12;

      var octaveDiff = parseInt( parseInt(SPN.split('').reverse().join('')).toString().split('').reverse().join(''));
      var notepart = SPN.substr(0, SPN.length - octaveDiff.toString().length);
      notepart = notepart.toUpperCase();
      var subToneDif = ((octaveDiff*notePositionHash.count) + (notePositionHash[notepart] - notePositionHash.C ));

      return subToneDif + lowestC_Midi;
    }

}