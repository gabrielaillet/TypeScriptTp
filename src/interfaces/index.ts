export type Status  = "PENDING" | "IN-PROGRESS" | "DONE";

export interface ITodoList {
    id: string
    description?: string
    name:string
    items?: IItem[]
  }

export interface IItem{
  id:string
  name:string;
  status:Status
}