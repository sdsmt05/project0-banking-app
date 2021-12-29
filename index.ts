import express from 'express';
import Client from './entities/client';
import ClientDAO, {ClientDaoCosmosDb} from './daos/client-dao';
import Account from './entities/account';
import { ClientService, ClientServiceAccount } from './services/client-service';
import errorHandler from './errors/error-handler';


const app = express();
const clientDao: ClientDAO = new ClientDaoCosmosDb();
const clientService: ClientService = new ClientServiceAccount(clientDao);
app.use(express.json());

//Create a new client
app.post('/clients', async (req, res)=>{
    const client: Client = req.body;
    const addedClient: Client = await clientDao.createClient(client);
    res.status(201);
    res.send(addedClient);
});

//Get all clients
app.get('/clients', async (req, res)=>{
    const clients: Client[] = await clientDao.getAllClients();
    res.status(200);
    res.send(clients);
});

//Get client by id
app.get('/clients/:id', async (req, res)=>{
    try {
        const {id} = req.params;
        const client: Client = await clientDao.getClientById(id);
        res.send(client);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

//Update client by id
app.put('/clients/:id', async (req, res)=>{
    try {
        const {id} = req.params;
        const client: Client = req.body;
        client.id = id;
        const updatedClient: Client = await clientDao.updateClient(client);
        res.send(updatedClient);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

//Delete client by id
app.delete('/clients/:id', async (req, res)=>{
    try {
        const {id} = req.params;
        const deletedClient: Client = await clientDao.deleteClientById(id);
        res.status(205);
        res.send(deletedClient);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

//Create new account for a client
app.post('/clients/:id/accounts', async (req, res)=>{
    try {
        const account: Account = req.body;
        const updatedClient = await clientService.addAccountToClient(req.params.id, account);
        res.status(201);
        res.send(updatedClient);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

//Get accounts for a client
app.get('/clients/:id/accounts', async (req, res)=>{
    try {
        const {amountLessThan, amountGreaterThan} = req.query;
        const clientAccounts: Account[] = await clientService.getAccountsForClient(req.params.id, Number(amountLessThan), Number(amountGreaterThan));
        res.send(clientAccounts);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

//Deposit given ammount
app.patch('/clients/:id/accounts/:account/deposit', async (req, res)=>{
    try {
        const {id, account} = req.params;
        const {amount} = req.body;
        const updatedAccount: Account = await clientService.depositAmount(id, account, amount);
        res.send(updatedAccount);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

//Withdraw given amount
app.patch('/clients/:id/accounts/:account/withdraw', async (req, res)=>{
    try {
        const {id, account} = req.params;
        const {amount} = req.body;
        const updatedAccount: Account = await clientService.withdrawAmount(id, account, amount);
        res.send(updatedAccount);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

app.listen(3000, () => console.log("Server is started on port 3000"));