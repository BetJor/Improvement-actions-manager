
// This is a simple event emitter that allows us to broadcast and listen for
// specific events across the application. It's used here to create a centralized
// way to handle Firestore permission errors.

type Listener<T> = (data: T) => void;

class EventEmitter<T extends Record<string, any>> {
  private listeners: { [K in keyof T]?: Listener<T[K]>[] } = {};

  on<K extends keyof T>(event: K, listener: Listener<T[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<K extends keyof T>(event: K, listener: Listener<T[K]>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event]!.filter(
      (l) => l !== listener
    );
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event]!.forEach((listener) => listener(data));
  }
}

// Define the shape of the events and their payloads
interface AppEvents {
  'permission-error': any; // We'll use a specific error type later
}

// Create and export a single instance of the emitter
export const errorEmitter = new EventEmitter<AppEvents>();
