// Express app and variable setup
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const router = require('./routes/router.js');

app.use('/ers', router);

// Start server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});