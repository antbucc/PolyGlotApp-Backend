
var util= require('util');
var encoder = new util.TextEncoder('utf-8');
//var cor_st= require('core-js/stable');
var MongoClient = require('mongodb').MongoClient;
var config = require('./local_config.js');
const express = require('express');
const request = require('request');
var cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const { env, allowedNodeEnvironmentFlags } = require('process');

const app = express();
app.use(cors());
const port = 3000;

let books = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var url="mongodb://"+config.connection.host+":"+config.port+"/"+config.connection.database;
console.log("url database:  "+ url);

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db(config.connection.database);

  app.get('/', (req, res) => {
    res.send('Hello, from database  PolyGlot App!')
  })

  //example    GET /question?course=Corso-SE&topic=topic-class
  app.get('/question', (req, res) => {
    let c=req.query.course;
    let t= req.query.topic;
          dbo.collection(config.collNameQuizes).aggregate([{ $match: { course:c,topic:t} },{ $sample: { size: 1 } }  ]).toArray(function(err, _res) {
          if (err) throw err;
          res.send(_res);
        });  
  });

  app.get('/insert', (req, res) => {
    console.log("/insert");
    //autoConvertXML();
    insertFromXML('./json_data.json');
    res.send("{totalQuest:X, totalInsert: Y}");
  })

  app.get('/login', (req, res) => {

    let username = req.query.username;
    let password = req.query.password;
    let url =
        "http://93.104.214.51/dashboard/local/api/?action=login&username=" +
        username +
        "&password=" +
        password;
    request({
        method: 'POST',
        uri: url,
    },
        function (error, response, body) {

            // const myJson = JSON.stringify(response.body);
            var success = JSON.parse(response.body).success;
            console.log(JSON.parse(response.body));
            if (error) {
                console.log("this is my error:" + error);
                console.log("this is my response: " + response);
                res.send("error");
            }
            else if (success) {
                // here I have the student token
                console.log("Login with success");
                let currentToken = JSON.parse(response.body).response;
                var token = currentToken;
                res.send(currentToken);
            }
            else {
                res.send("no-login");
            }


        })

  });

  app.get('/role', (req, res) => {

    let token = req.query.token;
    let courseId = req.query.courseid;

    let url =
        "http://93.104.214.51/dashboard/local/api/?action=role&authtoken=" +
        token + "&courseid=" + courseId;
    request({
        method: 'POST',
        uri: url,
    },
        function (error, response, body) {

            var success = JSON.parse(response.body).success;
            if (error) {
                console.log("this is my error:" + error);
                console.log("this is my response: " + response);
                res.send("error");
            }
            else if (success) {
                // here I have the user role
                console.log("Role with success");
                let currentRole = JSON.parse(response.body).response;
                var role = currentRole;
                res.send(currentRole);
            }
            else {
                res.send("no-role");
            }


        })

});


app.get('/nextQuestion', (req, res) => {

    let token = req.query.token;
    let courseid = req.query.courseid;


    let url = "http://93.104.214.51/dashboard/local/api/?action=nextQuestion&courseid=" +
        courseid + "&authtoken=" + token;

    request({
        method: 'GET',
        uri: url,
    },
        function (error, response, body) {
            //  console.log(response);

            var success = JSON.parse(response.body).success;
            if (success) {
                var question = JSON.parse(response.body).response;

                res.send(question);

            } else {

                res.send("error");
            }


        })

}

);

app.get('/questionOptions', (req, res) => {

    let token = req.query.token;
    let questionid = req.query.questionid;

    let url = "http://93.104.214.51/dashboard/local/api/?action=questionOptions&authtoken=" +
        token + "&questionid=" + questionid;


    request({
        method: 'GET',
        uri: url,
    },
        function (error, response, body) {
            //  console.log(response);

            var success = JSON.parse(response.body).success;
            if (success) {
                var question = JSON.parse(response.body).response;

                res.send(question);

            } else {
                res.send("error");
            }


        })




}

);


app.get('/courses', (req, res) => {

    let token = req.query.token;
    let url = "http://93.104.214.51/dashboard/local/api/?action=availableCourses&authtoken=" +
        token;
    request({
        method: 'GET',
        uri: url,
    },
        function (error, response, body) {

            // const myJson = JSON.stringify(response.body);
            var success = JSON.parse(response.body).success;
            if (success) {
                var courses = JSON.parse(response.body).response;

                res.send(courses);

            } else {
                res.send("error");
            }


        })
});

