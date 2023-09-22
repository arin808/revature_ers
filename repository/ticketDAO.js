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

// Function to view all pending tickets 
function getPendingTickets() {
    // Create params object for DynamoDB query
    const params = {
        TableName: 'tickets',
        FilterExpression: '#s = :value',
        ExpressionAttributeNames: {
            '#s': 'status'
        },
        ExpressionAttributeValues: {
            ':value': 'Pending'
        }
    };
    return docClient.scan(params).promise();
}

// Function to view all tickets by an employee
function getMyTickets(requester_id) {
    // Create params object for DynamoDB query
    // Utilize one paramater (requester_id) to find all tickets by an employee
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

// Manager function to provess a ticket by id
function processTicket(ticket_id, status){
    // Create params object for DynamoDB query
    // Utilize update expression to change status to updated status
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
            ':value': status
        }
    };
    return docClient.update(params).promise();
}


module.exports = {
    getAllTickets,
    getPendingTickets,
    getMyTickets,
    getTicketById,
    submitTicket,
    processTicket
};