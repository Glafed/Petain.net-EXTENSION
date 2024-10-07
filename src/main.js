var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EMessage } from "../scripts/messageActions.js";
import { Client, Activity } from "./discordActivity/index.js";
const PTNETURL = "https://petain.net/";
var petainTab = undefined;
var bIsReady = false;
var activity_manager = new Client();
activity_manager.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Ready to send media info");
    bIsReady = true;
}));
function isPetainOpen() {
    return new Promise((resolve) => {
        chrome.tabs.query({}, (tabs) => {
            /*tabs.forEach(tab => {
                console.log("Tab: " + tab.id + " -> " + tab.url + " is active ? " + tab.active);
            })*/
            const tab = tabs.find(tab => tab.url && tab.url.includes(PTNETURL));
            if (!tab || !tab.url) {
                console.log("isPetainOpen() -> No tab found");
                resolve(false);
                return;
            }
            //console.log("isPetainOpen() -> Tab found: " + tab.url);
            petainTab = tab;
            resolve(true);
        });
    });
}
function isMediaPlaying() {
    if (!petainTab)
        return false;
    if (!petainTab.audible)
        return false;
    return petainTab.audible;
}
function CheckAndRetrieveMediaInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        var bIsOpen = yield isPetainOpen();
        //console.log("CheckAndRetrieveMediaInfo() -> Petain is open: " + bIsOpen);
        if (!bIsOpen)
            return;
        //console.log("CheckAndRetrieveMediaInfo() -> Petain is playing: " + isMediaPlaying());
        if (!isMediaPlaying())
            return;
    });
}
activity_manager.on('askActivity', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("askActivity -> Sending message to Petain tab");
    if (!(petainTab === null || petainTab === void 0 ? void 0 : petainTab.id))
        return;
    chrome.tabs.sendMessage(petainTab.id, { msg: EMessage.MEDIA_INFO }, (response) => {
        console.log("askActivity -> Response: " + response);
    });
}));
setInterval(CheckAndRetrieveMediaInfo, 5000);
function HandleMediaInfo(data, event) {
    console.log("HandleMediaInfo() -> Event: " + event);
    console.log("HandleMediaInfo() -> Data: " + JSON.stringify(data));
    console.log("HandleMediaInfo() -> Data.src: " + data.src);
    if (!data.src) {
        event = 'empty';
    }
    ;
    var encoded_image = encodeURI(data.src.replace(data.src.split("/")[5], "cover.jpg"));
    var activity = new Activity("Petain.net", 2)
        .setDetails(data.title)
        .setState(data.artist)
        .setLargeImage(encoded_image, data.album)
        .setTimestamps(data.startedAt, data.endAt);
    console.log("HandleMediaInfo() -> Activity: " + JSON.stringify(activity));
    switch (event) {
        case 'play':
            activity_manager.setActivity(activity);
            break;
        case 'pause':
            activity_manager.clearActivity();
            break;
        case 'stop':
            activity_manager.clearActivity();
            break;
        case 'refresh':
            activity_manager.refresh(activity, activity === null);
            break;
        case 'empty':
            activity_manager.clearActivity();
            break;
    }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("[MESSAGE LISTENER] -> Message received: " + message.msg);
    switch (message.msg) {
        case EMessage.CHECK_PETAIN:
            isPetainOpen().then((bIsOpen) => {
                sendResponse(bIsOpen);
            });
            return true;
        case EMessage.MEDIA_INFO:
            console.log("MEDIA_INFO -> Received");
            console.log("MEDIA_INFO -> event: " + message.event);
            console.log("MEDIA_INFO -> song_data: " + JSON.stringify(message.song_data));
            if (bIsReady) {
                HandleMediaInfo(message.song_data, message.event);
                sendResponse(true);
            }
            else {
                sendResponse(false);
            }
    }
}));
