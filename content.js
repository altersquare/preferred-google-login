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
		const data = await getFromStorage(window.location.host);

		if (data[window.location.host]) {
			await removeFromStorage(window.location.host);
		} else {
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
				// console.log("Authuser parameter already present.");
			}
		}
	} catch (error) {
		console.error("Error:", error);
	}
}

(async () => {
	try {
		// Check if the extension is enabled
		const { isEnabled } = await getFromStorage("isEnabled");

		if (isEnabled) {
			setAuthUser();
		} else {
			console.log("Extension is disabled.");
		}
	} catch (error) {
		console.error("Error:", error);
	}
})();
