import { CosmosClient } from "@azure/cosmos";
import Client from "../entities/client";
import {v4} from 'uuid';
import { ResourceNotFoundError } from "../errors/error-handler";


const connection = new CosmosClient(process.env.AZURE_COSMOS_CONNECTION);
const database = connection.database('banking-client-db');
const container = database.container('Clients');


//ClientDAO Interface
export default interface ClientDAO{
    //Create
    createClient(client: Client): Promise<Client>;

    //Read
    getAllClients(): Promise<Client[]>;
    getClientById(id: string): Promise<Client>;

    //Update
    updateClient(client: Client): Promise<Client>;

    //Delete
    deleteClientById(id: string): Promise<Client>;
}

//ClientDAO Implementation
export class ClientDaoCosmosDb implements ClientDAO{

    async createClient(client: Client): Promise<Client> {
        client.id = v4();
        const response = await container.items.create(client);
        return response.resource;
    }

    async getAllClients(): Promise<Client[]> {
        const response = await container.items.readAll<Client>().fetchAll();
        return response.resources;
    }

    async getClientById(id: string): Promise<Client> {
        const response = await container.item(id, id).read<Client>();
        if(!response.resource){
            throw new ResourceNotFoundError(`Client with ID of ${id} could not be found.`);
        }
        return response.resource;
    }

    async updateClient(client: Client): Promise<Client> {
        await this.getClientById(client.id);
        const response = await container.items.upsert<Client>(client);
        return response.resource;
    }

    async deleteClientById(id: string): Promise<Client> {
        const deletedClient = await this.getClientById(id);
        const response = await container.item(id, id).delete();
        return deletedClient;
    }
}