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
                        const myFile = JSON.parse(this.result);
                        console.log(myFile);
                    };
                    reader.readAsText(file);
                });
            });
        });
    });
});