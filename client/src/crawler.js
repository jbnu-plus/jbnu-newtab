(function() {
    let selectedBelt = 'whiteBelt';
    let myFile = {};

    fetch('http://localhost:8080/notice').then((res) => res.json()).then((data) => {
        console.log(data);
        const noticeList = JSON.parse(data);
        let noticeGroup = document.getElementById("noticeGroup");
        for (const notice of noticeList) {
            let noticeElement = `<div class="notice-element"><a class="notice-name" target="_blank" href="${notice.leftLink}">${notice.left}</div></div>`;
            noticeGroup.innerHTML += noticeElement;
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
                checkList.tBodies[0].innerHTML += `<tr><td><input class="check-box" type="checkbox" checked></td><td>${section.name}</td></tr>`;
            } else {
                checkList.tBodies[0].innerHTML += `<tr><td><input class="check-box" type="checkbox"></td><td>${section.name}</td></tr>`;
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