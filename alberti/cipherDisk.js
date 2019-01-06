

//clockwise
var possibleFrequencyCharacters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'X', 'Z']; //always uppercase
//var outerDisk = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'X', 'Z', '1', '2', '3', '4']; //latin
//var innerDisk = ['a', 'c', 'e', 'g', 'k', 'l', 'n', 'p', 'r', 't', 'v', 'z', '&', 'x', 'y', 's', 'o', 'm', 'q', 'i', 'h', 'f', 'd', 'b']; //always lowercase


//one nulls
var outerDisk = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'X', 'Z', '1']; //latin
var innerDisk = ['a', 'c', 'e', 'g', 'k', 'l', 'n', 'p', 'r', 'z', '&', 'x', 'y', 'o', 'm', 'q', 'i', 'h', 'f', 'd', 'b']; //always lowercase
var dictionaries = {};

dictionaries.latinDictionary = latinDictionary;



//rotates a given disk once
function rotateDisk(disk) {
	var len = disk.length,
		i = 0, 
		shift = disk[0],
		next;

	for(i; i < len; i++) {
		if(i + 1 === len) {
			disk[0] = shift;
		} else {
			next = disk[i + 1];
			disk[i + 1] = shift;
			shift = next; 
		}
	}

	return disk;
}

//message - the message to be encrypted:
//no punctuation, spaces only
//patter [frequency, frequencyCharacters]
function encrypt (message, pattern, index, insertNulls) {
	var tempInnerDisk = getDisk(),
		rand = Math.floor(Math.random() * 25), //24 is full rotation
		i = 0, frequency, frequencyCharacters;

	//random start
	if(!index) {
		for(i; i < rand; i++) {
			tempInnerDisk = rotateDisk(tempInnerDisk);
		}

		index = tempInnerDisk[0];
	} else { //specified start
		while(tempInnerDisk[0] !== index) {
			tempInnerDisk = rotateDisk(tempInnerDisk);
		}
	}

	//random pattern
	if(!pattern) {
		frequency = 2; //Math.floor(Math.random() * 2); //assumes between words
		frequencyCharacters = getRandomFrequencyCharacters();
		pattern = [frequency, frequencyCharacters];
	}

	//params generated, begin encryption
	return beginEncryption(message, pattern, tempInnerDisk, insertNulls);

}

//generates two random frequencyCharacters
function getRandomFrequencyCharacters() {
	var frequencyCharacters = [],
	len = possibleFrequencyCharacters.length,
	char1 = possibleFrequencyCharacters[Math.floor(Math.random() * len)], 
	char2 = possibleFrequencyCharacters[Math.floor(Math.random() * len)];

	if(char1 === char2) {
		frequencyCharacters = getRandomFrequencyCharacters();
	} 
		
	frequencyCharacters.push(char1);
	frequencyCharacters.push(char2);
	return frequencyCharacters;
}

//encrypts a message inserting frequency characters between words
//rotating the disk and inserting a frequency Character upon
//reaching the frequency
//currently assumes frequency characters are placed between words...
function beginEncryption(message, pattern, tempInnerDisk, insertNulls) {
	var words = message.split(' '),
	i, j, currentWord, letterIndex,
	frequency = pattern[0],
	frequencyCharacters = pattern[1],
	cipher = frequencyCharacters[0];

	//start message
	for(i = 0; i < words.length; i++) {
		currentWord = words[i];

		if((i > 0) && i % frequency === 0) {
			tempInnerDisk = rotateDisk(tempInnerDisk);
			cipher += frequencyCharacters[1] + frequencyCharacters[0];
		}

		//outer disk is the plain text 
		for(j = 0; j < currentWord.length; j++) {
			letterIndex = outerDisk.indexOf(currentWord[j].toUpperCase());
			cipher += innerDisk[letterIndex];

			if(!!insertNulls) {
				//defaults to 10%
				if(Math.floor(Math.random() *  11) > 9) {
					cipher += getRandomNull(tempInnerDisk);
				}
			}
		}

	}

	console.log('Frequency: ' + frequency);
	console.log('Frequency Characters: ' + frequencyCharacters[0] + ', ' + frequencyCharacters[1]);
	console.log('Cipher: ' + cipher);

	return cipher;

}

