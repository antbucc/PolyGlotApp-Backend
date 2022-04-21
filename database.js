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

getQuest("IngSoft","B3");

/*MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("connesso");

  var dbo = db.db(config.connection.database);
  dbo.collection("quiz").insertOne(row1, function(err, res) {
    if (err) throw err;

    console.log("1 document inserted");
    db.close();
  }); 
});*/


/**
 * 
 * @param {*} file file JSON con tutte le domande esportate da moodle
 */
function insertFromXML(file){
  var quizes = require('./json_data.json');

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
  
    var dbo = db.db(config.connection.database);
    //dbo.collection("quiz").insertMany(quizes.quiz.question, function(err, res) {
    dbo.collection("quiz").insertMany(addKeysquizes(quizes.quiz.question,"IngSoft"), function(err, res) {
      if (err) throw err;
  
      console.log("1 document inserted");
      db.close();
    }); 
  });
  console.log("END");
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