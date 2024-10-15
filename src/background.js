import * as chromeAPI from "./chromeAPI.js"
import * as htmlParser from "./htmlParser.js"

async function getRecentNotices() {
  const data = await chromeAPI.getLocal("recentNotice")
  if (data.constructor === Object && Object.keys(data).length === 0) {
    return []
  } else {
    const recentNotice = data["recentNotice"]
    return recentNotice
  }
}

function checkNotice(recentNotice, notice) {
  if (recentNotice === null) {
    return false
  }
  if (recentNotice["left"] != notice["left"]) {
    return false
  }
  if (recentNotice["leftLink"] != notice["leftLink"]) {
    return false
  }
  if (recentNotice["date"] != notice["date"]) {
    return false
  }
  return true
}

const searchKeyword = async function () {
  const recentNotices = await getRecentNotices()
  const keywords = recentNotices.map((n) => n["keyword"])

  for (let i = 0; i < keywords.length; i++) {
    await fetch("https://www.jbnu.ac.kr/web/index.do")
      .then((response) => response.text())
      .then(async (html) => {
        // CSRF 토큰을 정규식을 사용하여 추출
        const csrfTokenMatch = html.match(
          /<meta\s+name="_csrf"\s+content="([^"]+)"/
        )
        const csrfToken = csrfTokenMatch ? csrfTokenMatch[1] : null

        if (csrfToken) {
          //   console.log("CSRF Token:", csrfToken)

          // Step 2: POST 요청으로 받은 CSRF 토큰 사용

          const data = {
            bbsClsfUnqNo: "BT_0000000040",
            menuUnqNo: "MN_0000002377",
            pstFileUnqNo: "",
            pstThumUnqNo: "",
            pstUnqNo: "",
            actionView: "insertView",
            pstPswd: "",
            searchCondition: "title",
            searchKeyword: keywords[i],
          }

          await fetch(
            "https://www.jbnu.ac.kr/web/news/notice/sub01.do?pageIndex=1&menu=2377",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-CSRF-TOKEN": csrfToken, // GET 요청으로 받은 CSRF 토큰 사용
              },
              body: new URLSearchParams(data),
            }
          )
            .then((res) => res.text())
            .then((html) => {
              let noticeList = htmlParser.parseHTML(html)
              for (let idx = 0; idx < noticeList.length; idx++) {
                if (
                  checkNotice(recentNotices[i].recentNotice, noticeList[idx])
                ) {
                  break
                } else {
                  chromeAPI.createNotification(
                    "새로운 공지사항이 등록됐습니다.",
                    noticeList[idx].left,
                    noticeList[idx].leftLink
                  )
                }
              }
              if (!!noticeList[0]) {
                recentNotices[i].recentNotice = noticeList[0]
              }
            })
        } else {
          console.error("CSRF Token not found")
        }
      })
  }
  console.log(recentNotices)
  let keyValue = { recentNotice: recentNotices }
  chromeAPI.setLocal(keyValue)
}

const updateRecentNotices = async function (details) {
  if (details.reason === "update" && details.previousVersion < "1.1.0") {
    const keyValue = { keyword: [] }
    await chromeAPI.setLocal(keyValue)
  }
}

chrome.alarms.create({ periodInMinutes: 1 })

chrome.alarms.onAlarm.addListener(() => {
  searchKeyword().catch(console.log)
})

chrome.notifications.onClicked.addListener((notificationId) => {
  const link = notificationId.split(",")
  chromeAPI.createNewTab(link[0], notificationId)
})

chrome.runtime.onInstalled.addListener(updateRecentNotices)
