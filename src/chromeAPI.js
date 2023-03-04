import * as common from './common.js';

function getLocal(key) {
    return new Promise((resovle, reject) => {
        chrome.storage.local.get(key, (item) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }

            resovle(item);
        });
    });
}

function setLocal(key) {
    return new Promise((resovle, reject) => {
        chrome.storage.local.set(key, (item => {
            if(chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }

            resovle(item);
        }));
    });
}

function createNotification(title, message, link) {
    let id = link + "," + common.uuidv4();
    
    chrome.notifications.create(id, {
        title: title,
        message: message,
        iconUrl: '../assets/images/symbol.png',
        type: 'basic'
    });
}

function createNewTab(link, notificationId) {
    chrome.tabs.create({
        url: link.replaceAll("amp;", "")

    });

    chrome.notifications.clear(notificationId);
}
export {getLocal, setLocal, createNotification, createNewTab}