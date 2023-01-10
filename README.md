# PolyGlotApp-Backend
Backend of the PolyGlot App

## To run the server use the following command:
`node dbServer.js`

or

`npm start`

***

## Setting

### Installation Node.js
[Download nodejs](https://nodejs.org/it/download/)

*Check the version*
```
> node -v
v16.15.0
```

### Installation Mongodb server
[Download Mongodb](https://www.mongodb.com/docs/manual/administration/install-community/)

***
### List of packages to install before starting the server

```
npm install mongodb
```

### Collection to create in the database before starting the server

- quiz (data taken from `quiz_data.json`):
> - Create "quiz" collection on db
> - Make a POST /insert call to the server
> - Temporary action: edit the course property in the collection to uniform the courses name with those used in the app (es. Corso-SE -> Software Engineering)
- analytics (data taken from `analytics_data.json`):
> - Create "analytics" collection on db
> - Add data from file
- answers (data taken from `answers_data.json`)
> - Create "answers" collection on db
> - Add data from file