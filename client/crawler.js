fetch('http://localhost:8080/notice?page=1').then((res) => res.json()).then((data) => {
        console.log(data);
        const noticeList = JSON.parse(data);
        let noticeGroup = document.getElementById("noticeGroup");
        for (const notice of noticeList) {
            let noticeElement = `<div class="notice-element"><a class="notice-name" target="_blank" href="${notice.leftLink}">${notice.left}</div></div>`;
            noticeGroup.innerHTML += noticeElement;
        }
    });