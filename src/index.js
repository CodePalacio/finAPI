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

app.listen(3030);