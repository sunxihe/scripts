const cookieName = '中国移动云盘'

const sxh = init()
var phone = ""
if ($request  && $request.url.indexOf('authToken') >= 0) {
    //const headers = JSON.stringify($request.headers)
    const respbody = $response.body
    // 匹配 <token> 标签内的内容
    const tokenRegex = /<token>(.*?)<\/token>/;
    const match = respbody.match(tokenRegex);
    if (match) {
      sxh.msg(cookieName,'抓取token成功！')
      const token = match[1];
      sxh.setdata(token,"zgydck_token")
    } else {
      sxh.msg(cookieName,'失败')
      console.log('Token not found');
    }
    //sxh.msg(cookieName,typeof(reqbody))
    //const headers_json = JSON.parse(headers)
    //const tokenRegex = /token=([^&]+)/; // 匹配token=后跟的任意字符，直到遇到&
    //const token = body.match(tokenRegex);
    //sxh.msg(cookieName,token)
    //if (token) sxh.msg(cookieName,'抓取token成功！')
    // const url = "https://api.day.app/o2tFWuZJpQBS8kr8TDENqd";
    // const url_flask = "https://py.sunxihe.cloud:2043/writeck";
    // const body = {
    //     body: token
    //   };
    //   $httpClient.post({
    //     url: url,
    //     body: body
    //   }, function(error, response, data) {
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       console.log(data);
    //     }
    //   });
  
  }else if(sxh.getdata("zgydck_token")!="" && $request.url.indexOf('query') >= 0){
    const headers = JSON.stringify($request.headers)
    const reqbody = $request.body
    const headers_json = JSON.parse(headers)
    const auth = headers_json["Authorization"]
    // 匹配 <token> 标签内的内容
    // 匹配 <account> 标签内的内容
    const accountRegex = /<account>(.*?)<\/account>/;
    const match = reqbody.match(accountRegex);
    if (match) {
      phone = match[1];
    } else {
      console.log('Account not found');
    }
    if (auth) {
      token = sxh.getdata("zgydck_token")
      final_res = auth+phone+token
      zgypck = sxh.getdata("zgydck")
      final_res =zgypck +"@"+auth+"#"+phone+"#"+token
      sxh.setdata(final_res,"zgydck")
      sxh.msg(cookieName,'成功写入boxjs')
      setdata("","zgydck_token")
    }
  }

sxh.done()
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