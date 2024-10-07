export class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }
    off(event, listener) {
        if (!this.events[event])
            return this;
        this.events[event] = this.events[event].filter(l => l !== listener);
        return this;
    }
    emit(event, ...args) {
        if (!this.events[event])
            return false;
        this.events[event].forEach(listener => listener(...args));
        return true;
    }
}
