const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

// User based functions
// Create a new user (register)
function createUser(user) {
    const params = {
        TableName: 'users',
        Item: user
    };
    return docClient.put(params).promise();
}

// Find user to see if username is taken 
function getUsername(username) {
    const params = {
        TableName: 'users',
        FilterExpression: '#u = :value',
        ExpressionAttributeNames: {
            '#u': 'username',
        },
        ExpressionAttributeValues: {
            ':value': username,
        },
    };
    return docClient.scan(params).promise();
}

// Find a user (login)
function getUser(username, password){
    const params = {
        TableName: 'users',
        FilterExpression: '#u = :value1 AND #p = :value2',
        ExpressionAttributeNames: {
            '#u': 'username',
            '#p': 'password'
        },
        ExpressionAttributeValues: {
            ':value1': username,
            ':value2': password
        },
        Limit: 1
    };
    return docClient.scan(params).promise();
}

module.exports = { 
    createUser, 
    getUser,
    getUsername
};