// Global array of Google domains
const googleDomains = {
	google: "google.com",
	maps: "maps.google.com",
	news: "news.google.com",
	gemini: "gemini.google.com",
	translate: "translate.google.com",
	drive: "drive.google.com",
	docs: "docs.google.com",
	mail: "mail.google.com",
	photos: "photos.google.com",
	keep: "keep.google.com",
	meet: "meet.google.com",
	classroom: "classroom.google.com",
	play: "play.google.com",
	developers: "developers.google.com",
	cloud: "cloud.google.com",
	adsense: "adsense.google.com",
	business: "business.google.com",
	merchants: "merchants.google.com",
	tagmanager: "tagmanager.google.com",
	marketingplatform: "marketingplatform.google.com",
	youtube: "youtube.com",
	studio: "studio.youtube.com",
	artsandculture: "artsandculture.google.com",
	store: "store.google.com",
	wearos: "wearos.google.com",
	domains: "domains.google.com",
	fi: "fi.google.com",
	one: "one.google.com",
	pay: "pay.google.com",
	shopping: "shopping.google.com",
	fonts: "fonts.google.com",
	labs: "labs.google.com",
	ai: "ai.google",
};

document.addEventListener("DOMContentLoaded", handleDOMLoad);

async function handleDOMLoad() {
	const toggle = document.getElementById("authuserToggle");
	const domainEmailList = document.getElementById("domainEmailList");
	const addButton = document.getElementById("addButton");
	const saveButton = document.getElementById("saveButton");
	saveButton.disabled = true;

	// Load the toggle state from storage
	let { isEnabled } = await getFromStorage("isEnabled");
	toggle.checked = isEnabled === undefined ? true : isEnabled;

	// Save the toggle state when it changes
	toggle.addEventListener("change", async () => {
		await setStorage("isEnabled", toggle.checked);
		enableSaveButton();
	});

	// Add a new domain-email pair
	addButton.addEventListener("click", () => {
		addDomainEmailPair(domainEmailList);
		domainEmailList.scrollTop = domainEmailList.scrollHeight;
		enableSaveButton();
	});

	// Save changes
	saveButton.addEventListener("click", handleSaveClick);

	// Load domainEmails from storage
	let { domainEmails } = await getFromStorage("domainEmails");

	// Set default domainEmails if none exist
	if (domainEmails === undefined) {
		domainEmails = {
			"youtube.com": "user@gmail.com",
		};
		await setStorage("domainEmails", domainEmails);
	}

	// Populate the domain-email list
	populateDomainEmailList(domainEmailList, domainEmails, saveButton);
}

function populateDomainEmailList(container, domainEmails, saveButton) {
	container.innerHTML = "";

	for (const [domain, email] of Object.entries(domainEmails)) {
		addDomainEmailPair(container, domain, email, saveButton);
	}
}

