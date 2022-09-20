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
                            
                            let checkList = document.getElementById("checkList");
                            
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

    function updateCheckList() {
        checkList.tBodies[0].innerHTML = ``;
        for(const section of myFile[selectedBelt]) {
            checkList.tBodies[0].innerHTML += `<tr><td><input type="checkbox"></td><td>${section.name}</td></tr>`;
        }
    }
})();