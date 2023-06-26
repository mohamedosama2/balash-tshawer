import { UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { AuthUser } from 'src/auth/decorators/me.decorator';
import { User, UserDocument } from 'src/users/models/_user.model';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { WebsocketsExceptionFilter } from './filters/WebsocketsException.filter';
import * as os from 'os';
import { UserRepository } from 'src/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from 'src/auth/interfaces/tokenPayload.interface';

const roomName = (
  city: string,
  district_start: string,
  district_end: string,
): string => `${city} from ${district_start} to ${district_end}`;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly UsersRepostary: UserRepository,
    private readonly jwtService: JwtService,
  ) {
    const cdc = this.UsersRepostary.watch([], { fullDocument: 'updateLookup' }); /// most important the second params

    cdc.on('change', (event) => {
      if (
        event.operationType === 'update' &&
        event.fullDocument.isAvailable == true
      ) {
        this.server
          .to(
            roomName(
              event.fullDocument.city,
              event.fullDocument.district_start,
              event.fullDocument.district_end,
            ),
          )
          .emit('location updated', event.fullDocument);
      }
    });
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    console.log(
      'connected from : ',
      os.hostname(),
      ` as ${client.handshake.headers.authorization}`,
    );

    if (!client.handshake.headers.authorization) {
      console.log('no token provided');
      client.disconnect();
      return;
    }

    const user: UserDocument | false =
      await this.authService.verifyUserByTokenFromSocket(
        client.handshake.headers.authorization.split(' ')[1],
      );
    //testing

    if (user) {
      client.join(roomName(user.city, user.district_start, user.district_end));

      await this.UsersRepostary.findOneAndUpdate(
        { _id: user.id },
        { $set: { isAvailable: true } },
      );
      // client.data.user = user;// try here to save data at client object , instead of call every time wsJwtGuard 'but make sure about security'
    } else client.disconnect();

    client.on('UPDATE_DA_LOCATION', async (user: User) => {
 
      const { _id, location } = user;
      await this.UsersRepostary.findOneAndUpdate(
        { _id },
        {
          $set: {
            location: location,
            isAvailable: true,
          },
        },
      );
    });

    //  client.join(`${client.handshake.headers.authorization}`);

    // const user: UserDocument | false =
    //   await this.authService.verifyUserByTokenFromSocket(
    //     client.handshake.headers.authorization.split(' ')[1],
    //   );
    // // console.log(user);
    // if (user) {
    // client.join(`user_${user._id}`);
    // client.data.user = user;// try here to save data at client object , instead of call every time wsJwtGuard 'but make sure about security'
    // } else client.disconnect();
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('disconnected', client.conn.request.headers.authorization);
    const decoded: TokenPayload = await this.jwtService.verify(
      client.conn.request.headers.authorization.split(' ')[1],
    );
    const user = await this.UsersRepostary.findOne({ _id: decoded.userId });
    this.server
      .to(roomName(user.city, user.district_start, user.district_end))
      .emit('user disconnected', user);
    await this.UsersRepostary.findOneAndUpdate(
      { _id: decoded.userId },
      { $set: { isAvailable: false } },
    );
  }

  @UseGuards(WsJwtGuard)
  @UseFilters(new WebsocketsExceptionFilter())
  @SubscribeMessage('test-listen')
  async testListen(@MessageBody() data: any, @AuthUser() me: any) {
    // console.log(data, me.role);
    // throw new WsException('test exception event'); // Nest will handle the thrown exception and emit the exception message
    this.server.to(`${data.to}`).emit('test-emit', {
      msg: data,
      host: os.hostname(),
      sender: me,
    });
    return data;
  }
}
