var config = require("./config.js").config;
var channel_config = require("./channel_config.js").channel_config;

var Base64 = require("js-base64").Base64,
    util = require("util"),
    CronJob = require("cron").CronJob,
    http = require("http"),
    cheerio = require("cheerio"),
    _ = require("underscore");

var url_seed = "http://www.katc.mil.kr/katc/popup_childrenSearch.jsp?search_val2=%s&birthDay=%s&search_val3=%s";
var katc_mail_address = {
    "23연대": "충청남도 논산시 연무읍 득안대로 504번길 사서함 76-8호",
    "25연대": "충청남도 논산시 연무읍 득안대로 504번길 사서함 76-9호",
    "26연대": "충청남도 논산시 연무읍 득안대로 504번길 사서함 76-10호",
    "27연대": "충청남도 논산시 연무읍 득안대로 504번길 사서함 76-11호",
    "28연대": "충청남도 논산시 연무읍 득안대로 504번길 사서함 76-12호",
    "29연대": "충청남도 논산시 연무읍 득안대로 504번길 사서함 76-13호",
    "30연대": "충청남도 논산시 연무읍 득안대로 504번길 사서함 76-14호",
};
var katc_check_url = util.format(url_seed, Base64.encode(config.birthDay), config.birthDay, encodeURIComponent(config.name));

console.log(katc_check_url);
var full_string;

http.get(katc_check_url, function (res) {
    var body = '';
    res.on('data', function(chunk) {
        body += chunk;
    });
    res.on('end', function() {
        handleBody(body);
    });
}).on("error", function (e) {
    console.log("Got error: " + e.message);
});


//var job = new CronJob("00 30 15 * * 2", function(){
var job = new CronJob("*/3 * * * * *",
    function () {
        // Runs every Monday at 15:30:00
        if (full_string) {
            start();
        }
    }, function () {
        console.log("stop");
    },
    true /* Start the job right now */,
    "Asia/Seoul" /* Time zone of this job. */
);

channel_config = channel_config || {};

function start() {
    for (var key in channel_config) {
        channel_config[key].send(full_string);
    }
}

function handleBody(body) {
    $ = cheerio.load(body);
    trs = $("tbody tr");
    if (trs.length == 0) {
        console.log("아직 훈련병의 주소가 나오지 않았습니다.")
        return;
    }
    trs.each(function(idx, _tr) {
        var person_elem = $(_tr).find("td"),
            result = [].map.call(person_elem, function(e2) {
            return $(e2).text().trim()
                .split("\n")[0].trim()
                .replace(/^[0]+/,"");
            });

        // [입영일, 연대, 중대, 소대, 훈련병 번호, 생년월일, 이름]
        converted_date = result[0].replace(/(\d{4})(\d{2})(\d{2})/,"$1년 $2월 $3일")
        converted_name = util.format("%s %s %s %s번 %s 훈련병",result[1], result[2], result[3], result[4], config.name);
        full_string =
            util.format("%s에 입대한 %s의 훈련병 번호가 나왔습니다.\n%s!!!\n\n",
                converted_date, config.name, converted_name) +
            util.format("http://www.katc.mil.kr/ 로 가셔서 입영날짜: %s, 생년월일: %s, 이름: %s를 넣고 검색해서 편지 보내주시거나\n\n",
                config.startDate, config.birthDay, config.name) +
            util.format("\"%s\n%s\"으로 손편지 보내주시면 훈련병에게 힘이 됩니다.", katc_mail_address[result[1]], converted_name);

    })
}

