async function getFromStorage(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, (result) => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(result);
			}
		});
	});
}

async function removeFromStorage(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.remove(key, () => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve();
			}
		});
	});
}

async function setStorage(key, value) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.set({ [key]: value }, () => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve();
			}
		});
	});
}

async function setAuthUser() {
	try {
		console.log("getting value");
		const data = await getFromStorage(window.location.host);
		console.log("value", data);

		if (data[window.location.host]) {
			await removeFromStorage(window.location.host);
			console.log("found value, deleted");
		} else {
			console.log("setting value");
			await setStorage(window.location.host, true);

			// Your code that should only run once (ever) goes here
			const currentURL = window.location.href;
			const authuserParam = "authuser=dhamapurkar54@gmail.com";

			if (!currentURL.includes(authuserParam)) {
				let newURL;
				if (currentURL.includes("?")) {
					newURL = currentURL + "&" + authuserParam;
				} else {
					newURL = currentURL + "?" + authuserParam;
				}
				window.location.href = newURL;
			} else {
				console.log("Authuser parameter already present.");
			}
		}
	} catch (error) {
		console.error("Error:", error);
	}
}

(async () => {
	try {
		setAuthUser();
	} catch (error) {
		console.error("Error:", error);
	}
})();
