import * as chromeAPI from "./chromeAPI.js";

const univURL = `http://www.jbnu.ac.kr/kor/?menuID=139`;
let selectedKeyword = '';
let myFile = {};
let noticeList = [];
let keywordNoticeList = {};

async function retrieveData() {
    let isEnd = false
    for(let i = 0; i < 10; i++) {
        if(isEnd) {
            break;
        }
        await fetch(univURL + `&pno=${i}`).then((res) => res.text()).then((html) => {
            // html 파싱
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');
        
            let trElement = doc.querySelectorAll('table tbody tr');
        
            for (let i = 0; i < trElement.length; i++) {
                let notice = {};
                let thElement = trElement[i].children;
        
                if (thElement[0].innerText == "") continue;
        
        
                let groupElement = thElement[1].querySelector('span');
                let leftElement = thElement[2].querySelector('span a');
        
                notice['group'] = groupElement.innerText;
                notice['left'] = leftElement.innerText;
                notice['leftLink'] = "https://www.jbnu.ac.kr/kor" + leftElement.getAttribute('href');
                let date = thElement[5].innerText;
                
                let today = new Date()
                today.setHours(0, 0, 0, 0);
                let pivotDate = new Date(today.setDate(today.getDate() - 0));
                if (new Date(date) < pivotDate) {
                    isEnd = true
                    break;
                }
                notice['date'] = date;
        
                noticeList.push(notice);
            }
        });
    }
    // 파싱 데이터 html 로 변경
    let noticeGroup = document.getElementById("noticeList");
        
    if (noticeList.length == 0) {
        noticeGroup.innerHTML += `<div class="notice-empty">올라온 공지가 없습니다.</div>`
    } else {
        let index = 1;
        for (const notice of noticeList) {
            let noticeElement = `<div class="notice-element">${index++}. <a class="notice-name" target="_blank" href="${notice.leftLink}">${notice.left}<small class="mute">${notice.date}</small></div></div>`;
            noticeGroup.innerHTML += noticeElement;
        }
    }
}

retrieveData();

updateKeywordSearch();

async function addKeyword(keyword) {
    let keywords = await getKeywords();

    keywords.push(keyword);
    selectedKeyword = keyword
    let keyValue = { "keyword": keywords };

    await chromeAPI.setLocal(keyValue);
    
    let keywordList = document.getElementById('keywordList');
        keywordList.innerHTML = ``;
        for (let i = 0; i < keywords.length; i++) {
            if (keywords[i] === selectedKeyword) {
                keywordList.innerHTML += `<div class="keyword-container me-2"><div class="keyword selected-keyword" value="${keywords[i]}">${keywords[i]}</div><div class="keyword-delete-btn" value="${keywords[i]}"> x </div></div>`;
            }
            else keywordList.innerHTML += `<div class="keyword-container me-2"><div class="keyword " value="${keywords[i]}">${keywords[i]}</div><div class="keyword-delete-btn" value="${keywords[i]}"> x </div></div>`;
            fetch(`https://www.jbnu.ac.kr/kor/?menuID=139&subject=${keywords[i]}&sfv=subject`).then((res) => res.text()).then((html) => {
                // html 파싱
                let parser = new DOMParser();
                let doc = parser.parseFromString(html, 'text/html');

                let trElement = doc.querySelectorAll('table tbody tr');

                let keywordNoticeArr = [];
                for (let j = 0; j < trElement.length; j++) {
                    let notice = {};
                    let thElement = trElement[j].children;

                    if (thElement[0].innerText == "" || thElement[0].innerText =="조건에 해당되는 글이 존재하지 않습니다.") continue;


                    let groupElement = thElement[1].querySelector('span');
                    let leftElement = thElement[2].querySelector('span a');

                    notice['group'] = groupElement.innerText;
                    notice['left'] = leftElement.innerText;
                    notice['leftLink'] = "https://www.jbnu.ac.kr/kor" + leftElement.getAttribute('href');
                    let date = thElement[5].innerText;
                    
                    notice['date'] = date;

                    keywordNoticeArr.push(notice);
                }

                keywordNoticeList[keywords[i]] = keywordNoticeArr;

                // 파싱 데이터 html 로 변경
                let keywordNoticeGroup = document.getElementById("keywordNoticeList");
                if (!!!keywordNoticeList[selectedKeyword]) {

                } else if (keywordNoticeList[selectedKeyword].length == 0) {
                    keywordNoticeGroup.innerHTML += `<div class="notice-empty">검색 결과가 없습니다.</div>`
                } else {
                    let index = 1;
                    for (const notice of keywordNoticeList[selectedKeyword]) {
                        let noticeElement = `<div class="notice-element">${index++}. <a class="notice-name" target="_blank" href="${notice.leftLink}">${notice.left}<small class="mute">${notice.date}</small></div></div>`;
                        keywordNoticeGroup.innerHTML += noticeElement;
                    }
                }

                let deleteBtns = document.getElementsByClassName("keyword-delete-btn");
                for (let i = 0; i < deleteBtns.length; i++) {
                    deleteBtns[i].addEventListener('click', (event) => {
                        deleteKeyword(deleteBtns[i].getAttribute('value'));
                    });
                }
            });


            setKeywordBtn();
        }
}

