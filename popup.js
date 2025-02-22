document.addEventListener("DOMContentLoaded", handleDOMLoad);

async function handleDOMLoad() {
	const toggle = document.getElementById("authuserToggle");

	// Load toggle state
	let { isEnabled } = await getFromStorage("isEnabled");
	toggle.checked = isEnabled === undefined ? true : isEnabled;

	toggle.addEventListener("change", async () => {
		await setStorage("isEnabled", toggle.checked);
	});

	const domainTextarea = document.getElementById("domainTextarea");
	const emailTextarea = document.getElementById("emailTextarea");
	const saveButton = document.getElementById("saveButton");

	let { domains } = await getFromStorage("domains");
	let { authUserEmail } = await getFromStorage("authUserEmail");

	if (domains === undefined) {
		domains = ["youtube.com", "gemini.google.com"];
		await setStorage("domains", domains);
	}
	if (authUserEmail === undefined) {
		authUserEmail = "user@gmail.com";
		await setStorage("authUserEmail", authUserEmail);
	}
	domainTextarea.value = domains.join("\n");
	emailTextarea.value = authUserEmail;

	saveButton.addEventListener("click", handleSaveBtnClick);
}

async function handleSaveBtnClick() {
	const domains = domainTextarea.value
		.split("\n")
		.filter((domain) => domain.trim() !== ""); // Split by newlines, filter empty lines
	const authUserEmail = emailTextarea.value.trim();

	await setStorage("domains", domains);
	await setStorage("authUserEmail", authUserEmail);
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			function: () => {
				window.location.reload(); // Reload content scripts
			},
		});
		window.close(); // Close the popup after saving
	});
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
