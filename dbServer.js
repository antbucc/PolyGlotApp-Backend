
var util= require('util');
var encoder = new util.TextEncoder('utf-8');
//var cor_st= require('core-js/stable');
var MongoClient = require('mongodb').MongoClient;
var config = require('./local_config.js');
const express = require('express')
const app = express()
const port = 3030

var url="mongodb://"+config.connection.host+":"+config.port+"/"+config.connection.database;
console.log("url database:  "+ url);

app.get('/', (req, res) => {
  res.send('Hello, from database!')
})

//example    GET /question?course=Corso-SE&topic=topic-class
app.get('/question', (req, res) => {
  let c=req.query.course;
  let t= req.query.topic;
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      let dbo = db.db(config.connection.database);
        dbo.collection("quiz").aggregate([{ $match: { course:c,topic:t} },{ $sample: { size: 1 } }  ]).toArray(function(err, _res) {
        if (err) throw err;
        //console.log(_res);
        res.send(_res);
        db.close();
      });  
    });

})

app.get('/insert', (req, res) => {
  //autoConvertXML();
  insertFromXML('./json_data.json');

  res.send("Update executed");
})



//******************************************************************************************************************************************* */


/**
 * Auto convert file using python (XML->JSON)
 */
 function autoConvertXML(){
  //RUN SCRIPT PYTHON WITH BASH FILE
  var exec = require('child_process').exec;

  exec('python3 XMLConvert.py',
    function (error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        //console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}


/**
 * 
 * @param {*} file file JSON con tutte le domande esportate da moodle
 */
 function insertFromXML(file){
  var quizes = require(file);
      let arrTmp=createNewJSON(quizes.quiz.question);

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
  
    var dbo = db.db(config.connection.database);
    
    dbo.collection("quiz").insertMany(arrTmp, function(err, res) {
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
  var newJson=[];
  let question;
  let i=0;
  let q={
      idnumber:"",
      type: "",
      name: "",
      questiontext:"",
      generalfeedback:"",
      correctfeedback:"",
      partiallycorrectfeedback:"",
      incorrectfeedback:"",
      difficulty:"",
      topic:"",
      course:"",
      answer:[]
  }
  for(i=0; i<qJson.length;i++){
    question=qJson[i];
    let tmp= JSON.stringify(question).replace('@', '');
    question= JSON.parse(tmp);
    if(question.type!="category"){
      q.idnumber=question.idnumber;
      q.type=question.type;
      q.name= question.name.text
      q.questiontext=question.questiontext.text;
      q.generalfeedback=question.generalfeedback.text;
      q.correctfeedback=question.correctfeedback.text;
      q.partiallycorrectfeedback=question.partiallycorrectfeedback.text;
      q.incorrectfeedback=question.incorrectfeedback.text;
      q.difficulty=question.tags.tag[1].text;
      q.topic=question.tags.tag[0].text;
      q.course=question.tags.tag[2].text;
      
      let counter=0;
      question.answer.forEach(ans => {
        tmp= JSON.stringify(ans).replace('@', '');
        ans= JSON.parse(tmp);
        tmp= JSON.stringify(ans).replace('@', '');
        ans= JSON.parse(tmp);
        let a={
          fraction:ans.fraction,
          format:ans.format,
          text:ans.text
        };
        q.answer[counter]=a;
        counter++;
      });
      let m=JSON.stringify(q);
      newJson.push(JSON.parse(m));

      //checkIfExist(q);
    }

  };
  return newJson;
}

function checkIfExist(q){
  let ans=false;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(config.connection.database);
    dbo.collection("quiz").find({idnumber:q.idnumber,course:q.course}).toArray(function(err, res) {
      if (err) throw err;
      if(res.length>1){
        console.log("true");
        ans=true;
      }else{
        console.log("false");
      }
      db.close();
    });
  });
  return ans;
};


app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

