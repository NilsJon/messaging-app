import { EventEmitter } from 'events';
import type { Message } from '@prisma/client';

export const eventEmitter = new EventEmitter();

export function publishNewMessage(msg: Message & { sender: { username: string } }) {
  eventEmitter.emit('new-message', msg);
}

export function eventIterator<T>(emitter: EventEmitter, event: string) {
  async function* iterator() {
    const queue: T[] = [];
    let push: ((val: T) => void) | null = null;

    const handler = (val: T) => {
      if (push) {
        push(val);
        push = null;
      } else {
        queue.push(val);
      }
    };

    emitter.on(event, handler);

    try {
      while (true) {
        if (queue.length > 0) {
          yield queue.shift() as T;
          continue;
        }
        const value: T = await new Promise<T>((res) => (push = res));
        yield value;
      }
    } finally {
      emitter.off(event, handler);
    }
  }

  return iterator();
}