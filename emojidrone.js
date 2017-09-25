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
var instruments = [];
//var chord = teoria.chord("Am");
var scale; //teoria scale object
var chords = []; 
var tuna;
var category = {};
var currentChord; //teoria chord object
var advanced = false;
var scalesMode = false;
var functionToggle = false;
var functionToggleKey = 192 //grave accent/tilde
var defaultOctave = 6; //higher value makes for lower pitchq

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


var findChordsInScale = function(scale) {
	/* takes teoria scale object and returns array of 
		teoria chord objects diatonic to the scale
	*/
	var roots = scale.notes(); //notes of the scale serve as roots of the chords

	for (i = 0; i < roots.length; i++) {//normalize everything to sharp or natural accidentals
		roots[i] = normalizeNote(roots[i], "#");
	}

	var major = (scale.name == "major"); //are we in a major scale? if not, assume natural minor
	return [
		teoria.chord(roots[0], major ? "maj7" : "m7") 
		,teoria.chord(roots[1], major ? "m7" : "m7b5") 
		,teoria.chord(roots[2], major ? "m7" : "maj7") 
		,teoria.chord(roots[3], major ? "maj7" : "m7") 
		,teoria.chord(roots[4], major ? "7" : "m7") 
		,teoria.chord(roots[5], major ? "m7" : "maj7") 
		,teoria.chord(roots[6], major ? "m7b5" : "7")		
	];
}
function setScaleFromChord(chord) {
	
	var tonic = chord.notes()[0];	
	tonic = normalizeNote(tonic, "#");

	var name;
	if (chord.quality() === "major" || chord.quality() === "minor") {
		name = chord.quality();
	}
	else {
		name = "major";
	}
	scale = teoria.scale(tonic, name);
	//console.log(scale.tonic.name());
	chords = findChordsInScale(scale);
	currentChord = chords[0];
	//console.log(currentChord.name);
	setScaleLabel(scale);
	
}
function setScaleLabel(scale) {
	$("#scale").text("Scale:" + scale.tonic.name().toUpperCase() + scale.tonic.accidental() + " " + scale.name);
}

