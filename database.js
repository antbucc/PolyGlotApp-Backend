var util= require('util');
//var encoder = new util.TextEncoder('utf-8');
var cor_st= require('core-js/stable');
var MongoClient = require('mongodb').MongoClient;
var config = require('./local_config.js');

//riga di esempio
var row1= require('./quiz1.json');


// Connection URL
//var url="mongodb://localhost:27017/db_quiz";
var url="mongodb://"+config.connection.host+":"+config.port+"/"+config.connection.database;
console.log("mi connetto a "+ url);

insertFromXML('./json_data.json');

//getQuest("IngSoft","B3");


/**
 * 
 * @param {*} file file JSON con tutte le domande esportate da moodle
 */
function insertFromXML(file){
  var quizes = require('./json_data.json');

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
  
    var dbo = db.db(config.connection.database);
    //to do...check if exist
    //console.log(dbo.collection("quiz").find(quizes.quiz.question[1].questiontext.text));
    dbo.collection("quiz").insertMany(createNewJSON(quizes.quiz.question), function(err, res) {
      if (err) throw err;
  
      console.log("query executed");
      db.close();
    });
  });  
  console.log("END");
}

/**
 * 
 * @param {*} qJson JSON file con solo le domande
 * @returns JSON file pronto per l'inserimento nel server
 */
function createNewJSON(qJson){
  let newJson=[];
  let i=0;
  let q={
      "type": "",
      "name": "",
      "questiontext":"",
      "generalfeedback":"",
      "correctfeedback":"",
      "partiallycorrectfeedback":"",
      "incorrectfeedback":"",
      "difficulty":"",
      "topic":"",
      "course":"",
      "answer":[]
  }
  qJson.forEach(question => {
    let tmp= JSON.stringify(question).replace('@', '');
    question= JSON.parse(tmp);
    if(question.type!="category"){
      q.type=question.type;
      q.name= question.name.text
      q.questiontext=question.questiontext.text;
      q.generalfeedback=question.generalfeedback.text;
      q.correctfeedback=question.correctfeedback.text;
      q.partiallycorrectfeedback=question.partiallycorrectfeedback.text;
      q.incorrectfeedback=question.incorrectfeedback.text;
      q.difficulty=question.tags.tag[0].text;
      q.topic=question.tags.tag[1].text;
      q.course=question.tags.tag[2].text;
      
      let counter=0;
      question.answer.forEach(ans => {
        tmp= JSON.stringify(ans).replace('@', '');
        ans= JSON.parse(tmp);
        tmp= JSON.stringify(ans).replace('@', '');
        ans= JSON.parse(tmp);
        let a={
          "fraction":ans.fraction,
          "format":ans.format,
          "text":ans.text
        };
        q.answer[counter]=a;
        counter++;
      });
      newJson[i]=q;
      i++;
    }
  });
  return newJson;
}


/**
 * 
 * @param {*} qJson file json originale da moodle
 * @param {*} subject nome del corso riferito alle domande
 * @returns file json aggiornato con le nuove voci
 */
function addKeysquizes(qJson,subject){
  let tmp=0;

  qJson.forEach(element => {
    element.timeDataOpen="";
    element.timeDataClose="";
    element.course=subject;
    element.section= "B"+tmp++;

  });
  return qJson;
}

/**
 * 
 * @param {*} course nome del corso
 * @param {*} section nome del capitolo
 */
function getQuest(c,s){
  let arrToJs;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
  
    var dbo = db.db(config.connection.database);
    dbo.collection("quiz").find({course:c,section:s}).toArray(function(err, res) {
      if (err) throw err;
      //console.log(res);
      arrToJs=res;
      //arrToJs = JSON.stringify(res);
      console.log(arrToJs);
      db.close();
    });
  });
}