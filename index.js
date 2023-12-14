import express from 'express';
import axios from 'axios';
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = 'https://v2.jokeapi.dev/joke/Any?idRange=';

function userNameAsNumber(name) {
    const letterValues = {
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
        'j': 10, 'k': 11, 'l': 12, 'm': 13, 'n': 14, 'o': 15, 'p': 16, 'q': 17,
        'r': 18, 's': 19, 't': 20, 'u': 21, 'v': 22, 'w': 23, 'x': 24, 'y': 25, 'z': 26,
        'å': 27, 'ä': 28, 'ö': 29
      };
    const nameArray = name.split('');
    let result = 0;
    
    nameArray.forEach(letter => {
        if (letter in letterValues) {
            result += letterValues[letter];
        }
    });
    return result;
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
        const fullName = `${req.body.firstName}${req.body.lastName}`.toLowerCase()
        const firstID = userNameAsNumber(fullName);
        const lastID = firstID + 9
    
        const result = await axios.get(API_URL + firstID + '-' + lastID + '&amount=10');
        const jokeToDisplay = findSafeJoke(result.data.jokes);
        console.log(jokeToDisplay);
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