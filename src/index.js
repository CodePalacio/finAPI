const express = require('express');
const { v4 }  = require('uuid');

const app = express();

app.use(express.json());

const clientes = [];

/**
* CPF - string
* name - string
* id - uuid
* statement []
*/

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

app.get("/statement", (request, response) => {
    const { cpf } = request.headers;
    const customer = clientes.find((clientes) => clientes.cpf === cpf);

    if(!customer){
        return response.status(400).json({error: "Cliente não encontrado"});
    }

    return response.json(customer.statement) 
});

app.listen(3030); 