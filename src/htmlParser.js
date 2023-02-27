function parseHTML(html){
    let noticeList = [];

    let re = /<tr[^>]*>((.|[\n\r])*)<\/tr>/g;
    let trElement = re.exec(html);

    if (trElement == null) {
        return [];
    }

    trElement = trElement[0].split('</tr>');

    for (let j = 1; j < trElement.length; j++) {
        if (trElement.length == 1 || trElement[j] == ""){
            break;
        }
        // mnom
        re = /<th scope="row" class="mnom">([^]*)<\/th>/g;
       
        if ( re.exec(trElement[j])[1].includes("<img")) {
            continue;
        }

        let notice = {};
        
        // group 
        re = /<span class="group">([^>]*)<\/span>/g;
        notice['group'] = re.exec(trElement[j])[1];

        // left(제목)
        re = /<a[^>]*>([^<]*)/g;
        notice['left'] = re.exec(trElement[j])[1];

        // 링크
        re = /<a href="([^>"]*)\"/g;
        notice['leftLink'] = "https://www.jbnu.ac.kr/kor" + re.exec(trElement[j])[1];

        // 날짜
        re = /<td class="mview">([0-9]{4}.[0-9]{2}.[0-9]{2})<\/td>/g;
        let date = re.exec(trElement[j])[1];
        notice['date'] = date; 

        noticeList.push(notice);
    }

    return noticeList;
}

function parseHTMLWithPivotDate(html, pivotDate){
    let noticeList = [];

    let re = /<tr[^>]*>((.|[\n\r])*)<\/tr>/g;
    let trElement = re.exec(html);

    if (trElement == null) {
        return [[], true];
    }
    
    trElement = trElement[0].split('</tr>');


    for (let j = 1; j < trElement.length; j++) {
        if (trElement.length == 1 || trElement[j] == ""){
            break;
        }
         // mnom
         re = /<th scope="row" class="mnom">([^]*)<\/th>/g;
       
         if ( re.exec(trElement[j])[1].includes("<img")) {
             continue;
         }

        let notice = {};
        
        // group 
        re = /<span class="group">([^>]*)<\/span>/g;
        notice['group'] = re.exec(trElement[j])[1];

        // left(제목)
        re = /<a[^>]*>([^<]*)/g;
        notice['left'] = re.exec(trElement[j])[1];

        // 링크
        re = /<a href="([^>"]*)\"/g;
        notice['leftLink'] = "https://www.jbnu.ac.kr/kor" + re.exec(trElement[j])[1];

        // 날짜
        re = /<td class="mview">([0-9]{4}.[0-9]{2}.[0-9]{2})<\/td>/g;
        let date = re.exec(trElement[j])[1];
        notice['date'] = date; 
        

        if (new Date(date) < pivotDate) {
            return [noticeList, true]
        }
        noticeList.push(notice);
    }

    return [noticeList, false];
}

export {parseHTML, parseHTMLWithPivotDate}