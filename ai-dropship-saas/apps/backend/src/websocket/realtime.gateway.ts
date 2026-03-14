import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  emitProductUpdate(payload: unknown) {
    this.server.emit('product_update', payload);
  }
}
