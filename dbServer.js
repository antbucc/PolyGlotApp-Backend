
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

//example    GET /question?course=Corso-SE&topic=Topic-ClassDiagram
app.get('/question', (req, res) => {
    let c=req.query.course;
    let t= req.query.topic;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db(config.connection.database);
          dbo.collection("quiz").aggregate([{ $match: { course:c,topic:t} },{ $sample: { size: 1 } }  ]).toArray(function(err, _res) {
          if (err) throw err;
          console.log(_res);
          res.send(_res);
          db.close();
        });  
      });

  })






app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