function getRandomNull(tempInnerDisk) {
	//last four on the disk are nulls
	var rand = Math.ceil(Math.random() * 4);
	return tempInnerDisk[tempInnerDisk.length - rand];
}

//cipher - the encrypted text (ommit the first rotaion character)
//rotationCharacter - the character signifying when to rotate the disk
//index - the starting position of the disk, randomly chosen if nothing is passed 
function decrypt(cipher, rotationCharacter, index, nulls, randomDisk) {
	var i,  tempInnerDisk = getDisk(), message = '';

	if(!!randomDisk) {
		tempInnerDisk = getRandomDisk();
	}

	//if no index is passed in, get a random one
	if(!index || tempInnerDisk.indexOf(index) === -1) {
		index = innerDisk[Math.floor(Math.random() * innerDisk.length)];
	}

	if(!nulls) {
		nulls = [];
	}

	//rotate the disk into position
	while(tempInnerDisk[0] !== index) {
		tempInnerDisk = rotateDisk(tempInnerDisk);
	}

	//attempt decryption
	for(i = 0; i < cipher.length; i++) {
		//rotate disk, move to next character
		if(cipher[i] === rotationCharacter) {
			tempInnerDisk = rotateDisk(tempInnerDisk);
			if(i < cipher.length -1) {
				i++;
			}
		}
		if(nulls.indexOf(cipher[i]) === -1 && cipher[i] !== rotationCharacter
			&& cipher[i] !== ' ') {
			//let this blow up for invalid characters
			message += outerDisk[tempInnerDisk.indexOf(cipher[i])];
		} else if (cipher[i] === ' ') { //but allow spaces
			message += ' ';
		}
	}

	return message;
}

//function
//creates and rotates random disks until a match is found
//then locks in the characters of the match into a new disk
//then runs through the permutations of the new disk
//params
//cipher: an array of encrypted words
//nulls: known null characters
//random disk: bool, random or classic Alberti
//dictionary: which dictionary from the global dictionary object should be used
function filteredPermutationDecrypt(cipher, rotationCharacter, nulls, randomDisk, dictionary) {
	var index = 0,
	j = 0,
	response = [], 
	match, 
	message = [],
	foundMatch = false, 
	rand,
	conditions = [],
	filteredPermutations;

	//try random disks until we get a match on the first word
	while(!foundMatch) {
		response = decrypt(cipher[0], rotationCharacter, null/*random index*/, nulls, true/*random disk*/);
		match = tryMatchWord(response, dictionary);

		if(!!match) {
			foundMatch = true;
		}
	}

	//match found setup disk and conditions
	for(index = 0; index < match.length; index++) {
		conditions.push(updateConditions(match[index]));
	}

	//get the permutations of the disk with the conditions
	filteredPermutations = filterPermutations(conditions);

	//TODO, make this handle the full length of the cipher
	for(index = 0; index < filteredPermutations.length; index++) {
		
		response = decrypt(cipher[1], rotationCharacter, null/*random index*/, nulls, false/*random disk*/);
		match = tryMatchWord(response, dictionary);

		if(!!match) {
			//match found setup disk and conditions
			for(j = 0; j < match.length; j++) {
				conditions.push(updateConditions(match[j]));
			}
			filteredPermutations = filterPermutations(conditions);
			break;
		}
	}

	for(index = 0; index < cipher.length; index++) {

		//store values for logging before decryption
		message[0] = cipher;
		message[1] = innerDisk[index];
		message[2] = rotationCharacter;
		message[3] = index;

		response.push(decrypt(cipher, rotationCharacter, innerDisk[index], nulls, randomDisk));
	}

	//
	for(index = 0; index < innerDisk.length; index++) {
		match = tryMatchWord(response[0], dictionary);

		if(!!match) {

		}

	}
	

	console.log('=================');
	console.log('Cipher: ' + message[0]);
	console.log('Index: ' + message[1]);
	console.log('Rotation Characters:' + message[2]);
	console.log('Rotation: ' +  message[3]);
	console.log('Response: ' + response);
	console.log('Match: ' + match);
	console.log('=================');
}

function updateConditions(character) {
	var condition = [];
		condition.push(outerDisk.indexOf(character));
		condition.push(character);
		return condition;
}

