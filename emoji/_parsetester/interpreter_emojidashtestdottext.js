var catdir = "";
var subdir = "";

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('emoji-test.txt')
});
command = "";
lineReader.on('line', function (line) {
	
	
	
	if (result = 	line.match(/^\#/)){
		if (result = line.match(/(\w*)group\: (.*)/)){
	      var sub= result[1];
				var cat = result[2];
	
	      cat = cat.replace(/\s/g, '_');
			  cat = cat.replace(/\&/g, 'and');
				
				if (sub!="sub"){ //it's a main category:
					console.log("mkdir /data/" + cat);
					catdir = "/data/" + cat;
				}else{ //subcat
					console.log("mkdir " + catdir + "/" + cat);
					subdir = catdir + "/" + cat;
				}
		}
	}

	if (result = line.match(/^(.*);(.*)#(.*?)[^a-z]*(.*)/i)){
	sourcefile = result[1];
	object = result[4];
	sourcefile = sourcefile.replace(/\s+$/, "");	
	sourcefile = sourcefile.replace(/\s/g, "_");
	sourcefile = "emoji_u" + sourcefile + ".svg";
	object = object.replace(/[^a-z]/ig, "-");
  console.log("mv ./" + sourcefile + " " + subdir +"/"+ object +".svg" );
	}
	
	//
	
	
 
});