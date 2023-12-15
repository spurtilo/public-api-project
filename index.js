import express from 'express';
import axios from 'axios';
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// The URL includes URL parameters 'Any' (category parameter) and idRange.
// idRange allows you to specify a range of IDs and you will only get jokes inside that range.
const API_URL = 'https://v2.jokeapi.dev/joke/Any?idRange='; 

// The userNameAsNumber() function converts a user's name to a numerical value to determine the range of IDs for fetching jokes.
// It assigns Unicode points to each character in the name and returns their sum. This value is the starting ID for the range.
function userNameAsNumber(name) {
    name = name.toLowerCase()
    let result = 0;
    
    for (let i = 0; i < name.length; i++) {
        result += name.charCodeAt(i);
    }
    return result % 310; 
    // The maximum upper boundary for the ID range in this case is 319.
    // I needed to use a modulo to make sure that the start ID is not higher than 309.
}

// The findSafeJoke function goes through the array of 10 jokes and returns the first safe joke it finds.
// It has a fallback condition that returns the first joke if no safe joke is found.
function findSafeJoke(jokes) {
    let result = null;
    for (const joke of jokes) {
        if (joke.safe === true) {
            result = joke;
        }
    }
    if (!result) {
        return jokes[0];
    }
    return result;
}
// The formatJoke function checks the chosen joke's properties 'joke', 'setup' and 'delivery' for newline characters.
// If found, it replaces them with HTML <br> tags.
function formatJoke(input) {
    if (input.joke && input.joke.includes('\n')) {
        input.joke = input.joke.split('\n').join('<br>');
    }

    if (input.setup) {
        if (input.setup.includes('\n')) {
            input.setup = input.setup.split('\n').join('<br>');
        }
        else if (input.delivery.includes('\n')) {
            input.delivery = input.delivery.split('\n').join('<br>');
        }
    }
    return input;
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index.ejs');
});

// This method handles the /submit end point.
// The POST request is sent from an XML form and the request body contains a user's first and last name.
app.post('/submit', async (req, res) => {
    try {
        const fullName = `${req.body.firstName}${req.body.lastName}`;
        const firstID = userNameAsNumber(fullName); // The user's full name is passed as an argument to the userNameAsNumber() function.
        const lastID = firstID + 9; // The first ID of the range is returned and used to calculate the last ID.
    
        const result = await axios.get(API_URL + firstID + '-' + lastID + '&amount=10'); // I wanted to fetch the max amount of 10 jokes. Added another URL parameter 'amount'.
        const chosenJoke = findSafeJoke(result.data.jokes); // The result of GET request is passed to findSafeJoke(). It returns a joke that is marked as 'safe'.
        const formattedJoke = formatJoke(chosenJoke); // formatJoke() replaces newline characters with HTML <br> tags.

        res.render('index.ejs', { // Index.ejs is rendered and the joke is sent as a property named 'joke'
            joke: formattedJoke 
        });

        res.sendStatus(200);
    } catch (error) {
        console.log(error.message)
        res.status(500);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});