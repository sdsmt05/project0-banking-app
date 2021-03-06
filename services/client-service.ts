import ClientDAO from "../daos/client-dao";
import Account from "../entities/account";
import Client from "../entities/client";
import { ResourceNotFoundError, InsufficientFundsError } from "../errors/error-handler";


export interface ClientService{
    addAccountToClient(id: string, account: Account): Promise<Client>;

    getAccountsForClient(id: string, amountLessThan?: number, amountGreaterThan?: number): Promise<Account[]>;

    depositAmount(id: string, accountName: string, amount: number): Promise<Account>;

    withdrawAmount(id:string, accountName: string, amount: number): Promise<Account>;
}

export class ClientServiceAccount implements ClientService{

    constructor(private clientDAO: ClientDAO){};

    async addAccountToClient(id: string, account: Account): Promise<Client> {
        const client: Client = await this.clientDAO.getClientById(id);
        client.accounts.push(account);
        return await this.clientDAO.updateClient(client);
    }

    async getAccountsForClient(id: string, amountLessThan: number = undefined, amountGreaterThan: number = undefined): Promise<Account[]> {
        const client: Client = await this.clientDAO.getClientById(id);
        let validAccounts: Account[] = [];
        if(amountLessThan && amountGreaterThan){
            validAccounts = client.accounts.filter(element => element.balance <= amountLessThan && element.balance > amountGreaterThan);
        } else if(amountLessThan && !amountGreaterThan){
            validAccounts = client.accounts.filter(element => element.balance <= amountLessThan);
        } else if(!amountLessThan && amountGreaterThan){
            validAccounts = client.accounts.filter(element => element.balance >= amountGreaterThan);
        } else {
            validAccounts = client.accounts;
        }
        return validAccounts;
    }

    async depositAmount(id: string, accountName: string, amount: number): Promise<Account> {
        let client: Client = await this.clientDAO.getClientById(id);
        const index = client.accounts.findIndex(element => element.name === accountName);
        if(index === -1){
            throw new ResourceNotFoundError(`Account with name ${accountName} could not be found.`);
        }
        client.accounts[index].balance += amount;
        client = await this.clientDAO.updateClient(client);
        return client.accounts[index];
    }

    async withdrawAmount(id: string, accountName: string, amount: number): Promise<Account> {
        let client: Client = await this.clientDAO.getClientById(id);
        const index = client.accounts.findIndex(element => element.name === accountName);
        if(index === -1){
            throw new ResourceNotFoundError(`Account with name ${accountName} could not be found.`);
        }
        if(client.accounts[index].balance < amount){
            throw new InsufficientFundsError(`Insufficient funds, account ${accountName} only has an available balance of $${client.accounts[index].balance}.`);
        }
        client.accounts[index].balance -= amount;
        client = await this.clientDAO.updateClient(client);
        return client.accounts[index];
    }
}