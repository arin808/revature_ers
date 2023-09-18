const express = require('express');
const app = express();
const port = 3000;

app.get('/ers', (req, res) => {
    res.send('Hello World!');
    });

app.get('/ers/allTickets', (req, res) => {
    res.send('Hello World!');
    });

app.get('/ers/myTickets/:id', (req, res) => {
    res.send('Hello World!');
    });
    
app.post('ers/register', (req, res) => {
    res.send('Hello World!');
    });

app.post('ers/login', (req, res) => {
    res.send('Hello World!');
    });

app.post('ers/submitTicket', (req, res) => {
    res.send('Hello World!');
    });

app.put('ers/updateTicket/:id', (req, res) => {
    res.send('Hello World!');
    });


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    });