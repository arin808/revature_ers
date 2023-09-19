// Check if username is already taken
function validateUser(req, res, next) {
    if(!req.body.username || !req.body.password) {
        req.body.valid = false;
        res.status(400);
        res.send('Invalid user data');
        next();
    } else{
        req.body.valid = true;
        next();
    }
}

// Ensure ticket data is valid
function validateTicket(req, res, next) {
    if(!req.body.requester_id || !req.body.amount || !req.body.description) {
        req.body.valid = false;
        res.status(400);
        res.send('Invalid ticket data');
        next();
    } else{
        req.body.valid = true;
        next();
    }
}


module.exports = {
    validateUser,
    validateTicket
};