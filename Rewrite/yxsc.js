const cookieName = "yxsc抓包";
const barkSwitch = "bark_switch";
// const AppGetCookieRegex = /https:\/\/dict\.youdao\.com\/dictusertask\/cheese\/collectCoins/; 
const AppGetCookieRegex = /https:\/\/www\.yuexiang365\.cn\/api\/V3\.8\/randomSearchText/; 

const databaseSwitch = "database_switch";
const $ = MagicJS(cookieName, "INFO");



async function getZgrbAppCookie() {
    try {
        const body = $.request.body
        // 使用 URLSearchParams 来解析查询字符串
        const params = new URLSearchParams(queryString);
        // 提取 token 的值
        const token = params.get("token");
        console.log("提取的 token 值是：", token);
        if (token) {
            $.notification.post(cookieName, "", "抓取成功")
            if ($.data.read(barkSwitch)) {
                const bark_address = $.data.read('bark_address')
                if (bark_address == "") {
                    $.notification.post(cookieName, '', 'Bark地址未填写!请在boxjs中配置！')
                } else {
                    $.notification.setBark(bark_address)
                    $.notification.bark(cookieName, '', token)
                }

            }
            if ($.data.read(databaseSwitch)) {
                const datebase_address = $.data.read('datebase_address')
                const datebase_table = $.data.read('datebase_table')
                if (datebase_address == "" || datebase_table == "") {
                    $.notification.post(cookieName, '', '数据库信息未配置!请在boxjs中配置！')
                } else {
                    //写入本地数据库通知
                    const data = {
                        "content": token,
                        "time": now_time,
                        "table": datebase_table
                    };
                     await $.http.post({
                         url:datebase_address,
                         body:data
                     }).then((resp)=>{
                         res = resp.body;
                        if (res.code == 200) {
                            $.notification.post(cookieName, "", "写入数据库成功");
                        } else {
                            $.notification.post(cookieName, "", "写入数据库失败,请检查");
                        }
                     }).catch((err)=>{
                        $.logger.error(`信息异常，${err}`);
                     })
                }


            }
            const yxscck = $.data.read("yxscck")
            yxscck == "" ? $.data.write("yxscck", token) : $.data.write("yxscck", zgrbck + "\n" + token)
        }
    } catch (err) {
        $.logger.error(`获取yxsc抓包Cookies出现异常，${err}`);
    }
}

(async () => {
    if ($.isRequest && AppGetCookieRegex.test($.request.url)) {
        await getZgrbAppCookie();
    } else {
        $.logger.error(`没有进来`);
    }
    $.done();
})();


/**
 *
 * $$\      $$\                     $$\             $$$$$\  $$$$$$\         $$$$$$\
 * $$$\    $$$ |                    \__|            \__$$ |$$  __$$\       $$ ___$$\
 * $$$$\  $$$$ | $$$$$$\   $$$$$$\  $$\  $$$$$$$\      $$ |$$ /  \__|      \_/   $$ |
 * $$\$$\$$ $$ | \____$$\ $$  __$$\ $$ |$$  _____|     $$ |\$$$$$$\          $$$$$ /
 * $$ \$$$  $$ | $$$$$$$ |$$ /  $$ |$$ |$$ /     $$\   $$ | \____$$\         \___$$\
 * $$ |\$  /$$ |$$  __$$ |$$ |  $$ |$$ |$$ |     $$ |  $$ |$$\   $$ |      $$\   $$ |
 * $$ | \_/ $$ |\$$$$$$$ |\$$$$$$$ |$$ |\$$$$$$$\\$$$$$$  |\$$$$$$  |      \$$$$$$  |
 * \__|     \__| \_______| \____$$ |\__| \_______|\______/  \______/        \______/
 *                        $$\   $$ |
 *                        \$$$$$$  |
 *                         \______/
 *
 */
