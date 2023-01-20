
var util = require('util');
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
const { Console } = require('console');
const { response } = require('express');
const { serverResearch } = require('./analyticsDDSP');

const app = express();
app.use(cors());
const port = 3000;

let books = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const url = process.env.MONGODB_URI;

//var url = "mongodb://" + config.connection.host + ":" + config.port + "/" + config.connection.database;
console.log("url database:  " + url);

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(config.connection.database);

    app.get('/', (req, res) => {
        res.send('Hello, from database  PolyGlot App!')
    })

    //example    GET /question?course=Corso-SE&topic=topic-class
    app.get('/question', (req, res) => {
        let c = req.query.course;
        let t = req.query.topic;
        let id = req.query.id;
        let aggregation = (Number.parseInt(id) != NaN) ? [{ $match: { idnumber: id } }] : [{ $match: { course: c, topic: t } }, { $sample: { size: 1 } }];
        dbo.collection(config.collNameQuizes).aggregate(aggregation).toArray(function (err, _res) {
            if (err) throw err;
            res.send(_res);
        });
    });

    app.get('/questions', (req, res) => {
        let c = req.query.course;
        //let c=req.query.topic;
        let createarr = [];
        var _a_tr = new Object();


        let qz = req.query.quizzes;
        //let aggregation = qz == undefined ? [{ $match: { topic:c } }] : [{ $match: { topic:c, idnumber: { $in: qz.split(",") } } }];
        let aggregation = qz == undefined ? [{ $match: { course: c } }] : [{ $match: { course: c, idnumber: { $in: qz.split(",") } } }];

        dbo.collection(config.collNameQuizes).aggregate(aggregation).toArray(function (err, _res) {
            if (err) throw err;
            /* _res.forEach(element => {
                 _a_tr.topic = element.topic;
                 _a_tr.questiontext = element.questiontext;
                 let m=JSON.stringify(_a_tr);
                 createarr.push(JSON.parse(m));
             });
             res.send(createarr);*/
            _res.sort();
            res.send(_res);
        });
    });

    app.get('/insert', (req, res) => {
        console.log("/insert");
        //autoConvertXML();
        insertFromXML('./quiz_data.json');
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

    function getRoles(token, courseId) {
        return new Promise((resolve, reject) => {
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
                        reject("error");
                    }
                    else if (success) {
                        // here I have the user role
                        console.log("Role with success");
                        let currentRole = JSON.parse(response.body).response;
                        resolve(currentRole);
                    }
                    else {
                        resolve("no-role");
                    }
                })
        })
    }

    app.get('/role', (req, res) => {

        let token = req.query.token;
        let courseId = req.query.courseid;

        getRoles(token, courseId).then(roles => res.send(roles));

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

    function getPathTarget(target, path, strictPath) {
        let again = true;
        let i = 0;
        const limit = path.length - 1;
        while (again && i < limit) {
            if (target[path[i]] != undefined) {
                target = target[path[i]];
            } else if (strictPath) {
                again = false;
            } else {
                target = target[path[i]] = {};
            }
            i++;
        }
        if ((again && target[path[limit]] != undefined) || !strictPath) {
            return target;
        } else {
            return null;
        }
    }

    //example    GET /analyticsSum
    app.get("/analyticsSum", async (req, res) => {

        let token = req.query.token;
        let courseId = req.query.courseid;
        let category = Number(req.query.category);

        let send = true;

        let roles = await getRoles(token, courseId);
        switch (roles) {
            case "error":
                throw new Error("Invalid parameters");
            case "no-role":
                roles = ["no-role"]
                break;
            default:
                roles = (roles.some(role => role.shortname === 'student')) ? ["student"] : roles.map(role => role.shortname);
                break;
        }
        //roles = ["teacher"];

        let aggregation = [{
            $match: { permissions: { $in: roles } }
        },
        {
            $project: {
                title: 1,
                category: 1,
                custom: 1,
                "chart.options.chart.type": { $ifNull: ["$chart.options.chart.type", ""] },
                buildTable: { $cond: [{ $ifNull: ["$table", false] }, true, false] },
                /*buildFilters: { $cond: [{ $ifNull: ["$filters", false] }, true, false] }*/
            }
        }];

        if (category != undefined && Number.isNaN(category)) {
            res.send([]);
            send = false;
        } else if (category != undefined) {
            aggregation.push({ $match: { category: category } })
        }
        if (send) {
            dbo.collection(config.collNameAnalytics).aggregate(aggregation).toArray(function (err, _res) {
                if (err) throw err;
                res.send(_res);
            });
        }
    })

    //example    GET /analytics || /analytics?id=1
    app.get("/analytics", (req, res) => {

        let tmpChart, fn, last;

        let id = req.query.id;
        if (id == undefined) {
            dbo.collection(config.collNameAnalytics).find({}).toArray(function (err, _res) {
                if (err) throw err;
                res.send(_res);
            });
        } else {
            dbo.collection(config.collNameAnalytics).findOne({ _id: id })
                .then(analytic => {
                    tmpChart = analytic.chart;
                    if (tmpChart != undefined && tmpChart.functions != undefined && tmpChart.functions.length) {
                        //Convert functions parameters and body into functions
                        for (const path of tmpChart.functions) {
                            fn = getPathTarget(tmpChart["options"], path, true);
                            if (fn != null) {
                                last = path.length - 1;
                                fn[path[last]] = Function(
                                    fn[path[last]].arguments,
                                    fn[path[last]].body
                                );
                            }
                        }
                    }
                    res.send(analytic)
                })
                .catch(err => {
                    console.error(err);
                    res.statusCode = 500
                    res.send("Server error")
                })
        }
    })

    app.get("/analyticsData", async (req, res) => {
        let id = req.query.id;
        let customData = req.query.customData != undefined ? req.query.customData : false;
        let params = data = {};
        let currentParams, toAssign;

        if (serverResearch[id] != undefined) {
            for (const key of Object.keys(serverResearch[id])) { //Execute all research
                currentParams = serverResearch[id][key];
                for (const param of Object.keys(currentParams.assignments)) { //Assign all request's query params
                    for (const path of currentParams.assignments[param]) { //Put a param in all its destinations
                        toAssign = getPathTarget(currentParams.query, path, true);
                        if (toAssign != null) {
                            toAssign[path[path.length - 1]] = req.query[param];
                        }
                    }
                }
                data[key] = await dbo.collection(currentParams.collection).aggregate(currentParams.query).toArray();
            }
        }
        if (customData) { //Special data research or server-side edits of the found data
            params = req.query;
            delete params.id;
            switch (id) {
                default:
                    console.log("There aren't no custom data for this analytic");
                    break;
            }
        }
        res.send(data);
    });

    /**
     * Auto convert file using python (XML->JSON)
     */
    function autoConvertXML() {
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
    function insertFromXML(file) {
        var quizes = require(file);
        let arrTmp = createNewJSON(quizes.quiz.question);

        arrTmp.forEach(q => {

            dbo.collection(config.collNameQuizes).find({ idnumber: q.idnumber, course: q.course }).toArray(function (err, res) {
                if (err) throw err;
                if (res.length > 0) {
                    console.log("La domanda: " + q.idnumber + " esiste già!");
                } else {
                    dbo.collection(config.collNameQuizes).insertOne(q, function (err, res) {
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
    function createNewJSON(qJson) {
        var newJson = [];
        let question;
        let i = 0;
        let q = {
            idnumber: "",
            type: "",
            name: "",
            questiontext: "",
            generalfeedback: "",
            correctfeedback: "",
            partiallycorrectfeedback: "",
            incorrectfeedback: "",
            difficulty: "",
            topic: "",
            course: "",
            answer: []
        }
        for (i = 0; i < qJson.length; i++) {
            question = qJson[i];
            let tmp = JSON.stringify(question).replace('@', '');
            question = JSON.parse(tmp);
            if (question.type != "category") {
                q.idnumber = question.idnumber;
                q.type = question.type;
                q.name = question.name.text
                q.questiontext = question.questiontext.text;
                q.generalfeedback = question.generalfeedback.text;
                q.correctfeedback = question.correctfeedback.text;
                q.partiallycorrectfeedback = question.partiallycorrectfeedback.text;
                q.incorrectfeedback = question.incorrectfeedback.text;
                q.difficulty = question.tags.tag[1].text;
                q.topic = question.tags.tag[0].text;
                q.course = question.tags.tag[2].text;

                let counter = 0;
                question.answer.forEach(ans => {
                    tmp = JSON.stringify(ans).replace('@', '');
                    ans = JSON.parse(tmp);
                    tmp = JSON.stringify(ans).replace('@', '');
                    ans = JSON.parse(tmp);
                    let a = {
                        fraction: ans.fraction,
                        format: ans.format,
                        text: ans.text
                    };
                    q.answer[counter] = a;
                    counter++;
                });
                let m = JSON.stringify(q);
                newJson.push(JSON.parse(m));
            }

        };
        return newJson;
    }

    /************************************************************************************************************ */
    //NEW COLLECTION ANSWER

    /**
     * 
     * @param {*} file JSON con query Answer da inserire in mongodb
     */
    function insertAnswerFromPOST(file) {
        console.log(file);
        console.log("INSERT ANSWER IN MONGODB");
        dbo.collection(config.collNameAnswer).find({ playerid: file.playerid, "question.idnumber": file.question.idnumber, "question.course": file.question.course }).toArray(function (err, res) {
            if (err) throw err;
            if (res.length > 0) {
                console.log("ERROR");
                console.log("L'utente: " + file.playerid + " con il quiz " + file.questionid + " del corso " + file.course + " esiste già!");
            } else {
                dbo.collection(config.collNameAnswer).insertOne(file, function (err, res) {
                    if (err) throw err;
                });
            }
        });
    }

    // /saveAnswer?playerId=11111&questionid=222222&course=SE&time=TIME&outcome=OK
    app.post('/saveAnswer', async (req, res) => {

        console.log("SAVE ANSWER API INVOKED");

        let response = {
            playerid: req.query.playerId,
            question: await dbo.collection(config.collNameQuizes).findOne({
                idnumber: req.query.questionid,
                course: req.query.course,
            }, {
                projection: {
                    _id: 0,
                    idnumber: 1,
                    name: 1,
                    topic: 1,
                    course: 1,
                    type: 1,
                    difficulty: 1,
                    questiontext: 1,
                    answer: 1,
                }
            }),
            date: new Date().toISOString(),
            time: req.query.time,
            outcome: req.query.outcome
        };
        insertAnswerFromPOST(response);

        res.end(JSON.stringify(response));
    });

    app.get('/answers', (req, res) => {
        let params = {
            playerid: req.query.playerId,
            "question.idnumber": req.query.questionid,
            "question.course": req.query.course,
            date: req.query.date,
            time: req.query.time,
            outcome: req.query.outcome,
        }
        let aggregation = [{ $match: {} }, { $sort: { date: -1 } }];
        for (const key of Object.keys(params)) {
            if (params[key] != undefined) {
                aggregation[0].$match[key] = params[key];
            }
        }
        dbo.collection(config.collNameAnswer).aggregate(aggregation).toArray((err, _res) => {
            if (err) throw err;
            res.send(_res);
        });
    });

    /************************************************************************************************************ */
    //NEW POST INSERT FROM MOODLE
    app.post('/insertFromMoodle', (req, res) => {

        console.log("insertFromMoodle API INVOKED");
        let timestamp = new Date();
        let json_quest = Object.keys(req.body);
        let j_quest = JSON.parse(json_quest[0]);

        console.log("j_quest.OLDQuestion --> " + j_quest.OLDQuestion);
        if (j_quest.OLDQuestion != 0) {
            insertUpdateFromMoodle(j_quest.corso, j_quest.OLDQuestion, json_quest.timestamp);//Corso-SE
        } else {
            let response = {
                //idnumber:req.body.idnumber,
                idnumber: j_quest.id,
                type: j_quest.type,
                name: j_quest.name,
                questiontext: j_quest.questiontext,
                generalfeedback: j_quest.generalfeedback,
                correctfeedback: j_quest.correctfeedback,
                partiallycorrectfeedback: j_quest.partiallycorrectfeedback,
                incorrectfeedback: j_quest.incorrectfeedback,
                difficulty: j_quest.difficulty,
                topic: j_quest.topic,
                course: j_quest.corso,
                timestamp: timestamp
            };

            //console.log(response);
            insertQuestionFromMoodle(response);
        }
        res.end("OK");

    });

    /**
     * 
     * @param {*} n numero della domanda scelta data da una lista /questions
     * @param {*} datetime data e ora dell'invio della domanda
     */
    function insertUpdateFromMoodle(c, n, datetime) {
        let qz;
        let aggregation = qz == undefined ? [{ $match: { course: c } }] : [];

        dbo.collection(config.collNameQuizes).aggregate(aggregation).toArray(function (err, _res) {
            if (err) throw err;
            _res.sort();
            let quest = _res[n - 1];
            //console.log(_res);
            console.log("----------------------------------------------------------------------------------------------------------");
            console.log(_res[n]);
            quest.idnumber = "";
            quest.datetime = datetime;
            console.log("AGGIORNO UNA DOMANDA");
            insertQuestionFromMoodle(quest);
        });
    }


    /**
       * 
       * @param {*} file JSON con query da inserire in mongodb
       */
    function insertQuestionFromMoodle(file) {
        //console.log(file);
        console.log("INSERT QUESTION IN MONGODB");
        console.log("idnumber   " + file.idnumber + "  type string? " + (typeof file.idnumber == "string"));
        dbo.collection(config.collNameQuizes).find({ idnumber: file.idnumber, course: file.course }).toArray(function (err, res) {
            if (err) throw err;
            if (res.length > 0) {
                console.log("La domanda: " + file.idnumber + " esiste già!");
            } else {
                dbo.collection(config.collNameQuizes).insertOne(file, function (err, res) {
                    if (err) throw err;
                });
            }
        });
    }
    /******************************************************************** */
    app.listen(port, () => {
        console.log(`PolyGlot App listening on port ${port}!`)
    })

});