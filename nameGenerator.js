

class NameGenerator {
  constructor(database) {
    this.vowels = 'iaeouùéèòàìïóëüöäyîjá';
    this.consonants = 'dntlghrcmzkqpwvsfbxyjñ';
    this.nameBitsDatabase = [];
    this.stringifiedDatabase = [];

    console.log("NameGenerator created");
  }

  // Helper functions
  isConsonant(letter) {
    let result = this.consonants.includes(letter);
    //console.log("isConsonant: ", letter, result)
    return result;
  }
  isVowel(letter) {
    let result = this.vowels.includes(letter);
    //console.log("isVowel: ", letter, result)
    return result;
  }
  areEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((value, i) => value === arr2[i])
  }
  // END Helper functions


  createDatabaseFromText(text, prevNextMode) { // Text is a (possibly huge) string
    // prevNextMode selects if prev and next must be syllables or single letters. The final result varies widely.
    // prevNextMode: 'syl' || 'char'

    // Clean text from various things
    text = text.replace(/[,\.;:!?\/()\-[\]{}»«"\\0-9]/gi, '');
    text = text.replace(/[\n`']/gi, ' ');
    text = text.replace(/\s\s+/gi, ' ');
    text = text.replace(/^\s/, '');
    text = text.replace(/\s$/, '');

    // Sanitize vocals for more flexibility
    text = text.replace(/[àäá]/gi, 'a');
    text = text.replace(/[éèë]/gi, 'e');
    text = text.replace(/[ìïî]/gi, 'i');
    text = text.replace(/[òóö]/gi, 'o');
    text = text.replace(/[ùü]/gi, 'u');


    //console.log(text);
    // Get every word into an array
    text = text.split(' ');

    text.forEach( word => {
      //let wordBefore = word;
      word = this.divideWord(word.toLowerCase()).split('-');

      //console.log("Creating syls for: ", word);

      word.forEach( (syl, i, word) => {

        // Failsafe to return when finding an empty string (it should be fixed now, but I'll leave it just in case)
        if(syl == '') {
          return;
        }

        let existentSyl = this.nameBitsDatabase.find( obj => obj.syl == syl);

        if(existentSyl) {
          //console.log("existing syllable: ", syl, "Updating...", this)

          let prevBit = ' ';
          let nextBit = ' ';

          switch(prevNextMode) {
            case 'char':
              if(i > 0) prevBit = word[i - 1].charAt(word[i - 1].length-1);
              if(i < word.length - 1) nextBit = word[i + 1].charAt(0);
              break;
            case 'syl':
              if(i > 0) prevBit = word[i - 1];
              if(i < word.length - 1) nextBit = word[i + 1];
              break;
          }
                    
          existentSyl.occurrences++;
          existentSyl.prev.add(prevBit); // add to Set
          existentSyl.next.add(nextBit); // add to Set

          //console.log("Syllable already existed. Added ", syl, existentSyl.occurrences)
        }
        else {
          //console.log("Creating new syllable: ", syl)
          let newSyl = {
            syl: syl,
            occurrences: 1
          }

          // If not first syllable, add last letter of previous syllable / previous syllable
          if(i > 0) {
            switch(prevNextMode) {
              case 'char': 
                newSyl.prev = new Set([word[i - 1].charAt(word[i - 1].length-1)]);
                break;
              case 'syl': 
                newSyl.prev = new Set([word[i - 1]]);
                break;
            }
          }
          // else we must be at word beginning, previous letter is a space
          else {
            newSyl.prev = new Set(' ');
          }

          // If not last syllable, add first letter of next syllable / next syllable
          if(i < word.length - 1) {
            switch(prevNextMode) {
              case 'char': 
                newSyl.next = new Set([word[i + 1].charAt(0)]);
                break;
              case 'syl':
                newSyl.next = new Set([word[i + 1]]);
                break;
            }
          }
          // else we must be at word end, next letter is a space
          else {
            newSyl.next = new Set(' ');
          }

          this.nameBitsDatabase.push(newSyl);

          //console.log("new syllable: ", newSyl);
        }
      });
    });
    
    // I couldn't figure out why, but sometimes and empty string is added to the prev and next set.
    // The following is a bit costly, but it is run only at database creation so it can be tolerated I guess

    // XXX I found out what the bug was, but I will leave this here for now, might be useful in the future

    // this.nameBitsDatabase.forEach( syl => {
      //   if(syl.prev.delete('') || syl.next.delete('')) {
    //     //console.log("Purged empty string in syl", syl.syl);
    //   }
    // });
    // console.log("namebits database purged from empty strings");


    this.nameBitsDatabase = this.nameBitsDatabase.map( obj => {
      let strObj = {
        syl: obj.syl,
        prev: Array.from(obj.prev),
        next: Array.from(obj.next),
        occurrences: obj.occurrences
      }
      return strObj;
    });

    console.log("Database generated");
  }

  importBits(jsonDB) {
    console.log("importBits: importing...");
    this.nameBitsDatabase = jsonDB.map( item => {
      return item;
    });
    console.log("importBits: bits imported");
  }

  getName() {
    let randInt = (min, max) => {
      return Math.floor(Math.random() * (max - min) + min);
    }
    
    let getSylPool = (prevBit) => {
      let pool = this.nameBitsDatabase.filter( syl => syl.prev.includes(prevBit));
      if(pool.length < 1) {
        pool = this.nameBitsDatabase.filter( syl => syl.prev.includes(' '));
      }
      return pool;
    }

    let getRandSyl = (sylPool) => {
      if(sylPool.length > 0) {
       return sylPool[Math.floor(Math.random() * (sylPool.length))].syl;
      }
    }

    let nameLengthWeightedChance = [5,4,4,4,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1];
    let nameLength = nameLengthWeightedChance[randInt(0, nameLengthWeightedChance.length - 1)];

    let name = [' '];
    let sylPool;
    let randIndex;

    for(let i = 0; i < nameLength; i++) {
      sylPool = getSylPool(name[name.length - 1]);
      randIndex = randInt(0, sylPool.length);
      //console.log("Status: ", sylPool.length, randIndex)
      name.push(sylPool[randIndex].syl)
    }

    name.shift();
    name = name.join('');
    name = (name.charAt(0)).toUpperCase() + name.slice(1);


    return name;
  }








  divideWord(word) {
    //console.log("dividing word: ", word);

    const debugMode = false;

    let isolateInitialVowel = (word) => {
      if(debugMode) console.log("isolateInitialVowel", word);

      if(this.isVowel(word.charAt(0)) && this.isConsonant(word.charAt(1)) && this.isVowel(word.charAt(2))) {
        return word.slice(0, 1) + '-' + word.slice(1);
      }    
      return word;
    }
    
    let divideDoublesCQ = (word) => {
      if(debugMode) console.log("divideDoublesCQ", word);

      for(let i = 0, j=i+1; j < word.length; i++, j++) {
        let iChar = word.charAt(i);
        let jChar = word.charAt(j);

        if(jChar == iChar || (iChar == 'c' && jChar == 'q')){
          return word.slice(0, j) + '-' + word.slice(j);
        }
      }
      return word;
    }
    
    let divideConsonantTriplets = (word) => {
      if(debugMode) console.log("divideConsonantTriplets", word);

      for(let i = 0, j = i + 1, k = j + 1; k < word.length; i++, j++, k++) {
        let iChar = word.charAt(i);
        let jChar = word.charAt(j);
        let kChar = word.charAt(k);

        if([iChar, jChar, kChar].some( c => c === '-')) continue;

        if([iChar, jChar, kChar].every( c => this.isConsonant(c))) {
          if(this.isConsonant(word.charAt(k + 1))) {
            word = word.slice(0, k) + '-' + word.slice(k);
            i += 3;
            j = i + 1;
            k = j + 1;
          }
          else if(iChar != 's') {
            word = word.slice(0, j) + '-' + word.slice(j);
            i += 3;
            j = i + 1;
            k = j + 1;
          }
        }

      }
      return word;
    }

    let fixLetterS = (word) => {
      if(debugMode) console.log("fixLetterS", word);

      for(let i = 0, j = i + 1, k = j + 1; j < word.length; i++, j++, k++) {
        let iChar = word.charAt(i);
        let jChar = word.charAt(j);
        let kChar = word.charAt(k);

        // Fixes S only if not double
        if(iChar == 's' && jChar == '-' && kChar != 's'){
          return word.slice(0, i) + '-s' + word.slice(j + 1);
        }
      }
      return word;
    }
    let fix4Vowels = (word) => {

      if(debugMode) console.log("fix4Vowels", word);

      for(let i = 0, j = i + 1, k = j + 1, z = k + 1; z < word.length; i++, j++, k++, z++) {
        let iChar = word.charAt(i);
        let jChar = word.charAt(j);
        let kChar = word.charAt(k);
        let zChar = word.charAt(z);

        if([iChar, jChar, kChar, zChar].every( char => this.isVowel(char))){
          return word.slice(0, k) + '-' + word.slice(k);
        }
      }
      return word;

    }

    let isDigramma = (str) => { // str.length === 3

      if(debugMode) console.log("isDigramma", word);

      let digrammi = ['gli',
                      'che', 
                      'chi',
                      'ghe',
                      'ghi',
                      'sce',
                      'sci',
                      'cia',
                      'cio',
                      'ciu',
                      'gia',
                      'gio',
                      'giu',
                      'gna',
                      'gne',
                      'gni',
                      'gno',
                      'gnu'
                    ];
          
      if(digrammi.includes(str)) {
        return true;
      }
      else return false;
    }
      
    let isTrigramma = (str) => { // str.length === 4

      if(debugMode) console.log("isTrigramma", word);

      let trigrammi = [ 'glia',
                        'glie',
                        'glio',
                        'gliu',
                        'scia',
                        'scie',
                        'scio',
                        'sciu',
                        ];
    
      if(trigrammi.includes(str)) {
        return true;
      }
      else return false;
    }
    
    let isUndividableConsonants = (str) => { // str.length === 2

      if(debugMode) console.log("isUndividableConsonants", word);

      let firstChar = ['b','c','d','f','g','p','t','v'];
      let secondChar = ['l','r'];
      
      if(firstChar.includes(str.charAt(0)) && secondChar.includes(str.charAt(1))) return true;
      else return false;
    }

    let isDittongo = (str) => { // str.length === 2

      if(debugMode) console.log("isDittongo", word);

      let dittongo = ['ia', 'ie', 'ei', 'io', 'oi', 'iu', 'ui', 'ua', 'au', 'ue', 'eu', 'uo', 'ou'];

      if(dittongo.includes(str)) return true;
      else return false;
    }

    let isTrittongo = (str) => { // str.length === 3

      if(debugMode) console.log("isTrittongo", word);

      let trittongo = ['iai', 'iei', 'uai', 'uoi', 'iuo'];

      if(trittongo.includes(str)) return true;
      else return false;
    }
      
    /*
    *
    *   END SUBROUTINES
    * 
    */ 


    /*
    *
    *   ACTUAL ALGORITHM
    * 
    */ 


    let dittonghiExceptions = ['m'];

    let shortWord = word.length < 3;


    if(shortWord) {
      //console.log("shortWord: ", word);
      return word;
    }
  
    // Apply context rules going backwards
    for(let z = word.length - 1; z > 0; z--) {
      let currentChar = word.charAt(z);
      let prevChar = word.charAt(z - 1);
      let nextChar = word.charAt(z + 1);    

      // 4 letters check
      let str = word.slice(z - 3, z + 1); // previous 3 + currentChar
      if(this.isVowel(currentChar) && isTrigramma(str)) {
        word = word.slice(0, z - 3) + '-' + word.slice(z - 3);
        z -= 4;
        continue;
      }
      
      // 3 letters checks
      str = word.slice(z - 2, z + 1); // previous 2 + currentChar
      if(this.isVowel(currentChar) && isDigramma(str)) {
        word = word.slice(0, z - 2) + '-' + word.slice(z - 2);
        z -= 3;
        continue;
      }

      if(this.isVowel(currentChar) && isTrittongo(str)) {
        if(this.isConsonant(word.charAt(z - 3))) {
          word = word.slice(0, z - 3) + '-' + word.slice(z - 3);
          z -= 4;
        }
        else if(this.isVowel(word.charAt(z - 3))) {
          word = word.slice(0, z - 2) + '-' + word.slice(z - 2);
          z -= 3;
        }
        continue;
      }

      // 2 letters checks
      str = word.slice(z - 1, z + 1); // previous + currentChar
      if(this.isVowel(currentChar) && isDittongo(str) && !dittonghiExceptions.includes(word.charAt(z - 2))) {
        continue;
      }

      if(this.isConsonant(currentChar) && this.isVowel(nextChar)) {
        if(!isUndividableConsonants(str)) {
          word = word.slice(0, z) + '-' + word.slice(z);
        }
        continue;
      }

      if(this.isVowel(currentChar) && this.isVowel(prevChar)) {
        word = word.slice(0, z) + '-' + word.slice(z);
        continue;
      }

      if(isUndividableConsonants(currentChar + nextChar)) {
        word = word.slice(0, z) + '-' + word.slice(z);
      }

    }
    
    // Apply particular rules
    word = divideDoublesCQ(word);
    word = isolateInitialVowel(word);
    word = fixLetterS(word);
    word = divideConsonantTriplets(word);
    word = fix4Vowels(word);

    if(word.charAt(0) == '-') {
      word = word.slice(1);
    }

    //if(shortWord) console.log("shortWord: ", word);

    return word;
  }


}