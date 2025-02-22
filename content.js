// Immediately invoked function expression (IIFE) to execute code on page load.
(async () => {
	try {
		// Retrieve stored settings from Chrome storage.
		const { isEnabled } = await getFromStorage("isEnabled"); // Get whether the extension is enabled.
		const { domains } = await getFromStorage("domains"); // Get the list of allowed domains.
		const { authUserEmail } = await getFromStorage("authUserEmail"); // Get the default authuser email.

		// If on a Chrome internal page (e.g., extensions page), exit.
		if (window.location.protocol === "chrome:") return;

		// If the extension is explicitly disabled, exit.
		if (isEnabled !== undefined && !isEnabled) {
			console.log("Extension is disabled.");
			return;
		}

		// Check if the current URL's hostname is in the allowed domains list.
		const isDomainAllowed = domains.find((elem) => {
			return window.location.hostname.indexOf(elem) > -1; // Check if hostname contains allowed domain.
		});

		// If the domain is not allowed, exit.
		if (!isDomainAllowed) {
			console.log("Domain not allowed.");
			return;
		}

		// Add the authuser parameter to the URL.
		setAuthUser(authUserEmail);
	} catch (error) {
		console.error("Error:", error); // Log any errors.
	}
})();

/**
 * Adds the authuser parameter to the URL if it's not already present.
 * Prevents infinite redirect loops by checking if the parameter has already been added in the current session.
 * @param {string} authUserEmail The email address to use for the authuser parameter.
 */
async function setAuthUser(authUserEmail) {
	const data = await getFromStorage(window.location.hostname); // Check if already set for this domain

	if (data[window.location.hostname]) {
		// If already set in this session for this domain, remove the flag and exit.
		await removeFromStorage(window.location.hostname);
		return;
	}

	await setStorage(window.location.hostname, true); // Set a flag in storage indicating that we have modified this domain

	const currentURL = window.location.href;
	const authuserParam = "authuser=" + authUserEmail;

	// Check if the authuser parameter is already present in the URL.
	if (currentURL.includes(authuserParam)) {
		console.log("Authuser parameter already present.");
		return;
	}

	// Add the authuser parameter to the URL.
	let newURL = currentURL.includes("?")
		? currentURL + "&" + authuserParam // Add with & if query params are present
		: currentURL + "?" + authuserParam; // Add with ? if no query params are present

	window.location.href = newURL; // Redirect to the new URL.
}

/**
 * Validates the storage key to ensure it's a string.
 * @param {string} key The storage key to validate.
 * @returns {string} The validated storage key.
 * @throws {Error} If the key is not a string.
 */
function validateAndMutateKey(key) {
	if (typeof key !== "string") throw new Error("Invalid key");
	return key;
}

/**
 * Retrieves data from Chrome local storage.
 * @param {string} key The key to retrieve.
 * @returns {Promise<any>} A promise that resolves with the retrieved data.
 */
async function getFromStorage(key) {
	let storageKey = validateAndMutateKey(key); // Validate the key.
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(storageKey, (result) => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError); // Reject with any Chrome runtime errors.
			} else {
				resolve(result); // Resolve with the retrieved data.
			}
		});
	});
}

/**
 * Removes data from Chrome local storage.
 * @param {string} key The key to remove.
 * @returns {Promise<void>} A promise that resolves when the data is removed.
 */
async function removeFromStorage(key) {
	let storageKey = validateAndMutateKey(key); // Validate the key.
	return new Promise((resolve, reject) => {
		chrome.storage.local.remove(storageKey, () => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError); // Reject with any Chrome runtime errors.
			} else {
				resolve(); // Resolve when data is removed.
			}
		});
	});
}

/**
 * Sets data in Chrome local storage.
 * @param {string} key The key to set.
 * @param {any} value The value to set.
 * @returns {Promise<void>} A promise that resolves when the data is set.
 */
async function setStorage(key, value) {
	let storageKey = validateAndMutateKey(key); // Validate the key.
	return new Promise((resolve, reject) => {
		chrome.storage.local.set({ [storageKey]: value }, () => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError); // Reject with Chrome runtime error.
			} else {
				resolve(); // Resolve when data is set.
			}
		});
	});
}
