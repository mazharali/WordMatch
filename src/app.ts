import fs from 'fs';
import path from 'path';
import csv from 'csvtojson';

const countCharacters = (str: string): Object => 
  [...str].reduce((a: any, e: string) => { a[e] = a[e] ? a[e] + 1 : 1; return a }, {});

const uniqueObjs = <T, K extends keyof T>(arr: T[], key: K) => [...new Map(arr.map(item => [item[key], item])).values()];

const addCharacters = (arr: number[]): number[] => {
  let numArr: number[] = [];
  if(arr.length % 2 === 0) {
    for(let i=0; i< arr.length / 2; i++) {
      if(arr[i] + arr[arr.length - i - 1] > 9) {
        let nm: string = (arr[i] + arr[arr.length - i - 1]).toString();
          for(const n of nm) {
            numArr.push(parseInt(n));
          }
      } else {
        numArr.push(arr[i] + arr[arr.length - i - 1]);
      }
    }
  } else {
    for(let i = 0; i < Math.floor(arr.length / 2) + 1; i++) {
      if(i === Math.floor(arr.length / 2)) {
        numArr.push(arr[i]);
      } else {
        if(arr[i] + arr[arr.length - (i + 1)] > 9) {
          let nm: string = (arr[i] + arr[arr.length - (i + 1)]).toString();
          for(const n of nm) {
            numArr.push(parseInt(n));
          }
        } else {
          numArr.push(arr[i] + arr[arr.length - (i + 1)]);
        }
      }
    }
  }
  return numArr as number[];
}

const playerMatch = (p1: string, p2: string): number => {
  const sentence = `${p1} matches ${p2}`.replace(/\s+/g, '').toLowerCase().trim();
  const nums = Object.values(countCharacters(sentence));
  let numbers: number[] = nums;
  while(!(numbers.length <= 2)) {
    numbers = addCharacters(numbers);
  }
  return parseInt(numbers.toString().replace(',','')); 
}

//Using Names

let firstPlayerName = "Jack";
let secondPlayerName = "Jill";

if((/^[a-zA-Z]+$/.test(firstPlayerName)) && (/^[a-zA-Z]+$/.test(secondPlayerName))) {
  const perc = playerMatch(firstPlayerName, secondPlayerName);
  if(perc >= 80) {
    console.log(`${firstPlayerName} matches ${secondPlayerName} ${perc}%, good match`);
  } else {
    console.log(`${firstPlayerName} matches ${secondPlayerName} ${perc}%`);
  }
} else {
  console.log("Names should include alphabets only");
}

//Using CSV File
(async () => {
  const filePath = path.join(__dirname, '../' , '/file.csv');
  if(fs.existsSync(filePath)) {  
    const file = await csv({
      noheader: true,
      headers: ['name', 'gender'],
      trim: true,
    }).fromFile(filePath);
    const males = uniqueObjs(file.filter((data) => data.gender === 'm'), 'name');
    const females = uniqueObjs(file.filter((data) => data.gender === 'f'), 'name');
    const matchArr = [];
    for (const male of males) {
      for(const female of females) {
        matchArr.push({
          match: `${male.name} matches ${female.name}`,
          score: playerMatch(male.name, female.name)
        });
      }
    }

    // const sortedScore = matchArr.sort((a,b) => a.score > b.score ? -1: 1);
    const sortedScore = matchArr.sort((a, b) => {
      if(a.score > b.score){
        return -1;  
      }else if(a.score < b.score){
        return 1;
      }else{
        if(a.match < b.match){
          return -1
        }else if(a.match > b.match){
          return 1;
        }else{
          return 0;
        }
      }
    });

    const fileName = path.join(__dirname, '../', 'output.txt');
    if(fs.existsSync(fileName)) {
      fs.unlinkSync(fileName);
    }
    for (const match of sortedScore) {
      fs.writeFileSync(fileName, `${match.match} ${match.score}${match.score >= 80 ? '%, good match' : '%'}\n`, {
        encoding: "utf8",
        flag: "a+",
        mode: 0o666
      });
    }
  }
})();