async function deleteKeyword(keyword) {
    let keywords = await getKeywords();

    for (let i = 0; i < keywords.length; i++) {
        if (keywords[i] == keyword) {
            if (keyword == selectedKeyword && i > 0) selectedKeyword = keywords[i - 1];
            else if (keyword == selectedKeyword && i == 0 && keywords.length > 1) selectedKeyword = keywords[i + 1];
            keywords.splice(i, 1);
        }
    }


    let keyValue = { "keyword": keywords };

    await chromeAPI.setLocal(keyValue);
    
    let keywordList = document.getElementById('keywordList');
    keywordList.innerHTML = ``;
    for (let i = 0; i < keywords.length; i++) {
        if (keywords[i] === selectedKeyword) {
            keywordList.innerHTML += `<div class="keyword-container me-2"><div class="keyword selected-keyword" value="${keywords[i]}">${keywords[i]}</div><div class="keyword-delete-btn" value="${keywords[i]}"> x </div></div>`;
        }
        else keywordList.innerHTML += `<div class="keyword-container me-2"><div class="keyword " value="${keywords[i]}">${keywords[i]}</div><div class="keyword-delete-btn" value="${keywords[i]}"> x </div></div>`;
        fetch(`https://www.jbnu.ac.kr/kor/?menuID=139&subject=${keywords[i]}&sfv=subject`).then((res) => res.text()).then((html) => {
            // html 파싱
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');

            let trElement = doc.querySelectorAll('table tbody tr');

            let keywordNoticeArr = [];
            for (let j = 0; j < trElement.length; j++) {
                let notice = {};
                let thElement = trElement[j].children;

                if (thElement[0].innerText == "" || thElement[0].innerText =="조건에 해당되는 글이 존재하지 않습니다.") continue;


                let groupElement = thElement[1].querySelector('span');
                let leftElement = thElement[2].querySelector('span a');

                notice['group'] = groupElement.innerText;
                notice['left'] = leftElement.innerText;
                notice['leftLink'] = "https://www.jbnu.ac.kr/kor" + leftElement.getAttribute('href');
                let date = thElement[5].innerText;
                // if(new Date(date) < new Date()) 
                //     break;
                notice['date'] = date;

                keywordNoticeArr.push(notice);
            }

            keywordNoticeList[keywords[i]] = keywordNoticeArr;

            // 파싱 데이터 html 로 변경
            let keywordNoticeGroup = document.getElementById("keywordNoticeList");
            if (!!!keywordNoticeList[selectedKeyword]) {

            } else if (keywordNoticeList[selectedKeyword].length == 0) {
                keywordNoticeGroup.innerHTML += `<div class="notice-empty">검색 결과가 없습니다.</div>`
            } else {
                let index = 1;
                for (const notice of keywordNoticeList[selectedKeyword]) {
                    let noticeElement = `<div class="notice-element">${index++}. <a class="notice-name" target="_blank" href="${notice.leftLink}">${notice.left}<small class="mute">${notice.date}</small></div></div>`;
                    keywordNoticeGroup.innerHTML += noticeElement;
                }
            }

            let deleteBtns = document.getElementsByClassName("keyword-delete-btn");
            for (let i = 0; i < deleteBtns.length; i++) {
                deleteBtns[i].addEventListener('click', (event) => {
                    deleteKeyword(deleteBtns[i].getAttribute('value'));
                });
            }
        });


        setKeywordBtn();
    }

}