app.get('/registeredCourses', (req, res) => {
    let playerId = req.query.playerId;
    let url = process.env.NODE_GE_STATUS + "/" + process.env.NODE_GAME_ID + "/" + playerId;
    // GAMIFICATION API ALL TO RETRIEVE THE PLAYER STATUS

    var options = {
        'method': 'GET',
        'url': url,
        'headers': {
            'Authorization': process.env.NODE_GE_AUTH,
            'Content-Type': 'application/json'
        }

    };

    request(options, function (error, response) {
        if (error) throw new Error(error);
        if (error) {
            res.send("error");
        }
        else if (response.statusCode == 200) {

            // here we return the courses registration done by the player
            var registrations = JSON.parse(response.body).customData.registrations;
            var finalRegistration = [];
            if (registrations != null) {
                registrations.forEach(function (value) {
                    let course = { id: value._id, title: value.title, registered: true };
                    finalRegistration.push(course);

                });
            }

            // const person = {firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"};
            res.send(finalRegistration);
        }

    });



});

app.get('/gameStatus', (req, res) => {

    let url = process.env.NODE_GE_STATUS + "/" + process.env.NODE_GAME_ID;
    var options = {
        'method': 'GET',
        'url': url,
        'headers': {
            'Authorization': process.env.NODE_GE_AUTH,
            'Content-Type': 'application/json'
        }

    };

    request(options, function (error, response) {
        if (error) throw new Error(error);
        if (error) {
            res.send("error");
        }
        else if (response.statusCode == 200) {
            res.send(response.body);
        }

    });


});



app.get('/playerStatus', (req, res) => {
    let playerId = req.query.playerId;
    let url = process.env.NODE_GE_STATUS + "/" + process.env.NODE_GAME_ID + "/" + playerId;
    //console.log(url);
    // GAMIFICATION API ALL TO RETRIEVE THE PLAYER STATUS

    var options = {
        'method': 'GET',
        'url': url,
        'headers': {
            'Authorization': process.env.NODE_GE_AUTH,
            'Content-Type': 'application/json'
        }

    };

    request(options, function (error, response) {
        if (error) throw new Error(error);
        if (error) {
            res.send("error");
        }
        else if (response.statusCode == 200) {
            res.send(response.body);
        }

    });


});

app.post('/registerCourse', (req, res) => {
    let playerId = req.body.playerId;
    let courseTitle = req.body.course.title;
    let courseId = req.body.course.id;


    let urlGE = process.env.NODE_GE_EXECUTION;

    var options = {
        'method': 'POST',
        'url': urlGE,
        'headers': {
            'Authorization': process.env.NODE_GE_AUTH,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "gameId": process.env.NODE_GAME_ID,
            "playerId": playerId,
            "actionId": "CourseRegistration",
            "data": {
                "id": courseId,
                "title": courseTitle
            }
        })

    };


    request(options, function (error, response) {

        if (error) throw new Error(error);
        if (error) {
            console.log("error: " + error);
            res.send("error");
        }
        else if (response.statusCode == 200) {
            console.log("course added to the player");
            res.send("OK");
        }
        else {
            console.log("CODICE ERRORE: " + response.statusCode);
        }

    });


});

app.post('/noAnswer', (req, res) => {
    let playerId = req.body.playerId;

    let urlGE = process.env.NODE_GE_EXECUTION;

    var options = {
        'method': 'POST',
        'url': urlGE,
        'headers': {
            'Authorization': process.env.NODE_GE_AUTH,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "gameId": process.env.NODE_GAME_ID,
            "playerId": playerId,
            "actionId": "noAnswer"
        })

    };


    request(options, function (error, response) {
        if (error) throw new Error(error);
        if (error) {
            res.send("error");
        }
        else if (response.statusCode == 200) {
            console.log("xp not updated for noAnswer - OK");
            res.send("OK");
        }

    });
});
app.post('/correctAnswer', (req, res) => {

    console.log("CORRECT ANSWER API INVOKED");

    let playerId = req.body.playerId;
    let difficulty = req.body.quiz.difficulty;
    let time = req.body.quiz.time;

    let urlGE = process.env.NODE_GE_EXECUTION;


    var options = {
        'method': 'POST',
        'url': urlGE,
        'headers': {
            'Authorization': process.env.NODE_GE_AUTH,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "gameId": process.env.NODE_GAME_ID,
            "playerId": playerId,
            "actionId": "correctAnswer",
            "data": {
                "difficulty": difficulty,
                "time": time
            }
        })

    };



    request(options, function (error, response) {
        if (error) throw new Error(error);
        if (error) {
            res.send("error");
        }
        else if (response.statusCode == 200) {
            console.log("CORRECT ANSWER API INVOKED: " + response);
            console.log("xp added at the player for correct answer - OK");
            res.send("OK");
        }

    });


});


