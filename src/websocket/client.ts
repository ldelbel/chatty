import { Socket } from "socket.io";
import { io } from "../http";
import { ConnectionsService } from "../services/ConnectionsService";
import { UsersService } from "../services/UsersService";
import { MessagesService } from "../services/MessagesService";

interface IParams {
  text: string;
  email: string;
}

io.on("connect", (socket: Socket) => {
  const connectionsService = new ConnectionsService();
  const usersService = new UsersService();
  const messagesService = new MessagesService();

  socket.on("client_first_access", async (params: IParams) => {
    const socket_id = socket.id;
    const { email, text } = params;

    const user = await usersService.create(email);
    let user_id = user.id;

    const connection = await connectionsService.findByUserId(user_id);

    if (!connection) {
      await connectionsService.create({
        socket_id,
        user_id: user_id,
      });
    } else {
      connection.socket_id = socket_id;
      await connectionsService.create(connection);
    }

    await messagesService.create({ 
      text,
      user_id
    });
  });
});
