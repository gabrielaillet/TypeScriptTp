import { FastifyReply, FastifyRequest } from "fastify";
import { ITodoList ,Status} from "../interfaces";

export const addList = async (
  request: FastifyRequest<{
    Params: { id: string };  // To access list id from the URL
    Body: { id: string; name?: string, description?:string };  
  }>,
  reply: FastifyReply
) => {  
  const list = request.body as ITodoList;
  const result = await request.server.level.db.put(
    list.id.toString(),
    JSON.stringify(list)
  );
  reply.send({ data: list });
}

export const changeList = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: { description?: string; name?: string };
  }>,
  reply: FastifyReply
) => {
  const { name, description } = request.body;
  const { id } = request.params;
  const listsIter = request.server.level.db.iterator();
  const result: ITodoList[] = [];

  // We'll need to use this to check and modify the data
  let listUpdated = false;

  for await (const [key, value] of listsIter) {
    const currentList: ITodoList = JSON.parse(value); // Deserialize the current item
    // Check if the current list matches the requested `id`
    if (currentList.id === id) {
      // Modify the fields if provided in the request body
      if (name) currentList.name = name;
      if (description) currentList.description = description;

      // Save the updated list back to the database
      await request.server.level.db.put(id, JSON.stringify(currentList));

      listUpdated = true;
    }
    result.push(currentList);
  }
  if (!listUpdated) {
    reply.status(404).send({ error: "List not found" });
  } else {
    // Return the updated list after modification
    reply.send({ data: result });
  }
};

export async function listLists(request: FastifyRequest, reply: FastifyReply) {
  console.log("DB status", request.server.level.db.status);
  const listsIter = request.server.level.db.iterator();

  const result: ITodoList[] = [];
  for await (const [key, value] of listsIter) {
    result.push(JSON.parse(value));
  }
  reply.send({ data: result });
}

export const addListItem = async (
  request: FastifyRequest<{
    Params: { id: string };  // To access list id from the URL
    Body: { idItem: string; name: string };  // To access item details from the body
  }>,
  reply: FastifyReply
) => {
  const { idItem, name } = request.body;
  const { id } = request.params;
  // Use an iterator to go through all lists in the database
  const listsIter = request.server.level.db.iterator();

  let listFound = false;
  // Loop through each list in the database
  for await (const [key, value] of listsIter) {
    const currentList: ITodoList = JSON.parse(value); // Deserialize the current list
    // If the list ID matches, update the list
    if (currentList.id === id) {
      // Initialize items if undefined and then add the new item
      if (!currentList.items) {
        currentList.items = [];
      }
      currentList.items.push({ name, id:idItem, status: "PENDING" });

      // Save the updated list back to the database
      await request.server.level.db.put(currentList.id, JSON.stringify(currentList));

      listFound = true;
      break; // Exit loop once the list has been updated
    }
  }

  if (!listFound) {
    // If no list with the given id is found, send a 404 error
    reply.status(404).send({ error: "List not found" });
  } else {
    // Return the updated list with the new item
    reply.send({ data: { id, idItem, name, status: "PENDING" } });
  }
};


export const putListItem = async (
  request: FastifyRequest<{
    Params: { id: string,idItem:string };  // To access list id from the URL
    Body: {  name?: string, status:Status };  // To access item details from the body
  }>,
  reply: FastifyReply
) => {
  const {status , name } = request.body;
  const { id,idItem } = request.params;
  // Use an iterator to go through all lists in the database
  const listsIter = request.server.level.db.iterator();

  let listFound = false;
  // Loop through each list in the database
  for await (const [key, value] of listsIter) {
    const currentList: ITodoList = JSON.parse(value); // Deserialize the current list
    // If the list ID matches, update the list
    if (currentList.id === id) {
      // Initialize items if undefined and then add the new item
      if(currentList.items){
        let item = currentList.items.find(e => e.id === idItem)
        if(item){
          if(name){
            item.name = name
          }
          if(status){
            item.status = status
          }
        }
      }

      // Save the updated list back to the database
      await request.server.level.db.put(currentList.id, JSON.stringify(currentList));

      listFound = true;
      break; // Exit loop once the list has been updated
    }
  }

  if (!listFound) {
    // If no list with the given id is found, send a 404 error
    reply.status(404).send({ error: "List not found" });
  } else {
    // Return the updated list with the new item
    reply.send({ data: { id, idItem, name, status: status } });
  }
};

export const delListItem = async (
  request: FastifyRequest<{
    Params: { id: string,idItem:string };  // To access list id from the URL
    Body: { };  // To access item details from the body
  }>,
  reply: FastifyReply
) => {
  const { id,idItem } = request.params;
  // Use an iterator to go through all lists in the database
  const listsIter = request.server.level.db.iterator();

  let listFound = false;
  // Loop through each list in the database
  for await (const [key, value] of listsIter) {
    const currentList: ITodoList = JSON.parse(value); // Deserialize the current list
    // If the list ID matches, update the list
    if (currentList.id === id) {
      // Initialize items if undefined and then add the new item
      if (currentList.items) {
        // Find the item to be removed by its id
        const itemIndex = currentList.items.findIndex((e) => e.id === idItem);

        // If the item is found, remove it from the array
        if (itemIndex !== -1) {
          currentList.items.splice(itemIndex, 1);  // Remove the item from the array
        } else {
          // If item not found, send 404 error for the item
          reply.status(404).send({ error: "Item not found" });
          return;
        }
      }

      // Save the updated list back to the database
      await request.server.level.db.put(currentList.id, JSON.stringify(currentList));

      listFound = true;
      break; // Exit loop once the list has been updated
    }
  }

  if (!listFound) {
    // If no list with the given id is found, send a 404 error
    reply.status(404).send({ error: "List not found" });
  } else {
    // Return the updated list with the new item
    reply.send({ data: { id, idItem, } });
  }
};