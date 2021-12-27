import ClientDAO, { ClientDaoCosmosDb } from "../daos/client-dao";
import Account from "../entities/account";
import Client from "../entities/client";
import { ClientService, ClientServiceAccount } from "../services/client-service";
import { ResourceNotFoundError, InsufficientFundsError } from "../errors/error-handler";

const clientDao: ClientDAO = new ClientDaoCosmosDb();
const clientService: ClientService = new ClientServiceAccount(clientDao);
let savedClient: Client = null;
let allClients: Client[] = null;

describe("Banking Client Dao Tests", ()=>{

    it("Should create a client", async ()=>{
        const newClient: Client = {id: "", fname: "Donald", lname: "Duck", accounts: [{name: "Checking", balance: 400}]};
        savedClient = await clientDao.createClient(newClient);
        expect(savedClient.id).not.toBeFalsy();
    })

    it("Should get all clients", async ()=>{
        allClients = await clientDao.getAllClients();
        expect(allClients.length).toBeGreaterThan(0);
    })

    it("Should get client by id", async ()=> {
        const client: Client = await clientDao.getClientById(savedClient.id);
        expect(client.fname).toBe("Donald");
        expect(client.lname).toBe("Duck");
    })

    it("Should throw error if client can't be found", async ()=> {
        expect(async ()=> {
            await clientDao.getClientById("invalid-id"); 
        }).rejects.toThrowError(ResourceNotFoundError);
    })

    it("Should update client by id", async ()=> {
        const updatedClient: Client = {id: savedClient.id, fname: "Minnie", lname: "Mouse", accounts: [{name: "Checking", balance: 400}]};
        await clientDao.updateClient(updatedClient);

        const retrievedClient: Client = await clientDao.getClientById(updatedClient.id);
        expect(retrievedClient.fname).toBe("Minnie");
        expect(retrievedClient.lname).toBe("Mouse");
    })

    it("Should throw error when trying to update client who can't be found", async ()=> {
        const nonExistingClient: Client = {id: "invalid-id", fname: "Daffy", lname: "Duck", accounts: []};
        expect(async ()=> {
            await clientDao.updateClient(nonExistingClient);
        }).rejects.toThrowError(ResourceNotFoundError);
    })

    it("Should delete client by id", async ()=> {
        await clientDao.deleteClientById(savedClient.id);
        expect(async ()=> {
            await clientDao.getClientById(savedClient.id);
        }).rejects.toThrowError(ResourceNotFoundError);
    })

    it("Should throw error when trying to delete client who can't be found", async ()=> {
        expect(async ()=> {
            await clientDao.deleteClientById("invalid-id"); 
        }).rejects.toThrowError(ResourceNotFoundError);
    })    
})

describe("Banking Account Service Tests", ()=>{

    it("Should add new account to client", async ()=>{
        const newClient: Client = {id: "", fname: "Bugs", lname: "Bunny", accounts: [{name: "Checking", balance: 400},{name: "McMuffin Fund", balance: 800}]};
        const newAccount: Account = {name: "Vacation Fund", balance: 2000};
        savedClient = await clientDao.createClient(newClient);
        savedClient = await clientService.addAccountToClient(savedClient.id, newAccount);
        savedClient = await clientDao.getClientById(savedClient.id);
        expect(savedClient.accounts).toContainEqual<Account>({name: "Vacation Fund", balance: 2000});
    })

    it("Should get all accounts for client", async ()=>{
        const clientAccounts: Account[] = await clientService.getAccountsForClient(savedClient.id);
        expect(savedClient.accounts).toEqual<Account[]>(clientAccounts);
    })

    it("Should get accounts with balance between 300 and 1000 for client", async ()=> {
        const clientAccounts: Account[] = await clientService.getAccountsByRangeForClient(savedClient.id, 1000, 300);
        expect(clientAccounts.length).toBe(2);
    })

    it("Should deposit specified amount into specified client account", async ()=>{
        const updatedAccount: Account = await clientService.depositAmount(savedClient.id, "McMuffin Fund", 200);
        const clientAccounts: Account[] = await clientService.getAccountsForClient(savedClient.id);
        expect(clientAccounts).toContainEqual<Account>({name: "McMuffin Fund", balance: 1000});
    })

    it("Should throw error if specified account does not exist", async ()=>{
        expect(async ()=> {
            await clientService.depositAmount(savedClient.id, "Invalid-account-name", 300); 
        }).rejects.toThrowError(ResourceNotFoundError);
    })

    it("Should withdraw specified amount from specified client account", async ()=>{
        const updatedAccount: Account = await clientService.withdrawAmount(savedClient.id, "McMuffin Fund", 500);
        const clientAccounts: Account[] = await clientService.getAccountsForClient(savedClient.id);
        expect(clientAccounts).toContainEqual<Account>({name: "McMuffin Fund", balance: 500});
    })

    it("Should throw error if overdrawing account", async ()=>{
        expect(async ()=> {
            await clientService.withdrawAmount(savedClient.id, "McMuffin Fund", 4000); 
        }).rejects.toThrowError(InsufficientFundsError);
    })
})