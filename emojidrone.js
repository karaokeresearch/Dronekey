/*
    Emojidrone
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
//edit these parameters to change behavior
var wiggle = 2; //how much does it wiggle around when you hit a key
var migrate = true; //does it stay in place mostly? If true, it might even migrate off the screen eventually!
var shrinkRandomness = 500; //adds extra randomness to shrink time to make things feel more organic.
var stereo = true; //left-right stereo. Change to false for mono output
var fx = false; //load the effects module?

//end user-settable parameters

var reducedListOfSVGs = [];
var leftTop = [];
var iconSize = [];
var sound = [];
var chord = "Am";
var tuna;
var category = {};



var embiggen = function(kNum) { //key has been pressed, make it big.
	var leftRandom;
	var topRandom;


	if (iconSize[kNum] === undefined) {
		iconSize[kNum] = 0;
	}
	leftRandom = (leftTop[kNum][0]) + (Math.random() * wiggle) - (wiggle / 2);
	topRandom = (leftTop[kNum][1]) + (Math.random() * wiggle) - (wiggle / 2);

	if (migrate) {
		leftTop[kNum][0] = leftRandom;
		leftTop[kNum][1] = topRandom;
	}

	$("#k" + kNum).stop(); //if currently animating, stop it
	$("#k" + kNum).stop(); //also again. Sometimes it gets confused
	var windowWidth = $(window).width();
	var increaseSize;
	if (iconSize[kNum] < (windowWidth / 10)) {
		increaseSize = (windowWidth / 5) - iconSize[kNum];
	} else {
		increaseSize = (windowWidth / 15);
	} //makes the initial size bigger upon keypress


	$("#k" + kNum).animate({
		left: leftRandom + "vw",
		top: topRandom + "vh",
		width: (iconSize[kNum] += increaseSize) + "px",
		opacity: 1
	}, 100); //make it big, visible
	leftRandom = (leftTop[kNum][0]) + Math.floor(Math.random() * wiggle) - (wiggle / 2);
	topRandom = (leftTop[kNum][1]) + Math.floor(Math.random() * wiggle) - (wiggle / 2);

	$("#k" + kNum).animate({
		width: "0px"
	}, {
		duration: Math.floor(Math.random() * shrinkRandomness) + 1000,
		easing: $.bez([0.430, 0.520, 0.970, 0.340]),
		step: function(now, fx) //immediately try shrinking, fading
		{
			if (fx.prop == "width") {
				iconSize[kNum] = now;
			}
		}
	});
};




var findChordNotes = function(whichChord) { //Returns an array of all the note values in the chord for two octives. A is zero
	var chordNotes = [];
	var keepgoing = true;
	var tchord;
	try {
		tchord = teoria.chord(whichChord);
	} catch (err) {
		keepgoing = false;
	}

	if (keepgoing) {

		for (var i = 0; i < tchord.notes().length; i++) {
			chordNotes.push((tchord.notes()[i].key() - 37));
		}
		for (var i = 0; i < tchord.notes().length; i++) {
			chordNotes.push(((tchord.notes()[i].key() - 25)));
		}
		//chordNotes.sort(function(a, b){return a-b});
	}
	return chordNotes;
};


var launchIntoFullscreen = function(element) {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if (element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
};




var noteValue = {
	"A": 0,
	"A#": 1,
	"Bb": 1,
	"B": 2,
	"C": 3,
	"C#": 4,
	"Db": 4,
	"D": 5,
	"D#": 6,
	"Eb": 6,
	"E": 7,
	"F": 8,
	"F#": 9,
	"Gb": 9,
	"G": 10,
	"G#": 11,
	"Ab": 11
};


var loadTheGrid = function() {
	var theGrid = "";

	var i = 0;
	for (var c = 0; c < 10; c++) {
		for (var r = 0; r < 4; r++) {
			var left = (((100 / 11) * 1) + ((100 / 11) * c));
			var top = (((100 / 5) * 1) + ((100 / 5) * r));
			leftTop[i] = [];
			leftTop[i][0] = left;
			leftTop[i][1] = top;
			//var hexval = (i + 208).toString(16);

			if (reducedListOfSVGs.length < 1) {
				generateReducedListOfSVGs(function(){//in case we ran out of emojis. Flags, for instance.
				//the below code should maybe be in a callback, but this is an edge case and it always seems to work, so...
				});
			} 
			var splicedFilename = reducedListOfSVGs.splice(reducedListOfSVGs.indexOf(reducedListOfSVGs[Math.floor(Math.random() * reducedListOfSVGs.length)]), 1); //remove and retrieve a random value from an array
			theGrid = theGrid + '<img class="arbitrary" id="k' + i + '" src="' + splicedFilename + '" style="left: ' + left.toFixed(2) + "vw" + "; top: " + top.toFixed(2) + 'vh">' + "\n";
			i++;

		}
	}



	$("#gridzone").html(theGrid); //render the emoji html	
};

var generateReducedListOfSVGs = function(callback) { //looks at category, which is already populated with SVG names, remember and collects a raw list of good emojis to use
	reducedListOfSVGs = [];

	console.log("---");
	for (var key in category) {

		if (category.hasOwnProperty(key)) {

			if (key == $("#emojitype").val() || ($("#emojitype").val() == "All emojis (except symbols)" && key != "Symbols")) {
				console.log(key);

				for (var subkey in category[key]) {
					if (category[key].hasOwnProperty(subkey)) {


						for (var emoji in category[key][subkey]) {
							if (category[key][subkey].hasOwnProperty(emoji)) {
								if (category[key][subkey][emoji].length > 0) {
									var emojiArray = category[key][subkey][emoji];
									var randomFile = emojiArray[Math.floor(Math.random() * emojiArray.length)];
									reducedListOfSVGs.push(randomFile);
									//console.log(key+ " : " + subkey + " : " + emoji + " : " + randomFile);
								}
							}
						}
					}
				}
			}
		}
	}

callback();
};

var loadInstrument = function() {
	var myAudioFiles = audioFiles.slice(); //make a local copy so we can splice out individual elements as they are used
	var chordNotes = findChordNotes(chord);
	var k = 0;
	for (var i = 0; i < 10; i++) { //bank
		var r = Math.floor(Math.random() * myAudioFiles.length); //random instrument
		var shiftUp = false; //should we use a higher octave?
		for (var j = 0; j < 4; j++) { //slot
			var offset = noteValue[myAudioFiles[r].note];
			var rate;
			if (i < -1) { //left side of the keyboard is lower octaves, generally //getting rid of it for now since it's annoying. Set 300 to 6 to put back
				rate = Math.pow(2, (1 + (((chordNotes[j] - offset) - 24) / 12))) / 2;
			} else {
				rate = Math.pow(2, (1 + (((chordNotes[j] - offset) - 12) / 12))) / 2;
			}
			//console.log(rate);
			if (rate < 0.60 || shiftUp) { //essentially making E the "open" position for this all A-sampled instrument. Funny how it worked out that way, but it's the best of both worlds
				rate = rate * 2;
				shiftUp = true;
			}
			if (sound[k]) {
				sound[k].unload();
			}

			var myVolume;
			if (!myAudioFiles[r].volume) {
				myVolume = 1;
			} else {
				myVolume = myAudioFiles[r].volume;
			}

			var howlParams;
			if (stereo) {
				howlParams = {
					src: ['samples/' + myAudioFiles[r].filename],
					stereo: -0.5 + (i * 0.1),
					volume: 0.2 * myVolume,
					rate: rate
				};
				(function(hp, kay) { //stupid closures because javascript was designed by genius morons. 

					$(document.body).queue("audioLoad", function(next) { //if we load the sounds sequentially, it uses 75% less bandwidth
						hp.onload = next;
						sound[kay] = new Howl(hp);
					});
				})(howlParams, k);


			} else {
				howlParams = {
					src: ['samples/' + myAudioFiles[i].filename],
					volume: 0.2 * myVolume,
					rate: rate
				};
				(function(hp, kay) {

					$(document.body).queue("audioLoad", function(next) {
						hp.onload = next;
						sound[kay] = new Howl(hp);
					});
				})(howlParams, k);


			}
			k++;
		}
		myAudioFiles.splice(r, 1);
	}
	$(document.body).dequeue("audioLoad");
};



function exitHandler() //what happens when you enter or exit full screen
{
	if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
		$("#mainmenu").css("visibility", "hidden");
		setTimeout(function(){$("*").css("cursor", "none");},500);		
	} else {
		$("#mainmenu").css("visibility", "visible");
		$("*").css("cursor", "default");
	}
}


var loadEmoji = function(emojiset){
	category = {};
	var maincat;
	var subcat;
	
	$.getJSON('emoji/' + emojiset + '/emoji.JSON', function(listOfSVGs) { //read and parse the emoji-test.txt file to catagorize emojis	
		$.get('emoji/emoji-test.txt', function(data) { //read and parse the emoji-test.txt file to catagorize emojis
			var arrayOfLines = data.match(/[^\r\n]+/g);
			var result;
	
			for (var i = 0; i < arrayOfLines.length; i++) {
				var line = arrayOfLines[i];
	
				if (result = line.match(/^\#/)) { //cat or subcat
					if (result = line.match(/(\w*)group\: (.*)/)) {
						var sub = result[1];
						var cat = result[2];
						if (sub != "sub") { //it's a main category:
							category[cat] = {};
							maincat = cat;
						} else { //subcat
							category[maincat][cat] = {};
							subcat = cat;
						}
					}
				}
	
				if (result = line.match(/^(.*);(.*)#(.*?)[^a-z]*(.*)/i)) { //regular line
					var sourcefile = result[1];
					var object = result[4];
					sourcefile = sourcefile.replace(/\s+$/, "");
					sourcefile = sourcefile.replace(/\s/g, "_");
					sourcefile = sourcefile.toLowerCase();
					if (emojiset == "twemoji"){sourcefile = sourcefile + ".svg";}
					if (emojiset == "noto"){sourcefile = "emoji_u" + sourcefile + ".svg";}
					if (emojiset == "noto-classic"){sourcefile = "emoji_u" + sourcefile + ".svg";}
					
	
					//object = object.replace(/[^a-z]/ig, "-");
					object = object.replace(/^man /i, "person "); //lump by action, not gender
					object = object.replace(/^woman /i, "person ");
					object = object.replace(/^men /i, "people "); //lump by action, not gender
					object = object.replace(/^women /i, "people ");
					object = object.replace(/\:.*/, ""); //all skin types together
					//console.log( maincat +"/" + subcat + "/"+ object +":" +sourcefile );
					if (maincat && subcat) {
						if (!category[maincat][subcat][object]) {
							category[maincat][subcat][object] = [];
						}
						
						if (listOfSVGs.indexOf(sourcefile) > 0) { //it's in our pre-built list of available SVG resources
							//console.log(maincat + " : " +subcat + " : " +object + " : " +sourcefile.toLowerCase())
							if (object != "watch") { //firefox hates watch emojis. And who wouldn't.
								category[maincat][subcat][object].push("emoji/" + emojiset + "/" + sourcefile);
							}
						}
						
						
					}
				}
	
			}
	
	
			generateReducedListOfSVGs(function(){loadTheGrid();});
			
	
		}); //end of get emoji-test.txt oncomplete function. Back to "ready."
	}); //end of loading the listOfSVGs array

}





