import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /** El cuidador se une a las rooms de sus usuarios */
  @SubscribeMessage('join_user_room')
  handleJoin(client: Socket, payload: { userId: string }) {
    client.join(`user:${payload.userId}`);
    return { event: 'joined', data: payload.userId };
  }

  /** Emitir cuando una actividad se completa */
  emitActivityCompleted(userId: string, data: {
    activityId: string;
    activityName: string;
    completedAt: string;
  }) {
    this.server.to(`user:${userId}`).emit('activity_completed', data);
  }

  emitActivityLate(userId: string, data: { activityId: string; activityName: string }) {
    this.server.to(`user:${userId}`).emit('activity_late', data);
  }

  emitActivityMissed(userId: string, data: { activityId: string; activityName: string }) {
    this.server.to(`user:${userId}`).emit('activity_missed', data);
  }
}
