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
		const matchedDomain = Object.keys(domainEmails).find((domain) =>
			window.location.hostname.includes(domain)
		);

		// If the domain is not allowed or no email is set for it, exit.
		if (!matchedDomain) {
			console.log("Domain not allowed or no email set for this domain.");
			return;
		}

		const domainSetting = domainEmails[matchedDomain];
		let email, enabled;

		if (typeof domainSetting === "string") {
			email = domainSetting;
			enabled = true;
		} else {
			email = domainSetting.email;
			enabled = domainSetting.enabled;
		}

		if (!enabled) {
			console.log("Extension is disabled for this domain.");
			return;
		}

		// Add the authuser parameter to the URL.
		await setAuthUser(email);
	} catch (error) {
		console.error("Error:", error); // Log any errors.
	}
})();

async function setAuthUser(authUserEmail) {
	const LOOP_FLAG_KEY = "pgl_redirect_flag";

	// Check if we just redirected to prevent loops
	if (sessionStorage.getItem(LOOP_FLAG_KEY)) {
		sessionStorage.removeItem(LOOP_FLAG_KEY);
		// console.log("Redirect loop prevention triggered.");
		return;
	}

	try {
		const url = new URL(window.location.href);
		let modified = false;

		// 1. Handle path-based authuser (e.g., /u/0, /u/1)
		// We use a regex to match /u/DIGITS in the pathname
		if (/\/u\/\d+/.test(url.pathname)) {
			url.pathname = url.pathname.replace(/\/u\/\d+/, "");
			modified = true;
		}

		// 2. Handle query-based authuser
		const currentAuthUser = url.searchParams.get("authuser");

		// If the authuser param is missing or different from the preferred email
		if (currentAuthUser !== authUserEmail) {
			url.searchParams.set("authuser", authUserEmail);
			modified = true;
		}

		// If we made changes (either path or query param), redirect
		if (modified) {
			// Set a session flag so we know this redirect was intentional
			sessionStorage.setItem(LOOP_FLAG_KEY, "true");
			window.location.href = url.toString();
		}
	} catch (error) {
		console.error("Error setting authuser:", error);
	}
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
