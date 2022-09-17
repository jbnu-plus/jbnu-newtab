package main

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/antchfx/htmlquery"
	"github.com/gin-gonic/gin"
)

type Notice struct {
	Group    string `json:"group"`
	Left     string `json:"left"`
	LeftLink string `json:"lefLink"`
}

func Cralwer() ([]Notice, error) {
	doc, err := htmlquery.LoadURL("https://www.jbnu.ac.kr/kor/?menuID=139&pno=1")

	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	list, err := htmlquery.QueryAll(doc, "//table/tbody/tr")

	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	noticeList := []Notice{}

	for _, val := range list {
		tdList, err := htmlquery.QueryAll(val, "//td")
		if err != nil {
			fmt.Println(err)
			return nil, err
		}

		group, err := htmlquery.Query(tdList[0], "//span")

		if err != nil {
			fmt.Println(err)
			return nil, err
		}

		left, err := htmlquery.Query(tdList[1], "//span/a")

		if err != nil {
			fmt.Println(err)
			return nil, err
		}

		noticeList = append(noticeList, Notice{strings.Trim(strings.Replace(strings.Replace(htmlquery.InnerText(group), "\t", "", -1), "\n", "", -1), " "), strings.Trim(strings.Replace(strings.Replace(htmlquery.InnerText(left), "\t", "", -1), "\n", "", -1), " "), "https://jbnu.ac.kr" + htmlquery.SelectAttr(left, "href")})
		// noticeList = append(noticeList, Notice{ strings.Trim(strings.Trim(strings.Trim(htmlquery.SelectAttr(group, "value"), " "),"\t"),"\n"),  strings.Trim(strings.Trim(strings.Trim(htmlquery.SelectAttr(left, "value"), " "), "\t"), "\n"), "https://jbnu.ac.kr" + htmlquery.SelectAttr(left, "href")})
	}

	return noticeList, nil
}

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		noticeList, err := Cralwer()
		if err != nil {
			fmt.Println(err)
		}
		res, err := json.Marshal(noticeList)
		if err != nil {
			fmt.Println(err)
		}
		fmt.Println(string(res))

		c.JSON(200, string(res))
	})

	r.Run()
}
