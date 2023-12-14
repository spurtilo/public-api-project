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
    for (const joke of jokes) {
        if (joke.safe === true) {
            return joke;
        }
    }
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
        console.log(firstID)
        const lastID = firstID + 9;
        console.log(API_URL + firstID + '-' + lastID + '&amount=10')
    
        const result = await axios.get(API_URL + firstID + '-' + lastID + '&amount=10');
        const jokeToDisplay = findSafeJoke(result.data.jokes);
        res.render('index.ejs', {
            joke: jokeToDisplay
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