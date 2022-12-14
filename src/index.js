const express = require('express');
const { v4 }  = require('uuid');

const app = express();

app.use(express.json());

const clientes = [];

// Middleware
function verificaSeContaExisteCPF(request, response, next){
    const { cpf } = request.headers;
    const customer = clientes.find((clientes) => clientes.cpf === cpf);

    if(!customer){
        return response.status(400).json({error: "Cliente não encontrado!"})
    }

    request.customer = customer;

    return next();
}

function getBalance(statement){
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === "credit"){
            return acc + operation.amount;
        }else {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}


app.post("/conta", (request, response) => {
    const { cpf, name } = request.body;

    const clienteJaExiste = clientes.some((clientes) => clientes.cpf === cpf);
    if(clienteJaExiste){
        return response.status(400).json({ error: "Cliente já existe!" });
    }

    clientes.push({
        cpf,
        name,
        id: v4(),
        statement: []
    });

    return response.status(201).send();
});

app.get("/statement", verificaSeContaExisteCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer.statement) 
});

app.post("/deposito", verificaSeContaExisteCPF, (request, response) => {
    const { description, amount } = request.body;
    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.post("/saque", verificaSeContaExisteCPF,(request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if(balance < amount){
        return response.status(400).json({error: "Fundos insuficientes!"})
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.get("/statement/date", verificaSeContaExisteCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString());

    return response.json(statement) 
});

app.put("/conta", verificaSeContaExisteCPF, (request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();
});

app.get("/conta", verificaSeContaExisteCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer)
})

app.delete("/conta", verificaSeContaExisteCPF, (request, response) => {
    const { customer } = request;

    clientes.splice(customer, 1)

    return response.status(200).json(clientes);
});

app.get("/balance", verificaSeContaExisteCPF, (request, response) => {
    const { customer } = request;
    const balance = getBalance(customer.statement);

    return response.json(balance);
});

app.listen(3030);