//TODO add more than one word functionality
//function 
//rotates the disk until a match is found
//params
//cipher: an array of encrypted words
//rotation character: a character to signify when to rotate the disk
//nulls: known null characters
//random disk: bool, random or classic Alberti
//dictionary: which dictionary from the global dictionary object should be used
function fullRotationDecrypt(cipher, rotationCharacter, nulls, randomDisk, dictionary) {
	var index = 0,
	len = innerDisk.length,
	response, match, message = [];

	for(index; index < len; index++) {

		//store values for logging before decryption
		message[0] = cipher;
		message[1] = innerDisk[index];
		message[2] = rotationCharacter;
		message[3] = index;

		response = decrypt(cipher, rotationCharacter, innerDisk[index], nulls, randomDisk);

		//for one word ciphers
		match = tryMatchWord(response, dictionary);

		if(!!match) {
			console.log('=================');
			console.log('Cipher: ' + message[0]);
			console.log('Index: ' + message[1]);
			console.log('Rotation Characters:' + message[2]);
			console.log('Rotation: ' +  message[3]);
			console.log('Response: ' + response);
			console.log('Match: ' + match);
			console.log('=================');
		}
	}
}

function getDisk() {
	//return  ['a', 'c', 'e', 'g', 'k', 'l', 'n', 'p', 'r', 't', 'v', 'z', '&', 'x', 'y', 's', 'o', 'm', 'q', 'i', 'h', 'f', 'd', 'b'];
	return  ['a', 'c', 'e', 'g', 'k', 'l', 'n', 'p', 'r', 'z', '&', 'x', 'y', 'o', 'm', 'q', 'i', 'h', 'f', 'd', 'b'];
}

function getRandomDisk() {
	//var disk = ['a', 'c', 'e', 'g', 'k', 'l', 'n', 'p', 'r', 't', 'v', 'z', '&', 'x', 'y', 's', 'o', 'm', 'q', 'i', 'h', 'f', 'd', 'b'],
	var disk =  ['a', 'c', 'e', 'g', 'k', 'l', 'n', 'p', 'r', 'z', '&', 'x', 'y', 'o', 'm', 'q', 'i', 'h', 'f', 'd', 'b'],
	temp, i, rand;

	for(i = 0; i < disk.length; i++) {
		rand = Math.floor(Math.random() * disk.length);
		temp = disk[i];
		disk[i] = disk[rand];
		disk[rand] = temp;
	}

	return disk;
}

function elasticSearch(message, nulls) {
	var matches = [], namingIndex, recursiveIndex;

	matches = findMatches(message);

	matches.forEach(function(match) {
		findMatches(message.slice(message[message.indexOf(match)], match.length));
	});
}

function findMatches (message) {
	var currentWord, i, longestMatch, matches = [];
		//find longest match from start
	for(i = 0; i < message.length; i++) {
		if(nulls.indexOf(message[i]) === -1) {
			currentWord += message[i];
		}
		if(tryMatchWord(currentWord)) {
			longestMatch = currentWord;
			matches.push(currentWord);
		}
	}

	return matches;
}

function tryMatchWord(word, dictionary) {
	var noNulls = '';
	if(!dictionary) {
		return '';
	} else {
		for(var j = 0; j < word.length; j++) {
			if(word[j] !== '1') { //1 is the only null in this test
				noNulls += word[j];
			}
		}
		for(var i = 0; i < dictionary.length; i++) {
			if(dictionary[i].toLowerCase() === noNulls.toLowerCase()) {
				return noNulls;
			}
		}
	}
	return '';
}

//v will be the filtered output
function filterPermutations (lockedLetters) {
var v = [],
	used = [];

	filteredPermute(outerDisk, lockedLetters);

	function filteredPermute (input, conditions) {
		var i, current;

		for(i = 0; i < input.length; i++) {
			current = input.splice(i, 1)[0];
			used.push(current);

			if(input.length === 0) {
				if(conditionsAreMet(used, conditions)) {
					v.push(used.slice());
				}
			}

			filteredPermute(input, conditions);
			input.splice(i, 0, current);
			used.pop();
		}
	}

	//conditions = [condition, condition...]
	//condition = [index, value]

	function conditionsAreMet(permutation, conditions) {
		var met = true;

		conditions.forEach(function (condition) {
			if(permutation[condition[0]] !== condition[1]) {
				met = false;
			}
		});
		return met;
	}
	return v;
}