async function updateKeywordSearch() {
    const keywords = await getKeywords();
    let keywordList = document.getElementById('keywordList');
    keywordList.innerHTML = ``;
    for (let i = 0; i < keywords.length; i++) {
        if (i === 0) {
            selectedKeyword = keywords[i];
            keywordList.innerHTML += `<div class="keyword-container me-2"><div class="keyword selected-keyword" value="${keywords[i]}">${keywords[i]}</div><div class="keyword-delete-btn" value="${keywords[i]}"> x </div></div>`;
        }
        else keywordList.innerHTML += `<div class="keyword-container me-2"><div class="keyword " value="${keywords[i]}">${keywords[i]}</div><div class="keyword-delete-btn" value="${keywords[i]}"> x </div></div>`;
        fetch(`https://www.jbnu.ac.kr/kor/?menuID=139&subject=${keywords[i]}&sfv=subject`).then((res) => res.text()).then((html) => {
            // html 파싱
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');

            let trElement = doc.querySelectorAll('table tbody tr');

            let keywordNoticeArr = [];
            for (let j = 0; j < trElement.length; j++) {
                let notice = {};
                let thElement = trElement[j].children;

                if (thElement[0].innerText == "" || thElement[0].innerText =="조건에 해당되는 글이 존재하지 않습니다.") continue;

                let groupElement = thElement[1].querySelector('span');
                let leftElement = thElement[2].querySelector('span a');

                notice['group'] = groupElement.innerText;
                notice['left'] = leftElement.innerText;
                notice['leftLink'] = "https://www.jbnu.ac.kr/kor" + leftElement.getAttribute('href');
                let date = thElement[5].innerText;
                notice['date'] = date;

                keywordNoticeArr.push(notice);
            }

            keywordNoticeList[keywords[i]] = keywordNoticeArr;

            // 파싱 데이터 html 로 변경
            let keywordNoticeGroup = document.getElementById("keywordNoticeList");
            if (!!!keywordNoticeList[selectedKeyword]) {

            } else if (keywordNoticeList[selectedKeyword].length == 0) {
                keywordNoticeGroup.innerHTML = `<div class="notice-empty">검색 결과가 없습니다.</div>`
            } else {
                let index = 1;
                for (const notice of keywordNoticeList[selectedKeyword]) {
                    let noticeElement = `<div class="notice-element">${index++}. <a class="notice-name" target="_blank" href="${notice.leftLink}">${notice.left}<small class="mute">${notice.date}</small></div></div>`;
                    keywordNoticeGroup.innerHTML += noticeElement;
                }
            }

            let deleteBtns = document.getElementsByClassName("keyword-delete-btn");
            for (let i = 0; i < deleteBtns.length; i++) {
                deleteBtns[i].addEventListener('click', (event) => {
                    deleteKeyword(deleteBtns[i].getAttribute('value'));
                });
            }
        });
    }

    setKeywordBtn();
}

async function getKeywords() {
    const data = await chromeAPI.getLocal('keyword');
    if (data.constructor === Object && Object.keys(data).length === 0) {
        return [];
    } else {
        const keywords = data['keyword'];
        return keywords;
    }
}

function updateCheckBoxEventListener() {

    let checkBoxes = document.getElementsByClassName("check-box");

    for (let checkBox of checkBoxes) {
        checkBox.addEventListener('change', () => {
            if (checkBox.checked) {
                const key = checkBox.parentElement.parentElement.children[1].textContent;
                const keyValue = {};
                keyValue[key] = true;
                // save local storage
                chrome.storage.local.set(keyValue, () => {
                    console.log(keyValue);
                });
            } else {
                const key = checkBox.parentElement.parentElement.children[1].textContent;
                const keyValue = {};
                keyValue[key] = false;
                // save local storage
                chrome.storage.local.set(keyValue);
            }
        });
    }
}

// 키워드 추가 버튼 동작
let keywordInputGroup = document.getElementById('keywordInputGroup');
let keywordAddBtn = document.getElementById('keywordAddBtn');
keywordAddBtn.addEventListener('click', (e) => {
    let keywordGrid = document.getElementById('keywordGrid');
    keywordInputGroup.style.top = (keywordGrid.offsetTop - 45) + "px";
    keywordInputGroup.style.left = keywordGrid.offsetLeft + "px";
    keywordInputGroup.hidden = false;
    document.getElementById('keywordInput').focus();
    document.getElementById('keywordSubmit').addEventListener('click', (e) => {
        let keyword = document.getElementById('keywordInput').value;
        if (!!keyword && keyword != "")
            addKeyword(keyword);
        document.getElementById('keywordInput').value = '';
    });
});
let keywordInputGroupCloseBtn = document.getElementById('keywordInputGroupCloseBtn')
keywordInputGroupCloseBtn.addEventListener('click', (e) => {
    keywordInputGroup.hidden = true;
});

function setKeywordBtn() {
    // select keyword
    let keywordTab = document.getElementsByClassName('keyword');

    for (let i = 0; i < keywordTab.length; i++) {
        keywordTab[i].addEventListener('click', (e) => {
            document.getElementsByClassName('selected-keyword')[0].classList.remove('selected-keyword');
            selectedKeyword = keywordTab[i].getAttribute('value');;

            e.target.classList.add('selected-keyword');
            let keywordNoticeGroup = document.getElementById("keywordNoticeList");

            keywordNoticeGroup.innerHTML = ``;

            if (!!!keywordNoticeList[selectedKeyword]) {

            } else if (keywordNoticeList[selectedKeyword].length == 0) {
                keywordNoticeGroup.innerHTML += `<div class="notice-empty">검색 결과가 없습니다.</div>`
            } else {
                let index = 1;
                for (const notice of keywordNoticeList[selectedKeyword]) {
                    let noticeElement = `<div class="notice-element">${index++}. <a class="notice-name" target="_blank" href="${notice.leftLink}">${notice.left}<small class="mute">${notice.date}</small></div></div>`;
                    keywordNoticeGroup.innerHTML += noticeElement;
                }
            }

            let deleteBtns = document.getElementsByClassName("keyword-delete-btn");
            for (let i = 0; i < deleteBtns.length; i++) {
                deleteBtns[i].addEventListener('click', (event) => {
                    deleteKeyword(deleteBtns[i].id);
                });
            }
        });
    }
}