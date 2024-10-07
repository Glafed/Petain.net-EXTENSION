var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventEmitter } from './Emitter.js';
export class Activity {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
    setDetails(details) {
        this.details = details;
        return this;
    }
    setState(state) {
        this.state = state;
        return this;
    }
    setLargeImage(url, text) {
        this.largeImage = url;
        this.largeText = text;
        return this;
    }
    setSmallImage(url, text) {
        this.smallImage = url;
        this.smallText = text;
        return this;
    }
    setTimestamps(start, end) {
        this.start = start;
        this.end = end;
        return this;
    }
    ;
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            details: this.details,
            timestamps: {
                start: this.start,
                end: this.end
            },
            state: this.state,
            created_at: Date.now(),
            assets: {
                large_image: this.largeImage,
                large_text: this.largeText,
                small_image: this.smallImage,
                small_text: this.smallText
            }
        };
    }
}
class WebSocketManager extends EventEmitter {
    constructor() {
        super();
        this.ws = null;
        this.heartbeatInterval = null;
        this.MAX_TRIES = 100;
        this.tries = 0;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.tries++;
            this.ws = new WebSocket(`ws://localhost:${1488 | 35654}`);
            this.ws.onopen = this.onopen.bind(this);
            this.ws.onclose = this.onclose.bind(this);
            this.ws.onerror = this.onerror.bind(this);
            this.ws.onmessage = this.onmessage.bind(this);
        });
    }
    onopen() {
        console.log("WebSocket connection opened.");
        this.startHeartbeat();
        this.emit('ready');
    }
    onclose(event) {
        console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
        if (this.tries < this.MAX_TRIES) {
            console.log("Reconnecting in 5 seconds");
            setTimeout(() => {
                this.connect();
            }, 5000);
        }
        else {
            console.log("Max tries reached. Stopping reconnection.\nTry restarting the server.");
        }
        this.stopHeartbeat();
    }
    onerror(event) {
        var _a;
        console.log("WebSocket error:", event);
        this.emit('error');
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
    }
    onmessage(event) {
        console.log("WebSocket message received:", event.data);
        var data = JSON.parse(event.data);
        if (data.event === "ASK_ACTIVITY") {
            this.emit('askActivity');
        }
        var message = JSON.parse(event.data.toString());
        console.log("Parsed message:", message);
        this.emit('message');
    }
    send(data) {
        var _a;
        if (((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
            console.log("Sending data:", data);
            this.ws.send(JSON.stringify(data));
        }
        else {
            console.error("WebSocket is not open. Cannot send data.");
        }
    }
    close() {
        var _a;
        if (((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) !== WebSocket.OPEN)
            return;
        console.log("Closing WebSocket connection");
        this.ws.close();
    }
    startHeartbeat() {
        this.stopHeartbeat(); // Ensure no previous heartbeat is running
        this.heartbeatInterval = setInterval(() => {
            this.send('heartbeat');
        }, 30000); // Send heartbeat every 30 seconds
    }
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}
export class Client extends WebSocketManager {
    constructor() {
        super();
        this.activity = null;
        this.connect();
    }
    connect() {
        const _super = Object.create(null, {
            connect: { get: () => super.connect }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.connect.call(this);
        });
    }
    setActivity(activity) {
        const _super = Object.create(null, {
            send: { get: () => super.send }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.activity = activity;
            _super.send.call(this, { state: true, activity: (_a = this.activity) === null || _a === void 0 ? void 0 : _a.toJSON() });
        });
    }
    refresh(activity_1) {
        return __awaiter(this, arguments, void 0, function* (activity, nulled = false) {
            this.setActivity(activity);
            if (nulled)
                this.clearActivity();
        });
    }
    clearActivity() {
        const _super = Object.create(null, {
            send: { get: () => super.send }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.activity = null;
            _super.send.call(this, {
                state: false
            });
        });
    }
    close() {
        const _super = Object.create(null, {
            close: { get: () => super.close }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.close.call(this);
        });
    }
}