var isFullScreen = function() {
	return (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);
}
var fullscreen = function(element) {
	if (isFullScreen()) {
		if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        dialogBox();
	}
	else {
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
		dialogBox("visible");
	}
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

var loadInstruments = function() {
	currentChord = teoria.chord($("#chordname").val());
	var myAudioFiles = audioFiles.slice(); //make a local copy so we can splice out individual elements as they are used
	console.log("loading instruments..");

	//clear any existing instruments
	instruments.length = 0;

	var instrument;
	for (i = 0; i < 10; i++) {
		instruments.push({});
		//load random instrument file
		instrument = myAudioFiles.splice(Math.floor(Math.random() * myAudioFiles.length), 1)[0];		
		var howlParams;
		
		for (n = 0; n < 12; n++) {
			var key = noteMap[n]; //get string representation of note
			var note = instruments[i][key] = {
											  tNote: teoria.note(key),
											  baseNote: teoria.note(instrument.note)
											};
			
			howlParams = {
				src: ['samples/' + instrument.filename+".ogg", 'samples/' + instrument.filename+".wav"],
				stereo: (stereo ? -0.5 + (i * 0.1) : 0),
				volume: (instrument.volume ? 0.2 * instrument.volume : 0.2),
				rate: getRateFactor(note.baseNote, note.tNote, note.octave)				
			};
			note.fq = howlParams.rate * note.baseNote.fq();
			note.baseRate = howlParams.rate;

			(function(hp, n) { //stupid closures because javascript was designed by genius morons. 
				

				$(document.body).queue("audioLoad", function(next) { //if we load the sounds sequentially, it uses 75% less bandwidth
					hp.onload = next;
					n.sound = new Howl(hp);								
				});
			})(howlParams, note);

			$(document.body).dequeue("audioLoad");	
		}
		
	}
}

function octaveShift(shift) {
	//expects integer, adds that many octaves (can be negative)
	var factor = shift > 0 ? shift : -1/shift;
	for (i = 0; i < instruments.length; i++) {

		for (element in instruments[i]) {
			instruments[i][element].baseRate *= factor;
			instruments[i][element].fq *= factor;
			instruments[i][element].sound.rate(instruments[i][element].sound.rate() * factor);
		};
	}
}
function intervalShift(interval) {
	//expects teoria interval object
	if (!scalesMode) {
		//normalize new currentChord  so that frequent shiftng doesnt send the accidental all over the place.
		currentChord = normalizeChord(currentChord.transpose(interval), "#");
		$("#chordname").val(currentChord.name);
	}
	else {
		currentChord = normalizeChord(chords[0].transpose(interval), "#");
		setScaleFromChord(currentChord);
		$("#chordname").val(currentChord.name);
	}
}

function normalizeNote(note, accidental) {
	//takes teoria note object and string for desired accidental and normalizes note to desired accidentals (Db -> C# e.g.)
	//or natural if possible.(B#->C natural e.g.). returns normalized note object
	//console.log(note.name());
	if (note.accidental() == "") { return note; } //first, return natural notes unaltered

	var enharmonics = note.enharmonics(); //we will need to look through these in all other cases
	
	if (note.accidental() == accidental) { //check if it already has desired accidental...
		//if there is a natural enharmonic equivalent, return that...
		for (e = 0; e < enharmonics.length; e++) {
			if (enharmonics[e].accidental() == "") {
				return enharmonics[e];
			}
		}
		//...otherwise return the note as is
		return note;
	}
	//...otherwise find the note's enharmonic equivalent with a natural or desired accidental
	var accidentalIndex = -1; //save the index of an enharmonic with desired accidental in case 
								//there is no natural enharmonic
	for (e = 0; e < enharmonics.length; e++) {
			if (enharmonics[e].accidental() == "") { //if we find natural enharmonic, immediately return it...
				return enharmonics[e];
			}
			else if (enharmonics[e].accidental() == accidental) {//...else keep track of enharmonics with desired accidental
				accidentalIndex = e;
			}
		}
		//once it is determined that there are no natural enharmonics, return the one with desired accidental, if it exists...
		if (accidentalIndex > -1) { 
			return enharmonics[accidentalIndex]; 
		}
		else { //...else throw error - there should always be an enharmonic with desired accidental
			throw new Error("no enharmonic natural or desired accidental");
		}
}
function normalizeChord(chord, accidental) {
//same as normalizeNote but for chords
	var rt = chord.root.name() + chord.root.accidental();
	var symbol = chord.name.substr(rt.length);
	
	return teoria.chord(normalizeNote(chord.root, accidental), symbol);
}

var getRateFactor = function(base, desired, offset=4) {
	/*take 2 teoria notes and an offset factor, return number to 
	multiply base note frequency(times offset factor) by to reach desired note frequency
	*/
	return desired.fq() / (base.fq() * offset);
}

var playInstrument = function(inst, rate=1) {
	//expects keymap object with instrument and note indices
	var cinst = inst.instrument;
	var cnote = inst.note;
	//first check if the current chord doesn't have the note - trying to play the 4th note of a triad i.e.
	if (cnote >= currentChord.notes().length) {
		console.log("shifting up");
		cnote = 0; //replace note with root note
		rate = 2; //and play an octave higher
	}

	//our loaded instruments use # accidentals exclsively - make sure the notes we are playing do the same
	var note = normalizeNote(currentChord.notes()[cnote], "#");
	
	var noteName = note.name() + note.accidental();//string of note name
	var rt = normalizeNote(currentChord.root, "#");
	var rootName = rt.name() + rt.accidental();

	var i = instruments[cinst];
	console.log("note:" + noteName);

	//check if note is of a lower frequency than the root note
	if (i[noteName].fq < i[rootName].fq) {
		rate = 2; //play an octave higher if so
	}
	s = i[noteName].sound;
	//make sure rate is returned to normal value after note is played
	s.onend = function(rate, rateval) {
		rate = rateval;
		}(s.rate, i[noteName].baseRate);

	s.rate(i[noteName].baseRate * rate);
	
	s.play();
}

function dialogBox(visibility) {
	//if passed explicit visibility, go with that
	if (visibility) {
		$("#mainmenu").css("visibility", visibility);
		$("#advanced-instructions").css("visibility", advanced ? visibility : "hidden");
		$("#scale").css("visibility", visibility);
		return;
	}
	//otherwise toggle it.

	//check if dialog box is already visible, hide everything if so
	if ($("#mainmenu").css("visibility") == "visible") {
		$("#mainmenu").css("visibility", "hidden");
		$("#advanced-instructions").css("visibility", "hidden");
		$("#scale").css("visibility", "hidden");
		//setTimeout(function(){$("*").css("cursor", "none");},500);
	}
	//otherwise make everything visible
	else {
		$("#thetitle").html("Emojidrone");
		$("#mainmenu").css("visibility", "visible");
		if (advanced) {
			$("#advanced-instructions").css("visibility", "visible");			
			$("#scale").css("visibility", "visible");
		}
		else {
			$("#advanced-instructions").css("visibility", "hidden");
			$("#scale").css("visibility", "hidden");
		}
		//$("*").css("cursor", "default");
	}

}

function exitHandler() //what happens when you enter or exit full screen
{
	dialogBox();
	/*if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
		$("#mainmenu").css("visibility", "hidden");
		$("#advanced-instructions").css("visibility", "hidden");		
		$("#scale").css("visibility", "hidden");
		setTimeout(function(){$("*").css("cursor", "none");},500);		
	} else {
		$("#thetitle").html("Emojidrone");
		$("#mainmenu").css("visibility", "visible");
		if (advanced) {
			$("#advanced-instructions").css("visibility", "visible");			
			$("#scale").css("visibility", "visible");
		}
		else {
			$("#advanced-instructions").css("visibility", "hidden");
			$("#scale").css("visibility", "hidden");
		}
		$("*").css("cursor", "default");
		
	}*/
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
					
					if (emojiset == "twemoji"){
						sourcefile = sourcefile.toLowerCase();
						sourcefile = sourcefile + ".svg";}
					if (emojiset == "noto"){
						sourcefile = sourcefile.toLowerCase();
						sourcefile = "emoji_u" + sourcefile + ".svg";}
					if (emojiset == "noto-classic"){
						sourcefile = sourcefile.toLowerCase();
						sourcefile = "emoji_u" + sourcefile + ".svg";}
					if (emojiset == "fxemoji"){
						sourcefile = sourcefile.toUpperCase(); 
						sourcefile = "u" + sourcefile + ".svg";
						}
					
	
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


var titleMaker = function() { //Makes an emoji title from the official names. Apologies for the variable names. Was done in a hurry.

		var a =Math.floor(Math.random() * Object.keys(category).length);
		var cat = Object.keys(category)[a];
		var subcat = category[cat];
		
		var b = Math.floor(Math.random() * Object.keys(subcat).length);
		var objs = Object.keys(subcat)[b];
		var subsubcat = category[cat][objs];
		
		var c = Math.floor(Math.random() * Object.keys(subsubcat).length);
		var emojiname = Object.keys(subsubcat)[c];
		var thefile = category[cat][objs][emojiname];
	
	return(emojiname);
};

var toTitleCase = function(str){
    return str.replace(/[^\W_]+[^\s-]+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function reload() {
	Howler.unload();
	loadInstruments();
	loadEmoji($("#emojiset").val());
}

var doneLoading = function(badStatus) { //takes an array of strings to check load state against.
	//only resolves once none of the instruments have any state given in badStatus array
	return new Promise(function(resolve, reject) {

		var ms = 100;
		var timeElapsed = 0;	
		var maxTime = 5000;
		var check = setInterval(function() {
			var stillLoading = instruments.some(function(instrument) {
				
				var notes = Object.keys(instrument);
				return notes.some(function(note) {
					if (badStatus.includes(instrument[note].sound.state())) {
						console.log("still loading");			
						return true;
					}
				});			
			});
			if (!stillLoading) {
				console.log("finished loading!");
				clearInterval(check);
				resolve();
			}
			timeElapsed += ms;
			if (timeElapsed > maxTime) {
				reject(Error("timed out"));
			}

		}, ms);

	});
}

function demoNotes(interval) {
	var i = 0;
	var keys = Object.keys(keyMap);
	var numKeys = Object.keys(keyMap).length;

	//hide menu temporarily
	dialogBox("hidden");
	function h() {
		embiggen(keyMap[keys[i]].kNum);
		playInstrument(keyMap[keys[i]]);
		i++;
		if (i < numKeys) {
			setTimeout(h, interval);
		}
		else {
			dialogBox("visible");
		}
	}
	h();
}

function scalesModeToggle(onoff) {
	if (onoff) {
		scalesMode = onoff;
		$("#scale").css("visibility", onoff ? "visible" : "hidden");
		return;
	}

	if (scalesMode) {
		scalesMode = false;
		$("#scale").css("visibility", "hidden");
	}
	else {
		scalesMode = true;
		$("#scale").css("visibility", "visible")
		setScaleFromChord(currentChord);
		$("#chordname").val(currentChord.name);
		setScaleLabel(scale);
	}
}

$(document).ready(function() { //let's do this!
	console.log("ready!");
	var instructionsArray = ["Use +/- to change your octave."
		,"Use the brackets ([, ]) to cycle up and down the circle of fifths."
		,"<br>"
		,"Hold the ~ key to activate extra functionality:"
		,"* Use the 'S' key to toggle scales mode."
		,"* While in scales mode, use the number row to switch between chords if you don't have a numpad."
		,"* More to come..."
		,"<br>"
		,"Scales Mode:"
		,"Use numpad 1-7 to switch between diatonic chords of the current scale"
		,"Use the brackets to change scales by 5ths, or enter a new tonic chord"];
	var instructionsHTML = "";
	instructionsArray.forEach(function(element) {
		instructionsHTML += "<div>" + element + "</div>"
	});
	$("#instructions-text").html(instructionsHTML);

	$("#scale").css("visibility", "hidden");

	//let's load some instruments!
	currentChord = teoria.chord($("#chordname").val());
	
	reload();

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

	$("#gridzone").click(function(event){		
			dialogBox();
	});

	$("#playbutton").click(function(event) {		
		fullscreen(document.documentElement); // the whole page		
		$('body').css('background-color', $("#bodycolor").val());		
	});

	$("#reload").click(function(event) {

		reload();
		doneLoading(["loading", "unloaded"]).then(demoNotes(50));
		
	});

	$("#gentitle").click(function(event) {
		$("#thetitle").html(toTitleCase(titleMaker()));
	});

	$("#advanced").click(function(event) {

		if (!advanced) {
			advanced = true;
			//currentChord = teoria.chord($("#chordname").val());
			console.log(currentChord.name);
			
			$("#advanced").text("advanced mode on");
			//$("#scale").css("visibility", "visible");
			
			$("#advanced-instructions").css("visibility", "visible");
			//$("#chordorscale").text("Scale Name:");
			/*$("#input").html("<select id='scale'> \
				<option value='C'>C Major / A Minor</option> \
				<option value='C#'>C#/Db Major / A#/Bb Minor</option> \
				<option value='D'>D Major / B Minor</option> \
				<option value='D#'>D#/Eb Major / C Minor</option> \
				<option value='E'>E Major / C#/Db Minor</option> \
				<option value='F'>F Major / D Minor</option> \
				<option value='F#'>F#/Gb Major / D#/Eb Minor</option> \
				<option value='G'>G Major / E Minor</option> \
				<option value='G#'>G#/Ab Major / F Minor</option> \
				<option value='A'>A Major / F#/Gb Minor</option> \
				<option value='A#'>A#/Gb Major / G Minor</option> \
				<option value='B'>B Major / G#/Ab Minor</option> \
				</select>");	*/			
		}
		else {
			advanced = false;
			scalesModeToggle(false);
			$("#advanced").text("advanced mode off");
			//$("#scale").css("visibility", "hidden");
			$("#advanced-instructions").css("visibility", "hidden");
			//$("#chordorscale").text("Chord Name:");
			//$("#input").html('<input type="text" style="width:7vw" id="chordname" value="Am">');
		}
	});
		
	$(document).on("change keyup", "#chordname", function(){
		var t = $("#chordname").val();
		var c = teoria.chord(t);
		if (c) {
			currentChord = c;

			if (advanced) {
				setScaleFromChord(currentChord);
			}
		}
	});

	$(document).on('keyup', function(event) {
		var actualKey = (event.which);
		if (actualKey == functionToggleKey) { //toggle function key off
			functionToggle = false;
		}
	});
	$(document).on('keydown', function(event) { //key is pressed
		
		if (document.activeElement.tagName == "BODY") {
			event.preventDefault();
		}
		var actualKey = (event.which);
		console.log(actualKey);
		if (actualKey == functionToggleKey) { //toggle function key on
			functionToggle = true;
		}

		if (!functionToggle) {
			//functions without function toggle on - still require advanced mode to be on
			if (advanced) {
				switch (actualKey) {
					case 107: //octave up
					case 187:
						console.log(actualKey);
						octaveShift(2);
						break;
					case 109: //octave down
					case 189:
						octaveShift(-2);
						break;
					case 219:
						intervalShift(teoria.interval.toCoord("P4"));
						break;
					case 221:
						intervalShift(teoria.interval.toCoord("P5"));
						break;
					default:
						break;

				}	
			}		
			//user playing note
			if (actualKey in keyMap) {
				embiggen(keyMap[actualKey].kNum);
				playInstrument(keyMap[actualKey]);

				//console.log(sound[keyMap[actualKey]]._src); //log instrument name		
			}
			//user switching chord
			else if (scalesMode && actualKey in chordMap && chordMap[actualKey] > -1) {
				currentChord = chords[chordMap[actualKey]];
				$("#chordname").val(currentChord.name);
			}
		}
		else { //functionToggle commands
			//switch chords in advanced mode with non-numpad numeric keys
			if (scalesMode && actualKey in chordMap && chordMap[actualKey] > -1) {
				currentChord = chordMap[actualKey];
				$("#chordname").val(currentChord.name);
			}
			else if (advanced) {
				switch (actualKey) {
					case 83:
						scalesModeToggle();
						break;
				}
			}
		}
	});



	if (document.addEventListener) { //trigger if fullscreen happens
		document.addEventListener('webkitfullscreenchange', exitHandler, false);
		document.addEventListener('mozfullscreenchange', exitHandler, false);
		document.addEventListener('fullscreenchange', exitHandler, false);
		document.addEventListener('MSFullscreenChange', exitHandler, false);
	}




});