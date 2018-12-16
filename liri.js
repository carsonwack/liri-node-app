var inquirer = require('inquirer');
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require('fs');



// Using inquirer to get the user command
var askQuestion = function () {
  inquirer.prompt([
    {
      type: 'list',
      name: 'command',
      message: 'What do you want to do?',
      choices: ['Concert This', 'Spotify a Song', 'Movie This', 'Do What it Says']
    },
  ]).then(function (answers) {

    if (answers.command === 'Spotify a Song') {

      // Also using inquirer to get the specific request (spotify api for user's song)
      inquirer.prompt([
        {
          name: 'whatSong',
          message: 'What Song?'
        }
      ]).then(function (answers) {

        spotifyCall(answers.whatSong);

      });

    }

    else if (answers.command === 'Concert This') {
      // Same here but find concerts for a band
      inquirer.prompt([
        {
          name: 'whatBand',
          message: 'What Band?'
        }
      ]).then(function (answers) {

        answers.whatBand = answers.whatBand.split(' ').join('+');

        bandsCall(answers.whatBand);

      });

    }

    else if (answers.command === 'Movie This') {
      // Same here but find movie info
      inquirer.prompt([
        {
          name: 'whatMovie',
          message: 'What Movie?'
        }
      ]).then(function (answers) {

        if (answers === '') {
          answers = 'Mr. Nobody';
        }

        answers.whatMovie = answers.whatMovie.split(' ').join('+');

        omdbCall(answers.whatMovie);

      });
    }

    else if (answers.command === 'Do What it Says') {
      // This part reads the text from random.txt
      // When i comes across quotes, it gathers the string --> spotString--and makes the spotify call with it
      fs.readFile('random.txt', 'utf8', function (error, data) {
        let flag = false;
        let spotString = '';
        for (i = 0; i < data.length; i++) {
          if (data[i] === '"') {
            flag = true;
          }
          else if (data[i] === '"') {
            flag = false;
          }
          if (flag) {
            spotString += data[i];
          }
        }
        spotifyCall(spotString);

      })
    }
  })
};


// Inquirer function invoked
askQuestion();



// API call functions (coded below, but invoked ^^ for cleaner aesthetic)

var divider = "\n------------------------------------------------------------\n\n";

function spotifyCall(querySearch) {
  var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret,
  });
  spotify
    .search({ type: 'track', query: querySearch, limit: 1 })
    .then(function (response) {

      let logArray = [
        'Song Name: ' + response.tracks.items[0].name,
        'Artists: ' + response.tracks.items[0].artists[0].name,
        'Preview URL: ' + response.tracks.items[0].preview_url,
        'Album: ' + response.tracks.items[0].album.name
      ].join('\n');

      console.log('\n\n\n');
      console.log('--Top Hit--');
      console.log('\n');
      console.log(logArray);
      console.log('\n\n\n\n');
      appendToFile('\n\n');
      appendToFile(logArray + divider);
    });
}

function bandsCall(querySearch) {
  request("https://rest.bandsintown.com/artists/" + querySearch + "/events?app_id=codingbootcamp", function (error, response, body) {

    console.log('\n\n\n');

    for (var i = 0; i < JSON.parse(body).length; i++) {
      console.log('Venue Name: ' + JSON.parse(body)[i].venue.name);
      console.log('Venue Location: ' + JSON.parse(body)[i].venue.city + ', ' + JSON.parse(body)[i].venue.country);
      console.log('Event Date: ' + JSON.parse(body)[i].datetime);
      console.log('\n\n\n\n');
      appendToFile('Venue Name: ' + JSON.parse(body)[i].venue.name);
      appendToFile('Venue Location: ' + JSON.parse(body)[i].venue.city + ', ' + JSON.parse(body)[i].venue.country);
      appendToFile('Event Date: ' + JSON.parse(body)[i].datetime);
      appendToFile('\n\n\n\n');
    }
  });
}

function omdbCall(querySearch) {
  request("http://www.omdbapi.com/?t=" + querySearch + "&y=&plot=short&apikey=trilogy", function (error, response, body) {

    console.log('\n\n\n');
    console.log('Title: ' + JSON.parse(body).Title);
    console.log('Year: ' + JSON.parse(body).Year);
    for (var i in JSON.parse(body).Ratings) {
      if (JSON.parse(body).Ratings[i].Source === "Internet Movie Database") {
        console.log('IMDB Rating: ' + JSON.parse(body).Ratings[i].Value);
      }
      if (JSON.parse(body).Ratings[i].Source === "Rotten Tomatoes") {
        console.log('Rotten Tomatoes Rating: ' + JSON.parse(body).Ratings[i].Value);
      }
    }
    console.log('Country (Production Location): ' + JSON.parse(body).Country);
    console.log('Language: ' + JSON.parse(body).Language);
    console.log('Plot: ' + JSON.parse(body).Plot);
    console.log('Actors: ' + JSON.parse(body).Actors);
    console.log('\n\n\n\n');

  });
}

function appendToFile(textToAppend) {
  fs.appendFile('log.txt', textToAppend + '\n', function (err) {
    if (err) throw err;
  });
}

