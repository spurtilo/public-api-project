import express from 'express';
import axios from 'axios';
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = 'https://v2.jokeapi.dev/joke/Any?idRange=';

function userNameAsNumber(name) {
    name = name.toLowerCase()
    let result = 0;
    
    for (let i = 0; i < name.length; i++) {
        result += name.charCodeAt(i);
    }
    return result % 310;
}

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

app.post('/submit', async (req, res) => {
    try {
        const fullName = `${req.body.firstName}${req.body.lastName}`;
        const firstID = userNameAsNumber(fullName);
        const lastID = firstID + 9;
    
        const result = await axios.get(API_URL + firstID + '-' + lastID + '&amount=10');
        const chosenJoke = findSafeJoke(result.data.jokes);
        const formattedJoke = formatJoke(chosenJoke);

        res.render('index.ejs', {
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