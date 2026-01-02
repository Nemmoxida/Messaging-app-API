export const clients = new Map();

let clientData; // for searching the clientData

const handlers = {
  setName: (socket, payload) => {
    clients.set(socket, { Id: payload.Id });

    // const currentSocket = socket;
    // const exist = [...clients.entries()].find(([socket, name]) => {
    //   return socket == currentSocket;
    // });

    // if (exist) {
    //   clients.delete(currentSocket);
    // }

    console.log(clients);
    socket.send(`Your name is now set to ${payload.Id}`);
  },
  private: (socket, payload) => {
    const message = payload.message;
    const target = [...clients.entries()].find(([socket, name]) => {
      return name.Id == payload.target;
    })?.[0];

    clientData = clients.get(socket);

    if (!target) {
      return socket.send(
        JSON.stringify({ status: "error", message: "No user exist" })
      );
    }

    // console.log(clientData);
    const mail = {
      origin: clientData.Id,
      message: message,
    };

    target.send(JSON.stringify(mail));
  },
  broadcast: (socket, payload) => {
    const message = payload.message;

    clientData = clients.get(socket);

    const mail = {
      origin: clientData.Id,
      message: message,
    };

    clients.forEach((name, socket) => {
      socket.send(JSON.stringify(mail));
    });
  },
};

export default handlers;
