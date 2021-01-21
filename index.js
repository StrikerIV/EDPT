const fs = require("fs");
const cheerio = require('cheerio');
const got = require('got');
const { parse } = require("node-html-parser");
const { table } = require("console");
const HtmlTableToJson = require('html-table-to-json');

async function main() {

    updateCommodities()
    //sortCommodities()

}

function isData(tableRow) {
    return /[a-zA-Z]+/g.test(tableRow);
}

function buildCommodityObject(category, com, price, sell, profit, pbuy, psell) {
    return Commodity = {
        category: category,
        name: com,
        price: price,
        sell: sell,
        profit: profit,
        buyPercentage: pbuy,
        sellPercentage: psell
    }
}

async function updateCommodities() {

    const request = require('request');
    const url = 'https://eddb.io/commodity';
    const tableArray = []

    request(url, (err, res, html) => {
        let $ = cheerio.load(html);
        $('table[id="commodities-table"] > tbody > tr > td').toArray().map(item => {
            let tableRowText = $(item).text()
            tableArray.push(tableRowText.replace(/\B\s+|\s+\B/g, ''))
        });
        console.log(tableArray)

        let currentCategory = null;
        let currentCommodity = null;

        let determined = false;

        let commodityPrice = null;
        let commoditySell = null;
        let commodityProfit = null;
        let commodityPctBuy = null;
        let commodityPctSell = null;

        let commodityPropertyCount = 0
        let commodityCount = 0

        tableArray.forEach((value, index) => {
            //checks if category or commodity
            if (!/[a-zA-Z]+/g.exec(value)) {
                if (!determined) {
                    currentCategory = tableArray[index - 2]
                    currentCommodity = tableArray[index - 1]
                    determined = true
                    return
                } else {
                    if (commodityCount == 100) return
                    commodityCount++
                    commodityPropertyCount++
                    switch (commodityPropertyCount) {
                        case 1:
                            commodityPrice = value
                            break;
                        case 2:
                            commoditySell = value
                            break;
                        case 3:
                            commodityProfit = value
                            break;
                        case 4:
                            commodityPctBuy = value
                            break;
                        default:
                            console.log(buildCommodityObject(currentCategory, currentCommodity, commodityPrice, commoditySell, commodityProfit, commodityPctBuy, value))
                            commodityPropertyCount = 0
                            determined = false

                    }
                }
            }
        })
    });


}

async function sortCommodities() {

    fs.readFile("./commodities.json", "utf8", (err, data) => {
        data = JSON.parse(data)

        const jsonAsArray = Object.keys(data).map(function (key) {
            return data[key];
        })
            .sort(function (itemA, itemB) {
                return itemA.score == itemB.score;
            });

        console.log(jsonAsArray)
    })
}

main()