import * as chromeAPI from "./chromeAPI.js";
import * as htmlParser from "./htmlParser.js";

async function getRecentNotices() {
    const data = await chromeAPI.getLocal('recentNotice');
    if (data.constructor === Object && Object.keys(data).length === 0) {
        return [];
    } else {
        const recentNotice = data['recentNotice'];
        return recentNotice;
    }
}

function checkNotice(recentNotice, notice) {
    if(recentNotice['group'] != notice['group']) {
        return false;
    }
    if(recentNotice['left'] != notice['left']) {
        return false;
    }
    if(recentNotice['leftLink'] != notice['leftLink']) {
        return false;
    }
    if(recentNotice['date'] != notice['date']) {
        return false;
    }
    return true;
}

const searchKeyword = async function() {
    const recentNotices = await getRecentNotices();
    const keywords = recentNotices.map(n => n["keyword"]);

    for (let i = 0; i < keywords.length; i++) {
        await fetch(`https://www.jbnu.ac.kr/kor/?menuID=139&subject=${keywords[i]}&sfv=subject`).then((res) => res.text()).then((html) => {
            let noticeList = htmlParser.parseHTML(html);
            for (let idx = 0; idx < noticeList.length; idx++) {
                if (checkNotice(recentNotices[i].recentNotice, noticeList[idx])) {
                    break;
                }
                else {
                    chromeAPI.createNotification("새로운 공지사항이 등록됐습니다.", noticeList[idx].left, noticeList[idx].leftLink);
                }
            }
            if (!!noticeList[0]) {
                recentNotices[i].recentNotice = noticeList[0];
            }
        });
    }

    let keyValue = {"recentNotice": recentNotices};
    chromeAPI.setLocal(keyValue);
}

const updateRecentNotices = async function(details) {
    if (details.reason === "update" && details.previousVersion < '1.1.0') {
        const keyValue = {"keyword": []}
        await chromeAPI.setLocal(keyValue);
    }
};

chrome.alarms.create({ periodInMinutes: 1});

chrome.alarms.onAlarm.addListener(() => {
    searchKeyword().catch(console.log);
});

chrome.notifications.onClicked.addListener((notificationId) => {
        const link = notificationId.split(',');
        chromeAPI.createNewTab(link[0], notificationId);
        
});

chrome.runtime.onInstalled.addListener(updateRecentNotices);