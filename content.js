(async () => {
	try {
		// Check if the extension is enabled
		const { isEnabled } = await getFromStorage("isEnabled");
		const { domains } = await getFromStorage("domains");
		const { authUserEmail } = await getFromStorage("authUserEmail");

		if (window.location.protocol === "chrome:") return;

		if (isEnabled !== undefined && !isEnabled) {
			console.log("Extension is disabled.");
			return;
		}

		// Check if the current URL matches any of the allowed domains
		const isDomainAllowed = domains.find((elem) => {
			return window.location.hostname.indexOf(elem) > -1;
		});

		if (!isDomainAllowed) {
			console.log("Domain not allowed.");
			return;
		}
		setAuthUser(authUserEmail);
	} catch (error) {
		console.error("Error:", error);
	}
})();

async function setAuthUser(authUserEmail) {
	const data = await getFromStorage(window.location.hostname);

	if (data[window.location.hostname]) {
		await removeFromStorage(window.location.hostname);
		return;
	}

	await setStorage(window.location.hostname, true);

	// Your code that should only run once (ever) goes here
	const currentURL = window.location.href;
	const authuserParam = "authuser=" + authUserEmail;

	if (currentURL.includes(authuserParam)) {
		console.log("Authuser parameter already present.");
		return;
	}

	let newURL = currentURL.includes("?")
		? currentURL + "&" + authuserParam
		: currentURL + "?" + authuserParam;

	window.location.href = newURL;
}

function validateAndMutateKey(key) {
	if (typeof key !== "string") throw new Error("Invalid key");
	return key;
}

async function getFromStorage(key) {
	let storageKey = validateAndMutateKey(key);
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(storageKey, (result) => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(result);
			}
		});
	});
}

async function removeFromStorage(key) {
	let storageKey = validateAndMutateKey(key);
	return new Promise((resolve, reject) => {
		chrome.storage.local.remove(storageKey, () => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve();
			}
		});
	});
}

async function setStorage(key, value) {
	let storageKey = validateAndMutateKey(key);
	return new Promise((resolve, reject) => {
		chrome.storage.local.set({ [storageKey]: value }, () => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve();
			}
		});
	});
}