function addDomainEmailPair(container, domain = "", email = "") {
	const domainEmailContainer = document.createElement("div");
	domainEmailContainer.className = "domain-email-container";

	const listContainer = document.createElement("div");
	listContainer.className = "input-domain-container"; // Add class for styling

	// Domain input with datalist for autocomplete
	const domainInput = document.createElement("input");
	domainInput.className = "domain-input";
	domainInput.type = "text";
	domainInput.placeholder = "Search or select domain...";
	domainInput.value = domain;
	domainInput.setAttribute("list", `domain-list-${Math.random()}`);
	listContainer.appendChild(domainInput);

	// Datalist for autocomplete suggestions
	const domainDataList = document.createElement("datalist");
	domainDataList.id = domainInput.getAttribute("list");
	Object.keys(googleDomains).forEach((googleDomain) => {
		const option = document.createElement("option");
		option.value = googleDomain;
		domainDataList.appendChild(option);
	});
	listContainer.appendChild(domainDataList);

	const domainErrorMessage = document.createElement("div");
	domainErrorMessage.className = "error-message";
	domainErrorMessage.textContent = "";
	listContainer.appendChild(domainErrorMessage);

	domainEmailContainer.appendChild(listContainer);

	const emailContainer = document.createElement("div");
	emailContainer.className = "input-email-container"; // Add class for styling
	// Email input

	const emailInput = document.createElement("input");
	emailInput.type = "text";
	emailInput.placeholder = "Enter email...";
	emailInput.value = email;
	emailContainer.appendChild(emailInput);

	const emailErrorMessage = document.createElement("div");
	emailErrorMessage.className = "error-message";
	emailErrorMessage.textContent = "";
	emailContainer.appendChild(emailErrorMessage);

	domainEmailContainer.appendChild(emailContainer);

	// Remove button with cross icon
	const removeButton = document.createElement("div");
	removeButton.className = "remove-button";
	removeButton.innerHTML = "&times;";
	removeButton.addEventListener("click", async () => {
		const domain = domainInput.value.trim();
		const { domainEmails } = await getFromStorage("domainEmails");
		delete domainEmails[domain];
		await setStorage("domainEmails", domainEmails);
		container.removeChild(domainEmailContainer);
		enableSaveButton();
	});
	domainEmailContainer.appendChild(removeButton);

	// Add the row to the container
	container.appendChild(domainEmailContainer);

	// Function to check input fields and enable/disable the add button
	function checkInputs() {
		const addButton = document.getElementById("addButton");
		if (domainInput.value.trim() || emailInput.value.trim()) {
			addButton.disabled = false;
		} else {
			addButton.disabled = true;
		}
	}

	// Listen for input events to update button state
	domainInput.addEventListener("input", checkInputs);
	emailInput.addEventListener("input", checkInputs);

	// Call checkInputs initially to disable button if inputs are empty
	checkInputs();

	// Validation for email input
	emailInput.addEventListener("input", () => {
		enableSaveButton();

		const emailValue = emailInput.value.trim();

		if (emailValue === "") {
			emailErrorMessage.textContent = "Email is required";
			emailErrorMessage.style.display = "block";
		} else if (!validateEmail(emailValue)) {
			emailErrorMessage.textContent = "Invalid email format";
			emailErrorMessage.style.display = "block";
		} else {
			emailErrorMessage.style.display = "none";
		}
	});

	// Validation for duplicate domains
	domainInput.addEventListener("input", () => {
		enableSaveButton();
		const trimmedDomain = domainInput.value.trim();

		const domains = Array.from(
			container.querySelectorAll(".domain-input")
		).map((input) => input.value.trim());

		const isDuplicate =
			domains.filter((d) => d === trimmedDomain).length > 1;

		if (trimmedDomain === "") {
			domainErrorMessage.textContent = "Domain is required";
			domainErrorMessage.style.display = "block";
		} else if (isDuplicate) {
			domainErrorMessage.textContent = "Domain already exists";
			domainErrorMessage.style.display = "block";
		} else {
			domainErrorMessage.style.display = "none";
		}
	});
}

function validateEmail(email) {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
}

async function handleSaveClick() {
	const domainEmailContainers = document.querySelectorAll(
		".domain-email-container"
	);

	const domainEmails = {};

	let isValid = true;

	domainEmailContainers.forEach((container) => {
		const domainInput = container.querySelector(".domain-input");
		const emailInput = container.querySelector(
			".input-email-container input"
		);

		const domain = domainInput.value.trim();
		const email = emailInput.value.trim();

		if (domain === "" || email === "") isValid = false;

		if (domainEmails[domain]) {
			isValid = false;
			container.querySelector(
				".error-message:first-of-type"
			).style.display = "block";
		} else {
			domainEmails[domain] = email;
		}

		if (!validateEmail(email)) {
			isValid = false;
			container.querySelector(
				".error-message:last-of-type"
			).style.display = "block";
		}
	});

	if (!isValid) {
		return;
	}

	await setStorage("domainEmails", domainEmails);

	let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tabs || (tabs && tabs.length == 0)) {
		console.error("No active tab found");
	}
	await chrome.scripting.executeScript({
		target: { tabId: tabs[0].id },
		function: () => {
			window.location.reload();
		},
	});
	window.close();
}

function validateAndMutateKey(key) {
	if (typeof key !== "string") throw new Error("Invalid key");
	return key;
}

async function getFromStorage(key) {
	let storageKey = validateAndMutateKey(key);
	return await chrome.storage.local.get([storageKey]);
}

async function setStorage(key, value) {
	let storageKey = validateAndMutateKey(key);
	return await chrome.storage.local.set({ [storageKey]: value });
}

function enableSaveButton() {
	let button = document.getElementById("saveButton");
	button.classList.remove("disabled");
	button.disabled = false;
}