app.post('/wrongAnswer', (req, res) => {

    let playerId = req.body.playerId;
    let difficulty = req.body.quiz.difficulty;

    let urlGE = process.env.NODE_GE_EXECUTION;


    var options = {
        'method': 'POST',
        'url': urlGE,
        'headers': {
            'Authorization': process.env.NODE_GE_AUTH,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "gameId": process.env.NODE_GAME_ID,
            "playerId": playerId,
            "actionId": "wrongAnswer",
            "data": {
                "difficulty": difficulty
            }
        })

    };


    request(options, function (error, response) {
        if (error) throw new Error(error);
        if (error) {
            res.send("error");
        }
        else if (response.statusCode == 200) {
            console.log("xp reduced for a wrong answer  - OK");
            res.send("OK");
        }

    });


});



app.post('/changeQuestion', (req, res) => {
    let playerId = req.body.playerId;

    let urlGE = process.env.NODE_GE_EXECUTION;

    var options = {
        'method': 'POST',
        'url': urlGE,
        'headers': {
            'Authorization': process.env.NODE_GE_AUTH,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "gameId": process.env.NODE_GAME_ID,
            "playerId": playerId,
            "actionId": "changeQuestion"
        })

    };


    request(options, function (error, response) {
        if (error) throw new Error(error);
        if (error) {
            res.send("error");
        }
        else if (response.statusCode == 200) {
            console.log("Bonus reduced for change question action - OK");
            res.send("OK");
        }

    });
});


app.post('/deleteAnswer', (req, res) => {
    let playerId = req.body.playerId;

    let urlGE = process.env.NODE_GE_EXECUTION;

    var options = {
        'method': 'POST',
        'url': urlGE,
        'headers': {
            'Authorization': process.env.NODE_GE_AUTH,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "gameId": process.env.NODE_GAME_ID,
            "playerId": playerId,
            "actionId": "deleteAnswer"
        })

    };


    request(options, function (error, response) {
        if (error) throw new Error(error);
        if (error) {
            res.send("error");
        }
        else if (response.statusCode == 200) {
            console.log("Bonus reduced for delete answer action - OK");
            res.send("OK");
        }

    });
});

app.post('/addTime', (req, res) => {
    let playerId = req.body.playerId;

    let urlGE = process.env.NODE_GE_EXECUTION;

    var options = {
        'method': 'POST',
        'url': urlGE,
        'headers': {
            'Authorization': process.env.NODE_GE_AUTH,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "gameId": process.env.NODE_GAME_ID,
            "playerId": playerId,
            "actionId": "addTime"
        })

    };


    request(options, function (error, response) {
        if (error) throw new Error(error);
        if (error) {
            res.send("error");
        }
        else if (response.statusCode == 200) {
            console.log("Bonus reduced for add time action - OK");
            res.send("OK");
        }

    });
});

  //******************************************************************************************************************************************* */

  //example    GET /analyticsSum
  app.get("/analyticsSum", (req, res) => {
    dbo.collection("analytics").find({},{projection:{category:1,title:1,"chart.options.chart.type":1}}).toArray(function(err, _res) {
      if (err) throw err;
      res.send(_res);
    });
  })

  //example    GET /analytics || /analytics?analyticId=1
  app.get("/analytics", (req, res) => {
    let id = req.query.analyticId;
    if (id == undefined) {
      dbo.collection("analytics").find({}).toArray(function(err, _res) {
        if (err) throw err;
        res.send(_res);
      });
    } else {
      dbo.collection("analytics").findOne({_id: id})
        .then(analytic => {
          res.send(analytic)
        })
        .catch(err => {
          console.error(err);
          res.statusCode = 500
          res.send("Server error")
        })
    }
  })

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
  
    arrTmp.forEach(q => {
  
    dbo.collection(config.collNameQuizes).find({idnumber:q.idnumber,course:q.course}).toArray(function(err, res) {
      if (err) throw err;
      if(res.length>0){
        console.log("La domanda: "+q.idnumber + " esiste già!"); 
      }else{
        dbo.collection(config.collNameQuizes).insertOne(q, function(err, res) {
          if (err) throw err;
        });
      }
      });
    });
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
      }

    };
    return newJson;
  }

  app.listen(port, () => {
    console.log(`PolyGlot App listening on port ${port}!`)
  })

});