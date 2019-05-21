const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const fetch = require('node-fetch').default;

const app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls
router.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

router.get("/api/challonge/participant-with-matches/:participantId", (req, res) => {
  const apiUrl = `https://api.challonge.com/v1/tournaments/devb_foosball_3rd_edition_spring_2019_no_rematch/participants/${req.params.participantId}.json?api_key=7tYfjTECb4ss76n6VorKQOKBJ6U2jUfamCUcA7K6&include_matches=1`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      res.send({ data });
    })
    .catch(err => {
      res.redirect('/error');
    });
});

router.get("/api/challonge/participants", (req, res) => {
  const apiUrl = "https://api.challonge.com/v1/tournaments/devb_foosball_3rd_edition_spring_2019_no_rematch/participants.json?api_key=7tYfjTECb4ss76n6VorKQOKBJ6U2jUfamCUcA7K6";

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      res.send({ data });
    })
    .catch(err => {
      res.redirect('/error');
    });
});

router.post('/api/world', (req, res) => {
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.use('/.netlify/functions/server', router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
