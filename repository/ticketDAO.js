const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const docClient = new AWS.DynamoDB.DocumentClient();

// =====================Tickets===========================
// Function to view all tickets
function getAllTickets() {
    const params = {
        TableName: 'tickets'
    };
    return docClient.scan(params).promise();
}

// Function to view all tickets by an employee
function getMyTickets(requester_id) {
    const params = {
        TableName: 'tickets',
        FilterExpression: '#i = :value',
        ExpressionAttributeNames: {
            '#i': 'requester_id'
        },
        ExpressionAttributeValues: {
            ':value': requester_id
        }
    };
    return docClient.scan(params).promise();
}

// Get ticket by id (used to check ticket status)
function getTicketById(ticket_id) {
    const params = {
        TableName: 'tickets',
        Key: {
            'ticket_id': ticket_id
        }
    };
    return docClient.get(params).promise();
}

// Function to submit a ticket
function submitTicket(ticket) {
    const params = {
        TableName: 'tickets',
        Item: ticket
    };
    return docClient.put(params).promise();
}

// Manager function to approve a ticket by id
function approveTicket(ticket_id){
    const params = {
        TableName: 'tickets',
        Key: {
            'ticket_id': ticket_id
        },
        UpdateExpression: 'set #s = :value',
        ExpressionAttributeNames: {
            '#s': 'status'
        },
        ExpressionAttributeValues: {
            ':value': 'Approved'
        }
    };
    return docClient.update(params).promise();
}
// Manager function to deny a ticket by id
function denyTicket(ticket_id){
    const params = {
        TableName: 'tickets',
        Key: {
            'ticket_id': ticket_id
        },
        UpdateExpression: 'set #s = :value',
        ExpressionAttributeNames: {
            '#s': 'status'
        },
        ExpressionAttributeValues: {
            ':value': 'Denied'
        }
    };
    return docClient.update(params).promise();
}

module.exports = {
    getAllTickets,
    getMyTickets,
    getTicketById,
    submitTicket,
    approveTicket,
    denyTicket
};