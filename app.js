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
            res.status(400).send(JSON.stringify(error.response.message));
    })
})

app.listen(3000);