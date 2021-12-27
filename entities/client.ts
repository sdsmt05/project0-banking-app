import Account from "./account";

//Banking client interface
export default interface Client{
    id: string,
    fname: string,
    lname: string,
    accounts?: Account[]
}