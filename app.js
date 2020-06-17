const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/api', (req, res) => {
    let target = req.body['target'];
    res.send(target);
})

app.listen(3000);