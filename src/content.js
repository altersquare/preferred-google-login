const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

function normalizeDays(days) {
	if (!Array.isArray(days) || days.length === 0) {
		return [...ALL_DAYS];
	}

	const normalizedDays = [...new Set(days)]
		.map((day) => Number(day))
		.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
		.sort((a, b) => a - b);

	return normalizedDays.length ? normalizedDays : [...ALL_DAYS];
}

function normalizeDomainSetting(value) {
	if (typeof value === "string") {
		return {
			email: value,
			enabled: true,
			days: [...ALL_DAYS],
			timeEnabled: false,
			startTime: "",
			endTime: "",
		};
	}

	return {
		email: value?.email || "",
		enabled: value?.enabled !== false,
		days: normalizeDays(value?.days),
		timeEnabled: Boolean(value?.timeEnabled),
		startTime: value?.startTime || "",
		endTime: value?.endTime || "",
	};
}

function parseTimeToMinutes(timeValue) {
	if (!/^\d{2}:\d{2}$/.test(timeValue)) {
		return null;
	}

	const [hours, minutes] = timeValue.split(":").map(Number);
	if (
		!Number.isInteger(hours) ||
		!Number.isInteger(minutes) ||
		hours < 0 ||
		hours > 23 ||
		minutes < 0 ||
		minutes > 59
	) {
		return null;
	}

	return hours * 60 + minutes;
}

function isWithinActiveHours(startTime, endTime, currentMinutes) {
	const startMinutes = parseTimeToMinutes(startTime);
	const endMinutes = parseTimeToMinutes(endTime);

	if (startMinutes === null || endMinutes === null) {
		return false;
	}

	return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

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
		const { email, enabled, days, timeEnabled, startTime, endTime } =
			normalizeDomainSetting(domainSetting);

		if (!enabled) {
			console.log("Extension is disabled for this domain.");
			return;
		}

		// Check if the rule applies to the current day
		const currentDay = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
		if (!days.includes(currentDay)) {
			console.log("Rule is not active for today.");
			return;
		}

		if (timeEnabled) {
			const now = new Date();
			const currentMinutes = now.getHours() * 60 + now.getMinutes();

			if (!isWithinActiveHours(startTime, endTime, currentMinutes)) {
				console.log("Rule is not active at this time.");
				return;
			}
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
		const hasPathAuthUser = /\/u\/\d+/.test(url.pathname);
		const pathAuthUserAttemptKey = `pgl_path_authuser_attempt:${url.hostname}${url.pathname}`;
		const hasPathAuthUserAttempt = sessionStorage.getItem(
			pathAuthUserAttemptKey
		);
		const currentAuthUser = url.searchParams.get("authuser");
		const normalizedCurrentAuthUser = currentAuthUser
			? currentAuthUser.toLowerCase()
			: "";
		const normalizedPreferredAuthUser = authUserEmail.toLowerCase();
		const isCurrentAuthUserEmail =
			!!currentAuthUser && currentAuthUser.includes("@");

		if (hasPathAuthUser) {
			if (
				!hasPathAuthUserAttempt &&
				(!currentAuthUser ||
					(isCurrentAuthUserEmail &&
						normalizedCurrentAuthUser !==
							normalizedPreferredAuthUser))
			) {
				url.searchParams.set("authuser", authUserEmail);
				modified = true;
				sessionStorage.setItem(pathAuthUserAttemptKey, "true");
			}
		} else if (!currentAuthUser) {
			url.searchParams.set("authuser", authUserEmail);
			modified = true;
		} else if (
			isCurrentAuthUserEmail &&
			normalizedCurrentAuthUser !== normalizedPreferredAuthUser
		) {
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
 * Sets data in Chrome local storage.
 * @param {string} key The key to set.
 * @param {any} value The value to set.
 * @returns {Promise<void>} A promise that resolves when the data is set.
 */
async function setStorage(key, value) {
	let storageKey = validateAndMutateKey(key); // Validate the key.
	return await chrome.storage.sync.set({ [storageKey]: value });
}
