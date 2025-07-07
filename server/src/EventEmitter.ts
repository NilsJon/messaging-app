import { EventEmitter } from 'events';
import type { Message } from '@prisma/client';

export const eventEmitter = new EventEmitter();

export function publishNewMessage(msg: Message & { sender: { username: string } }) {
  eventEmitter.emit('new-message', msg);
}