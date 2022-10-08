(function() {
    // const baseURL = `http://localhost:8080`;
    const univURL = `http://www.jbnu.ac.kr/kor/?menuID=139`;
    let selectedBelt = 'whiteBelt';
    let myFile = {};
    let noticeList = [];
    fetch(univURL).then((res) => res.text()).then((html) => {
        // html 파싱
        let parser = new DOMParser();
	    let doc = parser.parseFromString(html, 'text/html');
        
        let trElement = doc.querySelectorAll('table tbody tr');

        for(let i = 0; i < trElement.length; i++) {
            let notice = {};
            let thElement = trElement[i].children;
            
            if(thElement[0].innerText == "") continue;


            let groupElement = thElement[1].querySelector('span');
            let leftElement = thElement[2].querySelector('span a');

            notice['group'] = groupElement.innerText;
            notice['left'] = leftElement.innerText;
            notice['leftLink'] = "https://www.jbnu.ac.kr/kor" + leftElement.getAttribute('href');
            date = thElement[5].innerText;
            if(new Date(date) < new Date()) 
                break;
            notice['date'] = date;

            noticeList.push(notice);
        }

        // 파싱 데이터 html 로 변경
        let noticeGroup = document.getElementById("noticeGroup");

        if(noticeList.length == 0) {
            noticeGroup.innerHTML += `<div class="notice-empty">올라온 공지가 없습니다.</div>`
        } else {
            let index = 1;
            for(const notice of noticeList) {
                let noticeElement = `<div class="notice-element">${index++}. <a class="notice-name" target="_blank" href="${notice.leftLink}">${notice.left}</div></div>`;
                noticeGroup.innerHTML += noticeElement;
            }
        }

    });
    
    chrome.runtime.getPackageDirectoryEntry(function(root) {
        root.getDirectory("assets", {}, (dirEntry) => {
            dirEntry.getDirectory("json", {}, (dirEntry) => {
                dirEntry.getFile("belt.json", {}, function(fileEntry) {
                    fileEntry.file(function(file) {
                        let reader = new FileReader();
                        reader.onloadend = function(e) {
                            myFile = JSON.parse(this.result);
                            
                            updateCheckList();
                        };
                        reader.readAsText(file);
                    });
                });
            });
        });
    });

    let beltSection = document.getElementById("beltSection").children;

    for(let section of beltSection) {
        section.addEventListener('click', (e) => {
            selectedBelt = section.id;
            updateCheckList();
        });
    }

    // update checklist
    async function updateCheckList() {
        let checkList = document.getElementById("checkList");

        checkList.tBodies[0].innerHTML = ``;
        
        for(const section of myFile[selectedBelt]) {
            const savedData = await getLocal(section.name);
            const isChecked = !!savedData[section.name];
            if(isChecked) {
                checkList.tBodies[0].innerHTML += `<tr><td><input class="check-box" type="checkbox" checked></td><td class="check-element">${section.name}</td></tr>`;
            } else {
                checkList.tBodies[0].innerHTML += `<tr><td><input class="check-box" type="checkbox"></td><td class="check-element">${section.name}</td></tr>`;
            }    
        }

        updateCheckBoxEventListener();
    }

    function getLocal(key) {
        return new Promise((resovle, reject) => {
            chrome.storage.local.get(key, (item) => {
                if(chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }

                resovle(item);
            });
        });
    }
    function updateCheckBoxEventListener() {
        
        let checkBoxes = document.getElementsByClassName("check-box");
    
        for(let checkBox of checkBoxes) {
            checkBox.addEventListener('change', () => {
                if(checkBox.checked) {
                    const key = checkBox.parentElement.parentElement.children[1].textContent;
                    const keyValue = {};
                    keyValue[key] = true;
                    // save local storage
                    chrome.storage.local.set(keyValue, ()=> {
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
})();