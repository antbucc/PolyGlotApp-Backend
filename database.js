var util= require('util');
//var encoder = new util.TextEncoder('utf-8');
var cor_st= require('core-js/stable');
var MongoClient = require('mongodb').MongoClient;

//riga di esempio
var row1= require('./quiz1.json');


// Connection URL
var url="mongodb://localhost:27017/db_quiz";

console.log("mi connetto a "+ url);


MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("connesso");

  var dbo = db.db("db_quiz");
  dbo.collection("quiz").insertOne(row1, function(err, res) {
    if (err) throw err;

    console.log("1 document inserted");
    db.close();
  });
  
});