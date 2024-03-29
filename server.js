require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const request = require('request');
const { env, allowedNodeEnvironmentFlags } = require('process');


const app = express();
const port = 3000;


let books = [];

app.use(cors());


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send('Hello World, from PolyGlot App');
});

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


app.listen(port, () => console.log(`PolyGlot App listening on port ${port}!`));