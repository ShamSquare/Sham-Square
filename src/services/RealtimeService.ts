import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import env from '../config/env.config.ts';
import jwtUtil from '../utils/jwt.util.ts';
import logger from '../utils/logger.util.ts';

export type RealtimeEvent =
  | 'cart:updated'
  | 'order:created'
  | 'order:updated'
  | 'inventory:updated'
  | 'notification:created'
  | 'user:status'
  | 'sync:refresh';

interface RealtimeUser {
  userId: string;
  role?: string;
}

interface EventEnvelope<T = unknown> {
  id: string;
  type: RealtimeEvent;
  payload: T;
  createdAt: string;
}

class RealtimeService {
  private io?: Server;
  private readonly onlineUsers = new Map<string, Set<string>>();

  initialize(server: HttpServer): Server {
    if (this.io) return this.io;

    this.io = new Server(server, {
      cors: {
        origin: env.frontend.clientUrl || '*',
        credentials: true,
      },
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: false,
      },
      pingInterval: 25_000,
      pingTimeout: 20_000,
    });

    this.io.use((socket, next) => {
      const token = this.extractToken(socket);
      if (!token) return next();

      try {
        const decoded = jwtUtil.verifyAccessToken(token);
        socket.data.user = {
          userId: decoded.userId,
          role: decoded.role,
        } satisfies RealtimeUser;
        return next();
      } catch (error) {
        return next(new Error('Unauthorized socket connection'));
      }
    });

    this.io.on('connection', (socket) => this.handleConnection(socket));
    logger.info('Realtime socket server initialized');
    return this.io;
  }

  emitToUser<T>(userId: string, type: RealtimeEvent, payload: T): void {
    this.emit(`user:${userId}`, type, payload);
  }

  emitToAdmins<T>(type: RealtimeEvent, payload: T): void {
    this.emit('role:admin', type, payload);
  }

  emitPublic<T>(type: RealtimeEvent, payload: T): void {
    this.emit('public', type, payload);
  }

  getOnlineUserIds(): string[] {
    return [...this.onlineUsers.keys()];
  }

  private handleConnection(socket: Socket): void {
    socket.join('public');
    const user = socket.data.user as RealtimeUser | undefined;

    if (user?.userId) {
      socket.join(`user:${user.userId}`);
      if (user.role) socket.join(`role:${user.role}`);
      this.markOnline(user.userId, socket.id);
    }

    socket.on('presence:ping', (ack?: (response: { ok: true; onlineUsers: string[] }) => void) => {
      ack?.({ ok: true, onlineUsers: this.getOnlineUserIds() });
    });

    socket.on('sync:join', (rooms: string[] = [], ack?: (response: { ok: true }) => void) => {
      rooms
        .filter((room) => this.canJoinRoom(socket, room))
        .forEach((room) => socket.join(room));
      ack?.({ ok: true });
    });

    socket.on('disconnect', () => {
      if (user?.userId) this.markOffline(user.userId, socket.id);
    });
  }

  private emit<T>(room: string, type: RealtimeEvent, payload: T): void {
    if (!this.io) return;
    const envelope: EventEnvelope<T> = {
      id: `${type}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
    };
    this.io.to(room).emit(type, envelope);
  }

  private markOnline(userId: string, socketId: string): void {
    const sockets = this.onlineUsers.get(userId) ?? new Set<string>();
    const wasOffline = sockets.size === 0;
    sockets.add(socketId);
    this.onlineUsers.set(userId, sockets);

    if (wasOffline) {
      this.emitPublic('user:status', { userId, status: 'online' });
    }
  }

  private markOffline(userId: string, socketId: string): void {
    const sockets = this.onlineUsers.get(userId);
    if (!sockets) return;

    sockets.delete(socketId);
    if (sockets.size > 0) return;

    this.onlineUsers.delete(userId);
    this.emitPublic('user:status', { userId, status: 'offline' });
  }

  private extractToken(socket: Socket): string | undefined {
    const authToken = socket.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) return authToken;

    const header = socket.handshake.headers.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);
    return undefined;
  }

  private canJoinRoom(socket: Socket, room: string): boolean {
    if (room === 'public') return true;
    const user = socket.data.user as RealtimeUser | undefined;
    if (!user) return false;
    if (room === `user:${user.userId}`) return true;
    if (user.role && room === `role:${user.role}`) return true;
    return user.role === 'admin' && room.startsWith('admin:');
  }
}

export const realtimeService = new RealtimeService();
