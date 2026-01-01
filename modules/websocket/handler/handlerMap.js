export const clients = new Map();

const handlers = {
  setName: (socket, payload) => {
    clients.set(socket, { Id: payload.Id });
    socket.send(`Your name is now set to ${payload.Id}`);
  },
};

export default handlers;
