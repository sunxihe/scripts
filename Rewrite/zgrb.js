const cookieName = '中国人保'
const sxh = init()

const bark_switch = sxh.getdata('bark_switch')
const database_switch = sxh.getdata('database_switch')
if (sxh.getdata('zgrb_time') == "") {
    sxh.setdata("1970/01/01", 'zgrb_time');
}
zgrb_time = sxh.getdata('zgrb_time');
console.log(zgrb_time);
const now_time = formatCurrentDate()

if ($request  && $request.url.indexOf('appUserLoginInfo') >= 0) {
    const headers = JSON.stringify($request.headers)
    const headers_json = JSON.parse(headers)
    const token = headers_json["x-app-auth-token"]
    if (token) {
      console.log(token);
      sxh.msg(cookieName,'','抓取ck成功！')
      if (bark_switch == "true") {
        const bark_address = sxh.getdata('bark_address')
        if (!bark_address) {
          sxh.msg(cookieName,'','Bark地址未填写!请在boxjs中配置！')
        }
        const url = bark_address;
        const body = {
          body: token
        };
        //bark通知
        sxh.post({
          url: url,
          body: body
        }, function(error, response, data) {
          if (error) {
            console.log(error);
          } else {
            console.log(data);
          }
        });
      }
      if (database_switch  == "true") {
        const datebase_address = sxh.getdata('datebase_address')
        const datebase_table = sxh.getdata('datebase_table')
        if (!datebase_address && datebase_table) {
          sxh.msg(cookieName,'','数据库信息未配置!请在boxjs中配置！')
        }
        //写入本地数据库通知
        const data = {
          "content": token,
          "time" : now_time,
          "table": datebase_table
          };
        sxh.post({
          url: datebase_address,
          body: data
        }, function(error, response, data) {
          if (error) {
            console.log(error);
            sxh.msg("程序发生错误",error)
            sxh.done()
          } else {
            res = JSON.parse(data)
            if (res.code == "200") {
              sxh.msg(cookieName,"","添加到本地数据库成功!")
            }else if(res.code == "203") {
              sxh.msg(cookieName,"","数据库已存在该字段!")
            }
            sxh.done()
          }
        });
      }
      // 将另一个日期字符串转换为 Date 对象
      var time1 = new Date(zgrb_time);
      var time2 = new Date(now_time);
      // 比较两个日期的大小
      if (time2 > time1) {
        sxh.setdata("","zgrbck")
        sxh.setdata(now_time,"zgrb_time")
      } else {
        console.log("不做处理");
      }
      const zgrbck = sxh.getdata("zgrbck")
      zgrbck == "" ? sxh.setdata(token,"zgrbck") : sxh.setdata(zgrbck+"\n"+token,"zgrbck")
    }
    sxh.done()

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