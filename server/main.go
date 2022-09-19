package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/antchfx/htmlquery"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Notice struct {
	Group    string `json:"group"`
	Left     string `json:"left"`
	LeftLink string `json:"leftLink"`
	Date     string `json:"date"`
}

func Cralwer() ([]Notice, error) {
	noticeList := []Notice{}
	for page := 1; page <= 10; page++ {
		doc, err := htmlquery.LoadURL("https://www.jbnu.ac.kr/kor/?menuID=139&pno=" + strconv.Itoa(page))

		if err != nil {
			fmt.Println(err)
			return nil, err
		}

		list, err := htmlquery.QueryAll(doc, "//table/tbody/tr")

		if err != nil {
			fmt.Println(err)
			return nil, err
		}

		for _, val := range list {
			thElement, err := htmlquery.Query(val, "//th")
			if err != nil {
				fmt.Println(err)
				return nil, err
			}

			if htmlquery.InnerText(thElement) == "" {
				continue
			}

			tdList, err := htmlquery.QueryAll(val, "//td")
			if err != nil {
				fmt.Println(err)
				return nil, err
			}

			groupElement, err := htmlquery.Query(tdList[0], "//span")

			if err != nil {
				fmt.Println(err)
				return nil, err
			}

			leftElement, err := htmlquery.Query(tdList[1], "//span/a")

			if err != nil {
				fmt.Println(err)
				return nil, err
			}

			// 구분
			group := strings.Trim(strings.Replace(strings.Replace(htmlquery.InnerText(groupElement), "\t", "", -1), "\n", "", -1), " ")
			// 제목
			left := strings.Trim(strings.Replace(strings.Replace(htmlquery.InnerText(leftElement), "\t", "", -1), "\n", "", -1), " ")
			// 게시글 링크
			leftLink := "https://www.jbnu.ac.kr/kor" + htmlquery.SelectAttr(leftElement, "href")
			// 날짜
			date := htmlquery.InnerText(tdList[4])

			now := time.Now().Format("2006.01.02")
			// fmt.Println(date, now)

			if now != date {
				return noticeList, nil
			}
			noticeList = append(noticeList, Notice{group, left, leftLink, date})
		}
	}

	return noticeList, nil
}

func main() {
	r := gin.Default()

	r.Use(cors.Default())

	r.GET("/notice", func(c *gin.Context) {
		noticeList, err := Cralwer()
		if err != nil {
			fmt.Println(err)
		}
		res, err := json.Marshal(noticeList)
		if err != nil {
			fmt.Println(err)
		}
		fmt.Println(string(res))

		c.PureJSON(200, string(res))
	})

	r.Run()
}
