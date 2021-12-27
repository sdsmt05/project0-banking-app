import { Request, Response } from "express";

export default function errorHandler(error: Error, req: Request, res: Response){
    if(error instanceof ResourceNotFoundError){
        res.status(404);
        res.send(error.message);
    } else if(error instanceof InsufficientFundsError){
        res.status(422);
        res.send(error.message);
    } else {
        res.status(500);
        res.send("And unknown error has occured.");
    }
}

export class ResourceNotFoundError extends Error{

    constructor(message: string){
        super(message);
    }
}

export class InsufficientFundsError extends Error{

    constructor(message: string){
        super(message);
    }
}
