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

function createNotification(title, message) {
    chrome.notifications.create('', {
        title: title,
        message: 'test',
        iconUrl: '../assets/images/symbol.png',
        type: 'basic'
    });
}
export {getLocal, setLocal}