$(document).ready(function() { //let's do this!
	console.log("ready!");

	//let's load some instruments!
	loadInstrument();
	loadEmoji($("#emojiset").val());

	if (fx) {
		tuna = new Tuna(Howler.ctx); //prepare reverb
		var delay = new tuna.Delay({
			feedback: 0.6, //0 to 1+
			delayTime: 300, //1 to 10000 milliseconds
			wetLevel: 0.5, //0 to 1+
			dryLevel: 1, //0 to 1+
			cutoff: 2000, //cutoff frequency of the built in lowpass-filter. 20 to 22050
			bypass: 0
		});
		Howler.addEffect(delay); //delay effects
	}



		$("#playbutton").click(function(event) {
			launchIntoFullscreen(document.documentElement); // the whole page
			$('body').css('background-color', $("#bodycolor").val());
			chord = $("#chordname").val();
			loadInstrument();
			loadEmoji($("#emojiset").val());
			

		});


	$(document).on('keydown', function(event) { //key is pressed
		if (document.activeElement.tagName == "BODY") {
			event.preventDefault();
		}
		var actualKey = (event.which);

		if (keyMap[actualKey] > -1) {
			embiggen(keyMap[actualKey]);
			sound[keyMap[actualKey]].play();
			//console.log(sound[keyMap[actualKey]]._src); //log instrument name		
		}
	});



	if (document.addEventListener) { //trigger if fullscreen happens
		document.addEventListener('webkitfullscreenchange', exitHandler, false);
		document.addEventListener('mozfullscreenchange', exitHandler, false);
		document.addEventListener('fullscreenchange', exitHandler, false);
		document.addEventListener('MSFullscreenChange', exitHandler, false);
	}




});