// @formatter:off
function MagicJS(scriptName = "MagicJS", logLevel = "INFO") {
    const MagicEnvironment = () => {
        const isLoon = typeof $loon !== "undefined";
        const isQuanX = typeof $task !== "undefined";
        const isNode = typeof module !== "undefined";
        const isSurge = typeof $httpClient !== "undefined" && !isLoon;
        const isStorm = typeof $storm !== "undefined";
        const isStash = typeof $environment !== "undefined" && typeof $environment["stash-build"] !== "undefined";
        const isSurgeLike = isSurge || isLoon || isStorm || isStash;
        const isScriptable = typeof importModule !== "undefined";
        return {
            isLoon: isLoon,
            isQuanX: isQuanX,
            isNode: isNode,
            isSurge: isSurge,
            isStorm: isStorm,
            isStash: isStash,
            isSurgeLike: isSurgeLike,
            isScriptable: isScriptable,
            get name() {
                if (isLoon) {
                    return "Loon"
                } else if (isQuanX) {
                    return "QuantumultX"
                } else if (isNode) {
                    return "NodeJS"
                } else if (isSurge) {
                    return "Surge"
                } else if (isScriptable) {
                    return "Scriptable"
                } else {
                    return "unknown"
                }
            },
            get build() {
                if (isSurge) {
                    return $environment["surge-build"]
                } else if (isStash) {
                    return $environment["stash-build"]
                } else if (isStorm) {
                    return $storm.buildVersion
                }
            },
            get language() {
                if (isSurge || isStash) {
                    return $environment["language"]
                }
            },
            get version() {
                if (isSurge) {
                    return $environment["surge-version"]
                } else if (isStash) {
                    return $environment["stash-version"]
                } else if (isStorm) {
                    return $storm.appVersion
                } else if (isNode) {
                    return process.version
                }
            },
            get system() {
                if (isSurge) {
                    return $environment["system"]
                } else if (isNode) {
                    return process.platform
                }
            },
            get systemVersion() {
                if (isStorm) {
                    return $storm.systemVersion
                }
            },
            get deviceName() {
                if (isStorm) {
                    return $storm.deviceName
                }
            }
        }
    };
    const MagicLogger = (scriptName, logLevel = "INFO") => {
        let _level = logLevel;
        const logLevels = {SNIFFER: 6, DEBUG: 5, INFO: 4, NOTIFY: 3, WARNING: 2, ERROR: 1, CRITICAL: 0, NONE: -1};
        const logEmoji = {
            SNIFFER: "",
            DEBUG: "",
            INFO: "",
            NOTIFY: "",
            WARNING: "❗ ",
            ERROR: "❌ ",
            CRITICAL: "❌ ",
            NONE: ""
        };
        const _log = (msg, level = "INFO") => {
            if (!(logLevels[_level] < logLevels[level.toUpperCase()])) console.log(`[${level}] [${scriptName}]\n${logEmoji[level.toUpperCase()]}${msg}\n`)
        };
        const setLevel = logLevel => {
            _level = logLevel
        };
        return {
            getLevel: () => {
                return _level
            }, setLevel: setLevel, sniffer: msg => {
                _log(msg, "SNIFFER")
            }, debug: msg => {
                _log(msg, "DEBUG")
            }, info: msg => {
                _log(msg, "INFO")
            }, notify: msg => {
                _log(msg, "NOTIFY")
            }, warning: msg => {
                _log(msg, "WARNING")
            }, error: msg => {
                _log(msg, "ERROR")
            }, retry: msg => {
                _log(msg, "RETRY")
            }
        }
    };
    return new class {
        constructor(scriptName, logLevel) {
            this._startTime = Date.now();
            this.version = "3.0.0";
            this.scriptName = scriptName;
            this.env = MagicEnvironment();
            this.logger = MagicLogger(scriptName, logLevel);
            this.http = typeof MagicHttp === "function" ? MagicHttp(this.env, this.logger) : undefined;
            this.data = typeof MagicData === "function" ? MagicData(this.env, this.logger) : undefined;
            this.formatCurrentDate = typeof formatCurrentDate === "function" ? formatCurrentDate() : undefined;
            this.notification = typeof MagicNotification === "function" ? MagicNotification(this.scriptName, this.env, this.logger, this.http) : undefined;
            this.utils = typeof MagicUtils === "function" ? MagicUtils(this.env, this.logger) : undefined;
            this.qinglong = typeof MagicQingLong === "function" ? MagicQingLong(this.env, this.data, this.logger) : undefined;
            if (typeof this.data !== "undefined") {
                let magicLoglevel = this.data.read("magic_loglevel");
                const barkUrl = this.data.read("magic_bark_url");
                if (magicLoglevel) {
                    this.logger.setLevel(magicLoglevel.toUpperCase())
                }
                if (barkUrl) {
                    this.notification.setBark(barkUrl)
                }
            }
        }

        get isRequest() {
            return typeof $request !== "undefined" && typeof $response === "undefined"
        }

        get isResponse() {
            return typeof $response !== "undefined"
        }

        get isDebug() {
            return this.logger.level === "DEBUG"
        }

        get request() {
            return typeof $request !== "undefined" ? $request : undefined
        }

        get response() {
            if (typeof $response !== "undefined") {
                if ($response.hasOwnProperty("status")) $response["statusCode"] = $response["status"];
                if ($response.hasOwnProperty("statusCode")) $response["status"] = $response["statusCode"];
                return $response
            } else {
                return undefined
            }
        }

        done = (value = {}) => {
            this._endTime = Date.now();
            let span = (this._endTime - this._startTime) / 1e3;
            this.logger.info(`SCRIPT COMPLETED: ${span} S.`);
            if (typeof $done !== "undefined") {
                $done(value)
            }
        }
    }(scriptName, logLevel)
}
function MagicHttp(env, logger) { const phoneUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1"; const computerUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59"; let axiosInstance; if (env.isNode) { const axios = require("axios"); axiosInstance = axios.create() } class InterceptorManager { constructor(isRequest = true) { this.handlers = []; this.isRequest = isRequest } use(fulfilled, rejected, options) { if (typeof fulfilled === "function") { logger.debug(`Register fulfilled ${fulfilled.name}`) } if (typeof rejected === "function") { logger.debug(`Register rejected ${rejected.name}`) } this.handlers.push({ fulfilled: fulfilled, rejected: rejected, synchronous: options && typeof options.synchronous === "boolean" ? options.synchronous : false, runWhen: options ? options.runWhen : null }); return this.handlers.length - 1 } eject(id) { if (this.handlers[id]) { this.handlers[id] = null } } forEach(fn) { this.handlers.forEach(element => { if (element !== null) { fn(element) } }) } } function paramsToQueryString(config) { let _config = { ...config }; if (!!_config.params) { if (!env.isNode) { let qs = Object.keys(_config.params).map(key => { const encodeKey = encodeURIComponent(key); _config.url = _config.url.replace(new RegExp(`${key}=[^&]*`, "ig"), ""); _config.url = _config.url.replace(new RegExp(`${encodeKey}=[^&]*`, "ig"), ""); return `${encodeKey}=${encodeURIComponent(_config.params[key])}` }).join("&"); if (_config.url.indexOf("?") < 0) _config.url += "?"; if (!/(&|\?)$/g.test(_config.url)) { _config.url += "&" } _config.url += qs; delete _config.params; logger.debug(`Params to QueryString: ${_config.url}`) } } return _config } const mergeConfig = (method, configOrUrl) => { let config = typeof configOrUrl === "object" ? { headers: {}, ...configOrUrl } : { url: configOrUrl, headers: {} }; if (!config.method) { config["method"] = method } config = paramsToQueryString(config); if (config["rewrite"] === true) { if (env.isSurge) { config.headers["X-Surge-Skip-Scripting"] = false; delete config["rewrite"] } else if (env.isQuanX) { config["hints"] = false; delete config["rewrite"] } } if (env.isSurgeLike) { const contentType = config.headers["content-type"] || config.headers["Content-Type"]; if (config["method"] !== "GET" && contentType && contentType.indexOf("application/json") >= 0 && config.body instanceof Array) { config.body = JSON.stringify(config.body); logger.debug(`Convert Array object to String: ${config.body}`) } } else if (env.isQuanX) { if (config.hasOwnProperty("body") && typeof config["body"] !== "string") config["body"] = JSON.stringify(config["body"]); config["method"] = method } else if (env.isNode) { if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") { config.data = config.data || config.body } else if (method === "GET") { config.params = config.params || config.body } delete config.body } return config }; const modifyResponse = (resp, config = null) => { if (resp) { let _resp = { ...resp, config: resp.config || config, status: resp.statusCode || resp.status, body: resp.body || resp.data, headers: resp.headers || resp.header }; if (typeof _resp.body === "string") { try { _resp.body = JSON.parse(_resp.body) } catch { } } delete _resp.data; return _resp } else { return resp } }; const convertHeadersToLowerCase = headers => { return Object.keys(headers).reduce((acc, key) => { acc[key.toLowerCase()] = headers[key]; return acc }, {}) }; const convertHeadersToCamelCase = headers => { return Object.keys(headers).reduce((acc, key) => { const newKey = key.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join("-"); acc[newKey] = headers[key]; return acc }, {}) }; const raiseExceptionByStatusCode = (resp, config = null) => { if (!!resp && resp.status >= 400) { logger.debug(`Raise exception when status code is ${resp.status}`); return { name: "RequestException", message: `Request failed with status code ${resp.status}`, config: config || resp.config, response: resp } } }; const interceptors = { request: new InterceptorManager, response: new InterceptorManager(false) }; let requestInterceptorChain = []; let responseInterceptorChain = []; let synchronousRequestInterceptors = true; function interceptConfig(config) { config = paramsToQueryString(config); logger.debug(`HTTP ${config["method"].toUpperCase()}:\n${JSON.stringify(config)}`); return config } function interceptResponse(resp) { try { resp = !!resp ? modifyResponse(resp) : resp; logger.sniffer(`HTTP ${resp.config["method"].toUpperCase()}:\n${JSON.stringify(resp.config)}\nSTATUS CODE:\n${resp.status}\nRESPONSE:\n${typeof resp.body === "object" ? JSON.stringify(resp.body) : resp.body}`); const err = raiseExceptionByStatusCode(resp); if (!!err) { return Promise.reject(err) } return resp } catch (err) { logger.error(err); return resp } } const registerInterceptors = config => { try { requestInterceptorChain = []; responseInterceptorChain = []; interceptors.request.forEach(interceptor => { if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) { return } synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous; requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected) }); interceptors.response.forEach(interceptor => { responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected) }) } catch (err) { logger.error(`Failed to register interceptors: ${err}.`) } }; const request = (method, config) => { let dispatchRequest; const _method = method.toUpperCase(); config = mergeConfig(_method, config); if (env.isNode) { dispatchRequest = axiosInstance } else { if (env.isSurgeLike) { dispatchRequest = config => { return new Promise((resolve, reject) => { $httpClient[method.toLowerCase()](config, (err, resp, body) => { if (err) { let newErr = { name: err.name || err, message: err.message || err, stack: err.stack || err, config: config, response: modifyResponse(resp) }; reject(newErr) } else { resp.config = config; resp.body = body; resolve(resp) } }) }) } } else { dispatchRequest = config => { return new Promise((resolve, reject) => { $task.fetch(config).then(resp => { resp = modifyResponse(resp, config); const err = raiseExceptionByStatusCode(resp, config); if (err) { return Promise.reject(err) } resolve(resp) }).catch(err => { let newErr = { name: err.message || err.error, message: err.message || err.error, stack: err.error, config: config, response: !!err.response ? modifyResponse(err.response) : null }; reject(newErr) }) }) } } } let promise; registerInterceptors(config); const defaultRequestInterceptors = [interceptConfig, undefined]; const defaultResponseInterceptors = [interceptResponse, undefined]; if (!synchronousRequestInterceptors) { logger.debug("Interceptors are executed in asynchronous mode"); let chain = [dispatchRequest, undefined]; Array.prototype.unshift.apply(chain, defaultRequestInterceptors); Array.prototype.unshift.apply(chain, requestInterceptorChain); chain = chain.concat(defaultResponseInterceptors); chain = chain.concat(responseInterceptorChain); promise = Promise.resolve(config); while (chain.length) { try { let onFulfilled = chain.shift(); let onRejected = chain.shift(); if (!env.isNode && config["timeout"] && onFulfilled === dispatchRequest) { onFulfilled = requestTimeout } if (typeof onFulfilled === "function") { logger.debug(`Executing request fulfilled ${onFulfilled.name}`) } if (typeof onRejected === "function") { logger.debug(`Executing request rejected ${onRejected.name}`) } promise = promise.then(onFulfilled, onRejected) } catch (err) { logger.error(`request exception: ${err}`) } } return promise } else { logger.debug("Interceptors are executed in synchronous mode"); Array.prototype.unshift.apply(requestInterceptorChain, defaultRequestInterceptors); requestInterceptorChain = requestInterceptorChain.concat([interceptConfig, undefined]); while (requestInterceptorChain.length) { let onFulfilled = requestInterceptorChain.shift(); let onRejected = requestInterceptorChain.shift(); try { if (typeof onFulfilled === "function") { logger.debug(`Executing request fulfilled ${onFulfilled.name}`) } config = onFulfilled(config) } catch (error) { if (typeof onRejected === "function") { logger.debug(`Executing request rejected ${onRejected.name}`) } onRejected(error); break } } try { if (!env.isNode && config["timeout"]) { promise = requestTimeout(config) } else { promise = dispatchRequest(config) } } catch (err) { return Promise.reject(err) } Array.prototype.unshift.apply(responseInterceptorChain, defaultResponseInterceptors); while (responseInterceptorChain.length) { promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift()) } return promise } function requestTimeout(config) { try { const timer = new Promise((_, reject) => { setTimeout(() => { let err = { message: `timeout of ${config["timeout"]}ms exceeded.`, config: config }; reject(err) }, config["timeout"]) }); return Promise.race([dispatchRequest(config), timer]) } catch (err) { logger.error(`Request Timeout exception: ${err}.`) } } }; return { request: request, interceptors: interceptors, convertHeadersToLowerCase: convertHeadersToLowerCase, convertHeadersToCamelCase: convertHeadersToCamelCase, modifyResponse: modifyResponse, get: configOrUrl => { return request("GET", configOrUrl) }, post: configOrUrl => { return request("POST", configOrUrl) }, put: configOrUrl => { return request("PUT", configOrUrl) }, patch: configOrUrl => { return request("PATCH", configOrUrl) }, delete: configOrUrl => { return request("DELETE", configOrUrl) }, head: configOrUrl => { return request("HEAD", configOrUrl) }, options: configOrUrl => { return request("OPTIONS", configOrUrl) } } }
function MagicData(env, logger) { let node = { fs: undefined, data: {} }; if (env.isNode) { node.fs = require("fs"); try { node.fs.accessSync("./magic.json", node.fs.constants.R_OK | node.fs.constants.W_OK) } catch (err) { node.fs.writeFileSync("./magic.json", "{}", { encoding: "utf8" }) } node.data = require("./magic.json") } const defaultValueComparator = (oldVal, newVal) => { if (typeof newVal === "object") { return false } else { return oldVal === newVal } }; const _typeConvertor = val => { if (val === "true") { return true } else if (val === "false") { return false } else if (typeof val === "undefined") { return null } else { return val } }; const _valConvertor = (val, default_, session, read_no_session) => { if (session) { try { if (typeof val === "string") val = JSON.parse(val); if (val["magic_session"] === true) { val = val[session] } else { val = null } } catch { val = null } } if (typeof val === "string" && val !== "null") { try { val = JSON.parse(val) } catch { } } if (read_no_session === false && !!val && val["magic_session"] === true) { val = null } if ((val === null || typeof val === "undefined") && default_ !== null && typeof default_ !== "undefined") { val = default_ } val = _typeConvertor(val); return val }; const convertToObject = obj => { if (typeof obj === "string") { let data = {}; try { data = JSON.parse(obj); const type = typeof data; if (type !== "object" || data instanceof Array || type === "bool" || data === null) { data = {} } } catch { } return data } else if (obj instanceof Array || obj === null || typeof obj === "undefined" || obj !== obj || typeof obj === "boolean") { return {} } else { return obj } }; const readForNode = (key, default_ = null, session = "", read_no_session = false, externalData = null) => { let data = externalData || node.data; if (!!data && typeof data[key] !== "undefined" && data[key] !== null) { val = data[key] } else { val = !!session ? {} : null } val = _valConvertor(val, default_, session, read_no_session); return val }; const read = (key, default_ = null, session = "", read_no_session = false, externalData = null) => { let val = ""; if (externalData || env.isNode) { val = readForNode(key, default_, session, read_no_session, externalData) } else { if (env.isSurgeLike) { val = $persistentStore.read(key) } else if (env.isQuanX) { val = $prefs.valueForKey(key) } val = _valConvertor(val, default_, session, read_no_session) } logger.debug(`READ DATA [${key}]${!!session ? `[${session}]` : ""} <${typeof val}>\n${JSON.stringify(val)}`); return val }; const writeForNode = (key, val, session = "", externalData = null) => { let data = externalData || node.data; data = convertToObject(data); if (!!session) { let obj = convertToObject(data[key]); obj["magic_session"] = true; obj[session] = val; data[key] = obj } else { data[key] = val } if (externalData !== null) { externalData = data } return data }; const write = (key, val, session = "", externalData = null) => { if (typeof val === "undefined" || val !== val) { return false } if (!env.isNode && (typeof val === "boolean" || typeof val === "number")) { val = String(val) } let data = ""; if (externalData || env.isNode) { data = writeForNode(key, val, session, externalData) } else { if (!session) { data = val } else { if (env.isSurgeLike) { data = !!$persistentStore.read(key) ? $persistentStore.read(key) : data } else if (env.isQuanX) { data = !!$prefs.valueForKey(key) ? $prefs.valueForKey(key) : data } data = convertToObject(data); data["magic_session"] = true; data[session] = val } } if (!!data && typeof data === "object") { data = JSON.stringify(data, null, 4) } logger.debug(`WRITE DATA [${key}]${session ? `[${session}]` : ""} <${typeof val}>\n${JSON.stringify(val)}`); if (!externalData) { if (env.isSurgeLike) { return $persistentStore.write(data, key) } else if (env.isQuanX) { return $prefs.setValueForKey(data, key) } else if (env.isNode) { try { node.fs.writeFileSync("./magic.json", data); return true } catch (err) { logger.error(err); return false } } } return true }; const update = (key, val, session, comparator = defaultValueComparator, externalData = null) => { val = _typeConvertor(val); const oldValue = read(key, null, session, false, externalData); if (comparator(oldValue, val) === true) { return false } else { const result = write(key, val, session, externalData); let newVal = read(key, null, session, false, externalData); if (comparator === defaultValueComparator && typeof newVal === "object") { return result } return comparator(val, newVal) } }; const delForNode = (key, session, externalData) => { let data = externalData || node.data; data = convertToObject(data); if (!!session) { obj = convertToObject(data[key]); delete obj[session]; data[key] = obj } else { delete data[key] } if (!!externalData) { externalData = data } return data }; const del = (key, session = "", externalData = null) => { let data = {}; if (externalData || env.isNode) { data = delForNode(key, session, externalData); if (!externalData) { node.fs.writeFileSync("./magic.json", JSON.stringify(data, null, 4)) } else { externalData = data } } else { if (!session) { if (env.isStorm) { return $persistentStore.remove(key) } else if (env.isSurgeLike) { return $persistentStore.write(null, key) } else if (env.isQuanX) { return $prefs.removeValueForKey(key) } } else { if (env.isSurgeLike) { data = $persistentStore.read(key) } else if (env.isQuanX) { data = $prefs.valueForKey(key) } data = convertToObject(data); delete data[session]; const json = JSON.stringify(data, null, 4); write(key, json) } } logger.debug(`DELETE KEY [${key}]${!!session ? `[${session}]` : ""}`) }; const allSessionNames = (key, externalData = null) => { let _sessions = []; let data = read(key, null, null, true, externalData); data = convertToObject(data); if (data["magic_session"] !== true) { _sessions = [] } else { _sessions = Object.keys(data).filter(key => key !== "magic_session") } logger.debug(`READ ALL SESSIONS [${key}] <${typeof _sessions}>\n${JSON.stringify(_sessions, null, 4)}`); return _sessions }; const allSessions = (key, externalData = null) => { let _sessions = {}; let data = read(key, null, null, true, externalData); data = convertToObject(data); if (data["magic_session"] === true) { _sessions = { ...data }; delete _sessions["magic_session"] } logger.debug(`READ ALL SESSIONS [${key}] <${typeof _sessions}>\n${JSON.stringify(_sessions, null, 4)}`); return _sessions }; return { read: read, write: write, del: del, update: update, allSessions: allSessions, allSessionNames: allSessionNames, defaultValueComparator: defaultValueComparator, convertToObject: convertToObject } }
function MagicNotification(scriptName, env, logger, http) { let _barkUrl = null; let _barkKey = null; const setBark = url => { try { let _url = url.replace(/\/+$/g, ""); _barkUrl = `${/^https?:\/\/([^/]*)/.exec(_url)[0]}/push`; _barkKey = /\/([^\/]+)\/?$/.exec(_url)[1] } catch (ex) { logger.error(`Bark url error: ${ex}.`) } }; function post(title = scriptName, subTitle = "", body = "", opts = "") { const _adaptOpts = _opts => { try { let newOpts = {}; if (typeof _opts === "string") { if (env.isLoon) newOpts = { openUrl: _opts }; else if (env.isQuanX) newOpts = { "open-url": _opts }; else if (env.isSurge) newOpts = { url: _opts } } else if (typeof _opts === "object") { if (env.isLoon) { newOpts["openUrl"] = !!_opts["open-url"] ? _opts["open-url"] : ""; newOpts["mediaUrl"] = !!_opts["media-url"] ? _opts["media-url"] : "" } else if (env.isQuanX) { newOpts = !!_opts["open-url"] || !!_opts["media-url"] ? _opts : {} } else if (env.isSurge) { let openUrl = _opts["open-url"] || _opts["openUrl"]; newOpts = openUrl ? { url: openUrl } : {} } } return newOpts } catch (err) { logger.error(`通知选项转换失败${err}`) } return _opts }; opts = _adaptOpts(opts); if (arguments.length === 1) { title = scriptName; subTitle = "", body = arguments[0] } logger.notify(`title:${title}\nsubTitle:${subTitle}\nbody:${body}\noptions:${typeof opts === "object" ? JSON.stringify(opts) : opts}`); if (env.isSurge) { $notification.post(title, subTitle, body, opts) } else if (env.isLoon) { if (!!opts) $notification.post(title, subTitle, body, opts); else $notification.post(title, subTitle, body) } else if (env.isQuanX) { $notify(title, subTitle, body, opts) } if (_barkUrl && _barkKey) { bark(title, subTitle, body) } } function debug(title = scriptName, subTitle = "", body = "", opts = "") { if (logger.getLevel() === "DEBUG") { if (arguments.length === 1) { title = scriptName; subTitle = ""; body = arguments[0] } this.post(title, subTitle, body, opts) } } function bark(title = scriptName, subTitle = "", body = "", opts = "") { if (typeof http === "undefined" || typeof http.post === "undefined") { throw "Bark notification needs to import MagicHttp module." } let options = { url: _barkUrl, headers: { "content-type": "application/json; charset=utf-8" }, body: { title: title, body: subTitle ? `${subTitle}\n${body}` : body, device_key: _barkKey } }; http.post(options).catch(ex => { logger.error(`Bark notify error: ${ex}`) }) } return { post: post, debug: debug, bark: bark, setBark: setBark } }
function MagicUtils(env, logger) { const retry = (fn, retries = 5, interval = 0, callback = null) => { return (...args) => { return new Promise((resolve, reject) => { function _retry(...args) { Promise.resolve().then(() => fn.apply(this, args)).then(result => { if (typeof callback === "function") { Promise.resolve().then(() => callback(result)).then(() => { resolve(result) }).catch(ex => { if (retries >= 1) { if (interval > 0) setTimeout(() => _retry.apply(this, args), interval); else _retry.apply(this, args) } else { reject(ex) } retries-- }) } else { resolve(result) } }).catch(ex => { logger.error(ex); if (retries >= 1 && interval > 0) { setTimeout(() => _retry.apply(this, args), interval) } else if (retries >= 1) { _retry.apply(this, args) } else { reject(ex) } retries-- }) } _retry.apply(this, args) }) } }; const formatTime = (time, fmt = "yyyy-MM-dd hh:mm:ss") => { let o = { "M+": time.getMonth() + 1, "d+": time.getDate(), "h+": time.getHours(), "m+": time.getMinutes(), "s+": time.getSeconds(), "q+": Math.floor((time.getMonth() + 3) / 3), S: time.getMilliseconds() }; if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length)); for (let k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)); return fmt }; const now = () => { return formatTime(new Date, "yyyy-MM-dd hh:mm:ss") }; const today = () => { return formatTime(new Date, "yyyy-MM-dd") }; const sleep = time => { return new Promise(resolve => setTimeout(resolve, time)) }; const assert = (val, msg = null) => { if (env.isNode) { const _assert = require("assert"); if (msg) _assert(val, msg); else _assert(val) } else { if (val !== true) { let err = `AssertionError: ${msg || "The expression evaluated to a falsy value."}`; logger.error(err) } } }; return { retry: retry, formatTime: formatTime, now: now, today: today, sleep: sleep, assert: assert } }
function MagicQingLong(env, data, logger) { let qlUrl = ""; let qlName = ""; let qlClient = ""; let qlSecret = ""; let qlPwd = ""; let qlToken = ""; const magicJsonFileName = "magic.json"; const timeout = 3e3; const http = (() => MagicHttp(env, logger))(); const init = (url, clientId, clientSecret, username, password) => { qlUrl = url; qlClient = clientId; qlSecret = clientSecret; qlName = username; qlPwd = password }; function readQingLongConfig(config) { qlUrl = qlUrl || data.read("magic_qlurl"); qlToken = qlToken || data.read("magic_qltoken"); logger.debug(`QingLong url: ${qlUrl}\nQingLong token: ${qlToken}`); return config } function setBaseUrlAndTimeout(config) { if (!qlUrl) { qlUrl = data.read("magic_qlurl") } if (config.url.indexOf(qlUrl) < 0) { config.url = `${qlUrl}${config.url}` } return { ...config, timeout: timeout } } function setTimestamp(config) { config.params = { ...config.params, t: Date.now() }; return config } async function setAuthorization(config) { qlToken = qlToken || data.read("magic_qltoken", ""); if (!qlToken) { await getToken() } config.headers["authorization"] = `Bearer ${qlToken}`; return config } function switchClientMode(config) { qlClient = qlClient || data.read("magic_qlclient"); if (!!qlClient) { config.url = config.url.replace("/api/", "/open/") } return config } async function refreshToken(error) { try { const message = error.message || error.error || JSON.stringify(error); if ((message.indexOf("NSURLErrorDomain") >= 0 && message.indexOf("-1012") >= 0 || !!error.response && error.response.status === 401) && !!error.config && error.config.refreshToken !== true) { logger.warning(`QingLong Panel token has expired`); logger.info("Refreshing the QingLong Panel token"); await getToken(); error.config["refreshToken"] = true; logger.info("Call the previous method again"); return await http.request(error.config.method, error.config) } else { return Promise.reject(error) } } catch (ex) { return Promise.reject(ex) } } http.interceptors.request.use(setBaseUrlAndTimeout, undefined); http.interceptors.request.use(switchClientMode, undefined, { runWhen: config => { return config.url.indexOf("api/user/login") < 0 && config.url.indexOf("open/auth/token") < 0 } }); http.interceptors.request.use(setAuthorization, undefined, { runWhen: config => { return config.url.indexOf("api/user/login") < 0 && config.url.indexOf("open/auth/token") < 0 } }); http.interceptors.request.use(setTimestamp, undefined, { runWhen: config => { return config.url.indexOf("open/auth/token") < 0 } }); http.interceptors.request.use(readQingLongConfig, undefined); http.interceptors.response.use(undefined, refreshToken); async function getToken() { qlClient = qlClient || data.read("magic_qlclient"); qlSecret = qlSecret || data.read("magic_qlsecrt"); qlName = qlName || data.read("magic_qlname"); qlPwd = qlPwd || data.read("magic_qlpwd"); if (qlUrl && qlClient && qlSecret) { logger.info("Get token from QingLong Panel"); await http.get({ url: `/open/auth/token`, headers: { "content-type": "application/json" }, params: { client_id: qlClient, client_secret: qlSecret } }).then(resp => { if (Object.keys(resp.body).length > 0 && resp.body.data && resp.body.data.token) { logger.info("Successfully logged in to QingLong Panel"); qlToken = resp.body.data.token; data.write("magic_qltoken", qlToken) } else { throw new Error("Get QingLong Panel token failed.") } }).catch(err => { logger.error(`Error logging in to QingLong Panel.\n${err.message || err}`) }) } else if (qlUrl && qlName && qlPwd) { await http.post({ url: `/api/user/login`, headers: { "content-type": "application/json" }, body: { username: qlName, password: qlPwd } }).then(resp => { logger.info("Successfully logged in to QingLong Panel"); qlToken = resp.body.data.token; data.write("magic_qltoken", qlToken) }).catch(err => { logger.error(`Error logging in to QingLong Panel.\n${err.message || err}`) }) } return qlToken } async function setEnv(name, value, id = null) { qlUrl = qlUrl || data.read("magic_qlurl"); if (id === null) { let envIds = await setEnvs([{ name: name, value: value }]); if (!!envIds && envIds.length === 1) { return envIds[0] } } else { await http.put({ url: `/api/envs`, headers: { "content-type": "application/json" }, body: { name: name, value: value, id: id } }).then(resp => { if (resp.body.code === 200) { logger.debug(`QINGLONG UPDATE ENV ${name} <${typeof value}> (${id})\n${JSON.stringify(value)}`); return true } else { logger.error(`Error adding environment variable from QingLong Panel.\n${JSON.stringify(resp)}`) } }).catch(err => { logger.error(`Error adding environment variable from QingLong Panel.\n${err.message || err}`); return false }) } } async function setEnvs(envs) { let envIds = []; await http.post({ url: `/api/envs`, headers: { "content-type": "application/json" }, body: envs }).then(resp => { if (resp.body.code === 200) { resp.body.data.forEach(element => { logger.debug(`QINGLONG ADD ENV ${element.name} <${typeof element.value}> (${element.id})\n${JSON.stringify(element)}`); envIds.push(element.id) }) } else { logger.error(`Error adding environments variable from QingLong Panel.\n${JSON.stringify(resp)}`) } }).catch(err => { logger.error(`Error adding environments variable from QingLong Panel.\n${err.message || err}`) }); return envIds } async function delEnvs(ids) { return await http.delete({ url: `/api/envs`, headers: { accept: "application/json", "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6", connection: "keep-alive", "content-type": "application/json;charset=UTF-8", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.30" }, body: ids }).then(resp => { if (resp.body.code === 200) { logger.debug(`QINGLONG DELETE ENV IDS: ${ids}`); return true } else { logger.error(`Error deleting environments variable from QingLong Panel.\n${JSON.stringify(resp)}`); return false } }).catch(err => { logger.error(`Error deleting environments variable from QingLong Panel.\n${err.message || err}`) }) } async function getEnvs(name = null, searchValue = "", retired = 0) { let envs = []; await http.get({ url: `/api/envs`, headers: { "content-type": "application/json" }, params: { searchValue: searchValue } }).then(resp => { if (resp.body.code === 200) { const allEnvs = resp.body.data; if (!!name) { let _envs = []; for (const env of allEnvs) { if (env.name === name) { envs.push(env) } } envs = _envs } envs = allEnvs } else { throw new Error(`Error reading environment variable from QingLong Panel.\n${JSON.stringify(resp)}`) } }).catch(err => { throw new Error(`Error reading environments variable from QingLong Panel.\n${err.message || err}`) }); return envs } async function getEnv(id) { let env = null; const allEnvs = await getEnvs(); for (const _env of allEnvs) { if (_env.id === id) { env = _env; break } } return env } async function disableEnvs(ids) { let result = false; await http.put({ url: `/api/envs/disable`, headers: { accept: "application/json", "accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6", connection: "keep-alive", "content-type": "application/json;charset=UTF-8", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.30" }, body: ids }).then(resp => { if (resp.body.code === 200) { logger.debug(`QINGLONG DISABLED ENV IDS: ${ids}`); result = true } else { logger.error(`Error disabling environments variable from QingLong Panel.\n${JSON.stringify(resp)}`) } }).catch(err => { logger.error(`Error disabling environments variable from QingLong Panel.\n${err.message || err}`) }); return result } async function enableEnvs(ids) { let result = false; await http.put({ url: `/api/envs/enable`, headers: { accept: "application/json", "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6", connection: "keep-alive", "content-type": "application/json;charset=UTF-8", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.30" }, body: ids }).then(resp => { if (resp.body.code === 200) { logger.debug(`QINGLONG ENABLED ENV IDS: ${ids}`); result = true } else { logger.error(`Error enabling environments variable from Qilong panel.\n${JSON.stringify(resp)}`) } }).catch(err => { logger.error(`Error enabling environments variable from Qilong panel.\n${err.message || err}`) }); return result } async function addScript(name, path = "", content = "") { let result = false; await http.post({ url: `/api/scripts`, headers: { "content-type": "application/json" }, body: { filename: name, path: path, content: content } }).then(resp => { if (resp.body.code === 200) { result = true } else { logger.error(`Error reading data from QingLong Panel.\n${JSON.stringify(resp)}`) } }).catch(err => { logger.error(`Error reading data from QingLong Panel.\n${err.message || err}`) }); return result } async function getScript(name, path = "") { let content = ""; await http.get({ url: `/api/scripts/${name}`, params: { path: path } }).then(resp => { if (resp.body.code === 200) { content = resp.body.data } else { throw new Error(`Error reading data from QingLong Panel.\n${JSON.stringify(resp)}`) } }).catch(err => { throw new Error(`Error reading data from QingLong Panel.\n${err.message || err}`) }); return content } async function editScript(name, path = "", content = "") { let result = false; await http.put({ url: `/api/scripts`, headers: { "content-type": "application/json" }, body: { filename: name, path: path, content: content } }).then(resp => { if (resp.body.code === 200) { result = true } else { logger.error(`Error reading data from QingLong Panel.\n${JSON.stringify(resp)}`) } }).catch(err => { logger.error(`Error reading data from QingLong Panel.\n${err.message || err}`) }); return result } async function delScript(name, path = "") { let result = false; await http.delete({ url: `/api/scripts`, headers: { "content-type": "application/json" }, body: { filename: name, path: path } }).then(resp => { if (resp.body.code === 200) { result = true } else { logger.error(`Error reading data from QingLong Panel.\n${JSON.stringify(resp)}`) } }).catch(err => { logger.error(`Error reading data from QingLong Panel.\n${err.message || err}`) }); return result } async function write(key, val, session = "") { let qlContent = await getScript(magicJsonFileName, ""); let qlData = data.convertToObject(qlContent); let writeResult = data.write(key, val, session, qlData); qlContent = JSON.stringify(qlData, null, 4); let editResult = await editScript(magicJsonFileName, "", qlContent); return editResult && writeResult } async function batchWrite(...args) { let qlContent = await getScript(magicJsonFileName, ""); let qlData = data.convertToObject(qlContent); for (let arg of args) { data.write(arg[0], arg[1], typeof arg[2] !== "undefined" ? arg[2] : "", qlData) } qlContent = JSON.stringify(qlData, null, 4); return await editScript(magicJsonFileName, "", qlContent) } async function update(key, val, session, comparator = data.defaultValueComparator) { let qlContent = await getScript(magicJsonFileName, ""); let qlData = data.convertToObject(qlContent); const updateResult = data.update(key, val, session, comparator, qlData); let editScriptResult = false; if (updateResult === true) { qlContent = JSON.stringify(qlData, null, 4); editScriptResult = await editScript(magicJsonFileName, "", qlContent) } return updateResult && editScriptResult } async function batchUpdate(...args) { let qlContent = await getScript(magicJsonFileName, ""); let qlData = data.convertToObject(qlContent); for (let arg of args) { data.update(arg[0], arg[1], typeof arg[2] !== "undefined" ? arg[2] : "", typeof arg[3] !== "undefined" ? arg["comparator"] : data.defaultValueComparator, qlData) } qlContent = JSON.stringify(qlData, null, 4); return await editScript(magicJsonFileName, "", qlContent) } async function read(key, val, session = "", read_no_session = false) { let qlContent = await getScript(magicJsonFileName, ""); let qlData = data.convertToObject(qlContent); return data.read(key, val, session, read_no_session, qlData) } async function batchRead(...args) { let qlContent = await getScript(magicJsonFileName, ""); let qlData = data.convertToObject(qlContent); let results = []; for (let arg of args) { const result = data.read(arg[0], arg[1], typeof arg[2] !== "undefined" ? arg[2] : "", typeof arg[3] === "boolean" ? arg[3] : false, qlData); results.push(result) } return results } async function del(key, session = "") { let qlContent = await getScript(magicJsonFileName, ""); let qlData = data.convertToObject(qlContent); const delResult = data.del(key, session, qlData); qlContent = JSON.stringify(qlData, null, 4); const editResult = await editScript(magicJsonFileName, "", qlContent); return delResult && editResult } async function batchDel(...args) { let qlContent = await getScript(magicJsonFileName, ""); let qlData = data.convertToObject(qlContent); for (let arg of args) { data.del(arg[0], typeof arg[1] !== "undefined" ? arg[1] : "", qlData) } qlContent = JSON.stringify(qlData, null, 4); return await editScript(magicJsonFileName, "", qlContent) } async function allSessionNames(key) { let qlContent = await getScript(magicJsonFileName, ""); let qlData = data.convertToObject(qlContent); return data.allSessionNames(key, qlData) } async function allSessions(key) { let qlContent = await getScript(magicJsonFileName, ""); let qlData = data.convertToObject(qlContent); return data.allSessions(key, qlData) } return { url: qlUrl || data.read("magic_qlurl"), init: init, getToken: getToken, setEnv: setEnv, setEnvs: setEnvs, getEnv: getEnv, getEnvs: getEnvs, delEnvs: delEnvs, disableEnvs: disableEnvs, enableEnvs: enableEnvs, addScript: addScript, getScript: getScript, editScript: editScript, delScript: delScript, write: write, read: read, del: del, update: update, batchWrite: batchWrite, batchRead: batchRead, batchUpdate: batchUpdate, batchDel: batchDel, allSessions: allSessions, allSessionNames: allSessionNames } }
// @formatter:on
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