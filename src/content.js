// Immediately invoked function expression (IIFE) to execute code on page load.
(async () => {
	try {
		// Retrieve stored settings from Chrome storage.
		const { isEnabled } = await getFromStorage("isEnabled"); // Get whether the extension is enabled.
		const { domainEmails } = await getFromStorage("domainEmails"); // Get the domain-email pairs.

		// If on a Chrome internal page (e.g., extensions page), exit.
		if (window.location.protocol === "chrome:") return;

		// If the extension is explicitly disabled, exit.
		if (isEnabled !== undefined && !isEnabled) {
			console.log("Extension is disabled.");
			return;
		}

		// Check if the current URL's hostname is in the allowed domains list.
		const emailForDomain = Object.keys(domainEmails).find((domain) =>
			window.location.hostname.includes(domain)
		);

		// If the domain is not allowed or no email is set for it, exit.
		if (!emailForDomain) {
			console.log("Domain not allowed or no email set for this domain.");
			return;
		}

		// Add the authuser parameter to the URL.
		setAuthUser(domainEmails[emailForDomain]);
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
	let newURL = currentURL.replace(/(\.com).*/, "$1") + "?" + authuserParam; // Add with ? if no query params are present

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
	return await chrome.storage.local.get([storageKey]);
}

/**
 * Removes data from Chrome local storage.
 * @param {string} key The key to remove.
 * @returns {Promise<void>} A promise that resolves when the data is removed.
 */
async function removeFromStorage(key) {
	let storageKey = validateAndMutateKey(key); // Validate the key.
	return await chrome.storage.local.remove(storageKey);
}

/**
 * Sets data in Chrome local storage.
 * @param {string} key The key to set.
 * @param {any} value The value to set.
 * @returns {Promise<void>} A promise that resolves when the data is set.
 */
async function setStorage(key, value) {
	let storageKey = validateAndMutateKey(key); // Validate the key.
	return await chrome.storage.local.set({ [storageKey]: value });
}
