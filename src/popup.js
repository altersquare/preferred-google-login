document.addEventListener("DOMContentLoaded", handleDOMLoad);

async function handleDOMLoad() {
	// Get references to the HTML elements
	const toggle = document.getElementById("authuserToggle");
	const domainTextarea = document.getElementById("domainTextarea");
	const emailTextarea = document.getElementById("emailTextarea");
	const saveButton = document.getElementById("saveButton");

	// Load the state of the toggle from storage
	let { isEnabled } = await getFromStorage("isEnabled");
	toggle.checked = isEnabled === undefined ? true : isEnabled;

	// Add an event listener to the toggle to save the state when it changes
	toggle.addEventListener("change", async () => {
		await setStorage("isEnabled", toggle.checked);
	});

	// Add an event listener to the save button
	saveButton.addEventListener(
		"click",
		handleSaveClick.bind(this, domainTextarea, emailTextarea)
	);

	// Load the domains and authuser email from storage
	let { domains } = await getFromStorage("domains");
	let { authUserEmail } = await getFromStorage("authUserEmail");

	// If no domains are stored, set default domains
	if (domains === undefined) {
		domains = ["youtube.com", "gemini.google.com"];
		await setStorage("domains", domains);
	}
	// If no authuser email is stored, set a default email
	if (authUserEmail === undefined) {
		authUserEmail = "user@gmail.com";
		await setStorage("authUserEmail", authUserEmail);
	}

	// Populate the textareas with the loaded values
	domainTextarea.value = domains.join("\n");
	emailTextarea.value = authUserEmail;
}

async function handleSaveClick(domainTextarea, emailTextarea) {
	// Get the domains from the textarea, splitting by newline and filtering empty lines
	const domains = domainTextarea.value
		.split("\n")
		.filter((domain) => domain.trim() !== "");
	// Get the authuser email from the textarea
	const authUserEmail = emailTextarea.value.trim();

	// Save the domains and authuser email to storage
	await setStorage("domains", domains);
	await setStorage("authUserEmail", authUserEmail);

	// Reload the current tab to apply the changes
	let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tabs || (tabs && tabs.length == 0)) {
		console.error("No active tab found");
	}
	await chrome.scripting.executeScript({
		target: { tabId: tabs[0].id },
		function: () => {
			window.location.reload(); // Reload content scripts
		},
	});
	window.close(); // Close the popup after saving
}

// Helper function to validate the storage key
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
 * Sets data in Chrome local storage.
 * @param {string} key The key to set.
 * @param {any} value The value to set.
 * @returns {Promise<void>} A promise that resolves when the data is set.
 */
async function setStorage(key, value) {
	let storageKey = validateAndMutateKey(key); // Validate the key.
	return await chrome.storage.local.set({ [storageKey]: value });
}
