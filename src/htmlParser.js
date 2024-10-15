const articleNum_pattern = /onclick="pf_DetailMove\('(\d+)'\)/
const date_pattern = /<li>(\d{4}-\d{2}-\d{2})<\/li>/
const title_pattern =
  /<a[^>]*>\s*(?:<img[^>]*>)?\s*([^<]+)(?:<img[^>]*>)?\s*<\/a>/

function getArticleLink(articleNumber) {
  return `https://www.jbnu.ac.kr/web/Board/${articleNumber}/detailView.do?pageIndex=2&menu=2377`
}
function getNotice(tr) {
  let notice = {}

  let titleMatch = title_pattern.exec(tr)
  let articleNumMatch = articleNum_pattern.exec(tr)
  let dateMatch = date_pattern.exec(tr)
  // left(제목)
  notice["left"] = titleMatch ? titleMatch[1] : null

  // 링크
  notice["leftLink"] = articleNumMatch
    ? getArticleLink(articleNumMatch[1])
    : null

  // 날짜
  notice["date"] = dateMatch ? dateMatch[1] : null

  return notice
}

function parseHTML(html) {
  let noticeList = []

  let re = /<tr[^>]*>((.|[\n\r])*)<\/tr>/g
  let trElement = re.exec(html)

  if (trElement == null) {
    return []
  }

  trElement = trElement[0].split("</tr>")

  for (let j = 1; j < trElement.length; j++) {
    if (trElement.length == 1 || trElement[j] == "") {
      break
    }

    noticeList.push(getNotice(trElement[j]))
  }

  return noticeList
}

function parseHTMLWithPivotDate(html, pivotDate) {
  let noticeList = []

  let re = /<tr[^>]*>((.|[\n\r])*)<\/tr>/g
  let trElement = re.exec(html)

  if (trElement == null) {
    return [[], true]
  }

  trElement = trElement[0].split("</tr>")

  for (let j = 1; j < trElement.length; j++) {
    if (trElement.length == 1 || trElement[j] == "") {
      break
    }
    let notice = getNotice(trElement[j])

    if (new Date(notice["date"]) < pivotDate) {
      return [noticeList, true]
    }
    noticeList.push(notice)
  }

  return [noticeList, false]
}

export { parseHTML, parseHTMLWithPivotDate }
