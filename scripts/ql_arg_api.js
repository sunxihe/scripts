$.ql = {
	type: "api",
	headers: {
		"Content-Type": `application/json;charset=UTF-8`,
		Authorization: "",
	},
    runTask(ids){
        if (!this.headers.Authorization) return;
        const opt = {
			url: `${$.ql_url}/${this.type}/crons/run`,
			headers: this.headers,
			body: JSON.stringify(ids),
		};
        return $.http.put(opt).then((response) => JSON.parse(response.body));
    },
	disabled(ids) {
		if (!this.headers.Authorization) return;
		const opt = {
			url: `${$.ql_url}/${this.type}/envs/disable`,
			headers: this.headers,
			body: JSON.stringify(ids),
		};
		return $.http.put(opt).then((response) => JSON.parse(response.body));
	},
	enabled(ids) {
		if (!this.headers.Authorization) return;
		const opt = {
			url: `${$.ql_url}/${this.type}/envs/enable`,
			headers: this.headers,
			body: JSON.stringify(ids),
		};
		return $.http.put(opt).then((response) => JSON.parse(response.body));
	},
	delete(ids) {
		if (!this.headers.Authorization) return;
		const opt = {
			url: `${$.ql_url}/${this.type}/envs`,
			headers: this.headers,
			body: JSON.stringify(ids),
		};
		return $.http.delete(opt).then((response) => JSON.parse(response.body));
	},
	add(records) {
		if (!this.headers.Authorization) return;
		const opt = {
			url: `${$.ql_url}/${this.type}/envs`,
			headers: this.headers,
			body: JSON.stringify(records),
		};
		return $.http.post(opt).then((response) => JSON.parse(response.body));
	},
	edit(records) {
		if (!this.headers.Authorization) return;
		const opt = {
			url: `${$.ql_url}/${this.type}/envs`,
			headers: this.headers,
			body: JSON.stringify(records),
		};
		return $.http.put(opt).then((response) => JSON.parse(response.body));
	},
	select(searchValue) {
		if (!this.headers.Authorization) return;
		const opt = {
			url: `${$.ql_url}/${this.type}/envs?searchValue=${searchValue}`,
			headers: this.headers,
		};
		return $.http.get(opt).then((response) => JSON.parse(response.body));
	},
	initial: () => {
        console.log($.ql_config);
		$.ql_url = $.ql_config.ip;
		if ($.ql_url && !$.ql_url.match(/^(http|https)/))
			$.ql_url = `http://${$.ql_url}`;

		$.application = {
			client_id: $.ql_config.client_id,
			client_secret: $.ql_config.client_secret,
		};

		$.ql_account = {
			username: $.ql_config.username,
			password: $.ql_config.password,
		};
	},
};


$.ql_config = {
    ip:ql_url,
    client_id:client_id,
    client_secret:client_secret
};

$.ql.initial();

function noReady() {
	$.ql = false;
	$.log("请配置好相关信息");
}

if ($.ql_config.is_pwd === "true") {
	if ($.ql_account.username && $.ql_account.password) {
		$.ql.login = async () => {
			const options = {
				url: `${$.ql_url}/api/user/login`,
				body: JSON.stringify($.ql_account),
				headers: {
					"Content-Type": `application/json;charset=UTF-8`,
				},
			};

			let response = await $.http.post(options);
			response = JSON.parse(response.body);
			if (response.code === 200) {
				$.ql.type = "api";
				$.ql.headers.Authorization = `Bearer ${response.data.token}`;
				$.log(`登陆青龙面板成功：${response.data.lastaddr}`);
				$.log(`ip:${response.data.lastip}`);
			} else {
				$.log(response);
				$.log(`登陆青龙面板失败：${response.message}`);
			}
		};
	} else {
		noReady();
	}
} else {
	if ($.application.client_id && $.application.client_secret) {
		$.ql.login = async () => {
			const options = {
				url: `${$.ql_url}/open/auth/token?client_id=${$.application.client_id}&client_secret=${$.application.client_secret}`,
				headers: {
					"Content-Type": `application/json;charset=UTF-8`,
				},
			};
			let response = await $.http.get(options);
			response = JSON.parse(response.body);
			if (response.code === 200) {
				$.ql.type = "open";
				$.ql.headers.Authorization = `Bearer ${response.data.token}`;
				$.log(`登陆青龙面板成功`);
			} else {
				$.log(response);
				$.log(`登陆青龙面板失败：${response.message}`);
			}
		};
	} else {
		noReady();
	}
}