const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/api', (req, res) => {
    let target = req.body['target'];
    axios.get(target)
        .then((response) => {
            res.send(JSON.stringify(response.data));
        }).catch((error) => {
        if (error.response) {
            res.status(400).send(error.response.data);
        } else if (error.request) {
            res.status(400).send(error.request);
        } else {
            res.status(400).send('Error', error.message);
        }
    })
})

app.listen(3000);