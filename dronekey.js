/*
    DroneKey
    Copyright (C) 2017  Ross Brackett

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


var chord="C";
var iconSize=[];
var chordNotes=[];
var sound=[];
var bgColor = "pink";
var easingType="easeInCirc";
var leftTop=[];
var wiggle=2;
var endOpacity=1;
var shrinkRandomness=500;
var migrate=true;
var stereo=true;

var embiggen=function(kNum){//key has been pressed, make it big.

      if (iconSize[kNum] === undefined) {iconSize[kNum]=0;}
    	leftRandom = (leftTop[kNum][0]) +(Math.random() *wiggle)-(wiggle/2);
    	topRandom  = (leftTop[kNum][1]) +(Math.random() *wiggle)-(wiggle/2);
      
      if (migrate){
      	leftTop[kNum][0] = leftRandom;
      	leftTop[kNum][1] = topRandom;
      }
      
			$("#k"+kNum).stop();//if currently animating, stop it
   	 	$("#k"+kNum).stop();//also again. Sometimes it gets confused
   	 	var windowWidth = $( window ).width();
   	 	if (iconSize[kNum]< (windowWidth/40)){var increaseSize=(windowWidth/20)}else{increaseSize=(windowWidth/40)} //makes the initial size bigger upon keypress

   	 	
    	$("#k"+kNum).animate({left: leftRandom + "vw", top: topRandom + "vh", width: (iconSize[kNum] +=increaseSize) + "px", opacity:1},100);//make it big, visible
    	leftRandom = (leftTop[kNum][0]) + Math.floor(Math.random()*wiggle)-(wiggle/2);
    	topRandom = (leftTop[kNum][1]) + Math.floor(Math.random()*wiggle)-(wiggle/2);
    
    	$("#k"+kNum).animate({width: "0px", opacity:endOpacity},{duration:Math.floor(Math.random()*shrinkRandomness)+1000, easing: $.bez([0.430, 0.520, 0.970, 0.340]), step: function(now,fx) //immediately try shrinking, fading
    																																	{ 
    																																	if (fx.prop=="width")
    																																		{iconSize[kNum]=now;    																																
    																																	}
    																																		}});	
}		




var findChordNotes = function (whichChord){ //Returns an array of all the note values in the chord for two octives. A is zero
	var chordNotes=[];
	var keepgoing=true;
	try{
		var chord=teoria.chord(whichChord);
	}
	catch(err){keepgoing=false;}
	
	if(keepgoing){
		
		for (i=0; i< chord.notes().length; i++) {
			chordNotes.push((chord.notes()[i].key()-37));
		}
		for (i=0; i< chord.notes().length; i++) {
			chordNotes.push(((chord.notes()[i].key()-25)));
		}
	//chordNotes.sort(function(a, b){return a-b});
	}
	return chordNotes;
};


var launchIntoFullscreen = function(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
};


var noteValue={
	"A"  :0,
	"A#" :1,
	"Bb" :1,
	"B"  :2,
	"C"  :3,
	"C#" :4,
	"Db" :4,
	"D"  :5,
	"D#" :6,
	"Eb" :6,	
	"E"  :7,
	"F"  :8,
	"F#" :9,
	"Gb" :9,
	"G"  :10,
	"G#" :11,
	"Ab" :11	
};



	$( document ).ready(function() { //let's do this!
    console.log( "ready!" );
	
	for (i=0;i<10;i++){ //load all the samples
		  if(stereo){
			  sound[i] = new Howl({
		      src: ['samples/'+ audioFiles[i].filename],
		      stereo: -0.5+(i*0.1),
		      volume:0.6
		    });
			}else{
		
			 sound[i] = new Howl({
	      src: ['samples/'+ audioFiles[i].filename],
	      volume:0.6
	    });
	  }
	  }
	
	tuna = new Tuna(Howler.ctx) //prepare reverb
	var delay = new tuna.Delay({
	    feedback: 0.6,    //0 to 1+
	    delayTime: 130,    //1 to 10000 milliseconds
	    wetLevel: 0.5,    //0 to 1+
	    dryLevel: 1,       //0 to 1+
	    cutoff: 2000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
	    bypass: 0
	});
	//Howler.addEffect(delay) //uncomment this for delay effects
    
    chordNotes=findChordNotes(chord);
	
	
    var theGrid='<div style="height: 100vh; background-color:' + bgColor +  ' ;">'; //load up the grid of random emojis
    var i=0;
    for (c=0; c<10; c++){
    	for (r=0; r<4; r++){
    		var left =  ( ((100/11)*1) + ((100/11)*c));
    		var top = ( ((100/5)*1) + ((100/5)*r) );
    		leftTop[i]=[];
    		leftTop[i][0] = left;
    		leftTop[i][1] = top;
    		var hexval = (i+208).toString(16);
        theGrid = theGrid + '<img class="arbitrary" id="k' + i +'" src="emoji/noto/'+ listOfSVGs[Math.floor(Math.random()*listOfSVGs.length)]+ '" style="left: ' +   left.toFixed(2)     + "vw"  + "; top: " + top.toFixed(2) +'vh">' + "\n";
       i++;
       }
    }
     theGrid = theGrid +'</div>';
     $(document.body).html(theGrid); //render the emoji html
    
  	$(document).on('keydown', function(event) {//key is pressed
     actualKey = (event.which);
    
     if (keyMap[actualKey]>-1){

			launchIntoFullscreen(document.documentElement); // the whole page
			embiggen(keyMap[actualKey]);
			
			var bank = Math.floor((keyMap[actualKey])/4);
			var slot = ((keyMap[actualKey])%4);
			
			var offset = noteValue[audioFiles[bank].note];
			var rate;
			if (bank<6){ //left side of the keyboard is lower octaves, generally
				rate =     Math.pow(2,(1+(((chordNotes[slot]-offset)-12)/12)))/2;
			}else{rate = Math.pow(2,(1+(((chordNotes[slot]-offset)+12)/12)))/2;}
			
			sound[bank].rate(rate);
			sound[bank].play();
			
		}
	});
	  
 
});