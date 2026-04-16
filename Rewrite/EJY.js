const scriptName = "煤矿配置重写";
const responseUrlRegex =
  /^https?:\/\/api-wq\.ejiyun\.com\/api\/config\/coalMine\/getConfigByParentKey.*$/;
const targetItemKeys = new Set([
  "coalMineSignUpNoticeConfig",
  "coalMineSignUpNoticeConfigV2",
]);

const $ = MagicJS(scriptName, "INFO");

function rewriteResponseBody() {
  const rawBody = $.response && $.response.body;
  if (!rawBody) {
    $.logger.warning("响应体为空，跳过修改。");
    return rawBody;
  }

  let json;
  try {
    json = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
  } catch (err) {
    $.logger.error(`响应体不是有效 JSON，跳过。${err}`);
    return rawBody;
  }

  if (!json || !Array.isArray(json.data)) {
    $.logger.warning("响应结构不符合预期（缺少 data 数组），跳过。");
    return rawBody;
  }

  let hitCount = 0;
  for (const item of json.data) {
    if (item && targetItemKeys.has(item.itemKey)) {
      item.itemValue = "1";
      hitCount += 1;
    }
  }

  $.logger.info(`命中并写入 itemValue='1' 的条目数：${hitCount}`);
  return JSON.stringify(json);
}

(function main() {
  try {
    const reqUrl = ($.request && $.request.url) || "";
    if (!$.isResponse || !responseUrlRegex.test(reqUrl)) {
      $.logger.info(`未命中响应重写条件：${reqUrl}`);
      $.done({});
      return;
    }

    const body = rewriteResponseBody();
    $.done({ body: body });
  } catch (err) {
    $.logger.error(`脚本执行异常：${err}`);
    $.done({});
  }
})();

function MagicJS(scriptName = "MagicJS", logLevel = "INFO") {
  const MagicEnvironment = () => {
    const isLoon = typeof $loon !== "undefined";
    const isQuanX = typeof $task !== "undefined";
    const isNode = typeof module !== "undefined";
    const isSurge = typeof $httpClient !== "undefined" && !isLoon;
    const isStorm = typeof $storm !== "undefined";
    const isStash =
      typeof $environment !== "undefined" &&
      typeof $environment["stash-build"] !== "undefined";
    const isSurgeLike = isSurge || isLoon || isStorm || isStash;
    return {
      isLoon: isLoon,
      isQuanX: isQuanX,
      isNode: isNode,
      isSurge: isSurge,
      isStorm: isStorm,
      isStash: isStash,
      isSurgeLike: isSurgeLike,
    };
  };

  const MagicLogger = (name, level = "INFO") => {
    let currentLevel = level;
    const logLevels = {
      DEBUG: 5,
      INFO: 4,
      NOTIFY: 3,
      WARNING: 2,
      ERROR: 1,
      NONE: -1,
    };
    const canLog = (target) => !(logLevels[currentLevel] < logLevels[target]);
    const output = (msg, target = "INFO") => {
      if (canLog(target)) {
        console.log(`[${target}] [${name}] ${msg}`);
      }
    };
    return {
      getLevel: () => currentLevel,
      setLevel: (newLevel) => {
        currentLevel = newLevel;
      },
      debug: (msg) => output(msg, "DEBUG"),
      info: (msg) => output(msg, "INFO"),
      notify: (msg) => output(msg, "NOTIFY"),
      warning: (msg) => output(msg, "WARNING"),
      error: (msg) => output(msg, "ERROR"),
    };
  };

  return new (class {
    constructor(name, level) {
      this._startTime = Date.now();
      this.scriptName = name;
      this.env = MagicEnvironment();
      this.logger = MagicLogger(name, level);
    }

    get isRequest() {
      return (
        typeof $request !== "undefined" && typeof $response === "undefined"
      );
    }

    get isResponse() {
      return typeof $response !== "undefined";
    }

    get request() {
      return typeof $request !== "undefined" ? $request : undefined;
    }

    get response() {
      if (typeof $response !== "undefined") {
        if ($response.hasOwnProperty("status")) {
          $response.statusCode = $response.status;
        }
        if ($response.hasOwnProperty("statusCode")) {
          $response.status = $response.statusCode;
        }
        return $response;
      }
      return undefined;
    }

    done(value = {}) {
      const elapsed = ((Date.now() - this._startTime) / 1000).toFixed(3);
      this.logger.info(`SCRIPT COMPLETED: ${elapsed} S.`);
      if (typeof $done !== "undefined") {
        $done(value);
      }
    }
  })(scriptName, logLevel);
}
