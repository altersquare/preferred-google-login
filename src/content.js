// Immediately invoked function expression (IIFE) to execute code on page load.
(async () => {
	try {
		// Retrieve stored settings from Chrome storage.
		const { isEnabled } = await getFromStorage("isEnabled"); // Get whether the extension is enabled.
		let { domainEmails } = await getFromStorage("domainEmails"); // Get the domain-email pairs.

		// If on a Chrome internal page (e.g., extensions page), exit.
		if (window.location.protocol === "chrome:") return;

		// If the extension is explicitly disabled or not enabled yet (value undefined), then exit.
		if (!isEnabled) {
			console.log("Extension is disabled.");
			return;
		}

		if (!domainEmails || !Object.keys(domainEmails).length) {
			domainEmails = {
				"youtube.com": "user@gmail.com",
			};
			await setStorage("domainEmails", domainEmails);
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
		await setAuthUser(domainEmails[emailForDomain]);
	} catch (error) {
		console.error("Error:", error); // Log any errors.
	}
})();

async function setAuthUser(authUserEmail) {
	// Retrieve storage data for the current domain to check if we've already processed it
	const data = await getFromStorage(window.location.hostname);

	// If the domain is already flagged in storage (processed this session),
	// remove the flag and exit without modifying the URL
	if (data.hasOwnProperty(window.location.hostname)) {
		await removeFromStorage(window.location.hostname);
		console.log("Auth User was already added.");
		return; // Exit the function early
	}

	// Get the current full URL and store it for modification
	let currentURL = window.location.href;

	// Check for and remove any Google-specific user segment (e.g., /u/2) from the URL
	if (currentURL.match(/\/u\/\d+/)) {
		currentURL = currentURL.replace(/\/u\/\d+/, ""); // Strip out /u/[number] pattern
	}

	// Construct the authuser query parameter using the provided email
	const authuserParam = "authuser=" + authUserEmail;

	// If the authuser parameter is already in the URL, log it and exit without changes
	if (currentURL.includes(authuserParam)) {
		// console.log("Authuser parameter already present."); // Inform the developer
		return; // Exit the function early
	}

	// Set a flag in storage to mark this domain as processed for this session
	if (!data.hasOwnProperty(window.location.hostname))
		await setStorage(window.location.hostname, true);

	window.location.href =
		currentURL + (currentURL.includes("?") ? "&" : "?") + authuserParam;
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
	return await chrome.storage.sync.get([storageKey]);
}

/**
 * Removes data from Chrome local storage.
 * @param {string} key The key to remove.
 * @returns {Promise<void>} A promise that resolves when the data is removed.
 */
async function removeFromStorage(key) {
	let storageKey = validateAndMutateKey(key); // Validate the key.
	return await chrome.storage.sync.remove(storageKey);
}

/**
 * Sets data in Chrome local storage.
 * @param {string} key The key to set.
 * @param {any} value The value to set.
 * @returns {Promise<void>} A promise that resolves when the data is set.
 */
async function setStorage(key, value) {
	let storageKey = validateAndMutateKey(key); // Validate the key.
	return await chrome.storage.sync.set({ [storageKey]: value });
}
