const { json } = require("stream/consumers")

const cookieName = '中国人保'
sxh.msg('抓取ck成功！','')
const sxh = init()
if ($request  && $request.url.indexOf('appUserLoginInfo') >= 0) {
    sxh.msg('$request！','')
    const headers = JSON.stringify($request.headers)
    const headers_json = JSON.parse(headers)
    const token = headers_json["x-app-auth-token"]
    if (token) sxh.msg(cookieName,'抓取ck成功！','')
    const url = "https://bark.sunxihe.cloud:2043/KErXXnNLJjKrbf4JNnk2aV";
    const url_flask = "http://192.168.2.133:5000/api/data";
    const body = {
        body: token
    };
    //bark通知
    $httpClient.post({
      url: url,
      body: body
    }, function(error, response, data) {
      if (error) {
        console.log(error);
      } else {
        console.log(data);
      }
    });
    //写入本地数据库通知
    sxh.msg(cookieName,'写入本地数据库通','')
    const time = formatCurrentDate()
    const data = {
      "content": token,
      "time" : time
    };
    $httpClient.post({
      url: url_flask,
      body: data
    }, function(error, response, data) {
      if (error) {
        console.log(error);
        sxh.msg("程序发生错误",error)
        sxh.done()
      } else {
        res = JSON.parse(data)
        if (res.code == "200") {
          sxh.msg(cookieName,"添加到本地数据库成功!","恭喜")
        }
        sxh.done()
      }
    });
  }

function init() {
    isSurge = () => {
      return undefined === this.$httpClient ? false : true
    }
    isQuanX = () => {
      return undefined === this.$task ? false : true
    }
    getdata = (key) => {
      if (isSurge()) return $persistentStore.read(key)
      if (isQuanX()) return $prefs.valueForKey(key)
    }
    setdata = (key, val) => {
      if (isSurge()) return $persistentStore.write(key, val)
      if (isQuanX()) return $prefs.setValueForKey(key, val)
    }
    msg = (title, subtitle, body) => {
      if (isSurge()) $notification.post(title, subtitle, body)
      if (isQuanX()) $notify(title, subtitle, body)
    }
    log = (message) => console.log(message)
    get = (url, cb) => {
      if (isSurge()) {
        $httpClient.get(url, cb)
      }
      if (isQuanX()) {
        url.method = 'GET'
        $task.fetch(url).then((resp) => cb(null, {}, resp.body))
      }
    }
    post = (url, cb) => {
      if (isSurge()) {
        $httpClient.post(url, cb)
      }
      if (isQuanX()) {
        url.method = 'POST'
        $task.fetch(url).then((resp) => cb(null, {}, resp.body))
      }
    }
    done = (value = {}) => {
      $done(value)
    }
    return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
  }
// 格式化当前时间为指定格式：YYYY/MM/DD

function formatCurrentDate() {
  // 获取当前时间
  var now = new Date();

  // 获取年、月、日
  var year = now.getFullYear();
  var month = now.getMonth() + 1; // 月份从0开始，所以要加1
  var day = now.getDate();

  // 将单个数字的月份和日期补零
  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;

  // 格式化日期
  var formattedDate = year + '/' + month + '/' + day;

  return formattedDate;
}
