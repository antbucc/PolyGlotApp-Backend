//Analytics Dynamic Data Search Parameters

const config = require("./local_config");
let topicOutcomes;

const baseParams = {
  "0": {
    data: {
      assignments: {
        course: [[0,"$match","question.course"]]
      },
      collection: config.collNameAnswer,
      query: [
        {
          $match: {}
        },
        {
          $group: {
            _id: {
              questionid: "$question.idnumber",
              name: "$question.name",
              outcome: "$outcome"
            },
            date: { $min: "$date" }, //At the moment there isn't a creation data for a quiz, so we take the first response
            students: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              questionid: "$_id.questionid",
              name: "$_id.name",
            },
            date: { $first: "$date" },
            outcomes: {
              $push: {
                code: "$_id.outcome",
                students: "$students"
              }
            }
          }
        },
        {
          $sort: { date: -1 }
        }
      ]
    }
  },
  "1": (topicOutcomes = {
    data: {
      assignments: {
        course: [
          [0,"$match","question.course"],
        ]
      },
      collection: config.collNameAnswer,
      query: [
        {
          $match: {}
        },
        {
          $group: {
            _id: {
              topic: "$question.topic",
              outcome: "$outcome"
            },
            students: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.topic",
            outcomes: {
              $push: {
                code: "$_id.outcome",
                students: "$students"
              }
            }
          }
        }
      ]
    },
    topicQuizzes: {
      assignments: {
        course: [
          [0,"$match","question.course"],
        ]
      },
      collection: config.collNameAnswer,
      query: [
        {
          $match: {}
        },
        {
          $group: {
            _id: {
              topic: "$question.topic",
              questionid: "$question.idnumber"
            }
          }
        },
        {
          $group: {
            _id: "$_id.topic",
            quizzes: { $sum: 1 }
          }
        }
      ]
    }
  }),
  "4": topicOutcomes,
  "5": topicOutcomes,
};

module.exports = { baseParams };