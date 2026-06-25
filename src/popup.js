// Global array of Google domains
const googleDomains = {
	google: "google.com",
	maps: "maps.google.com",
	news: "news.google.com",
	gemini: "gemini.google.com",
	translate: "translate.google.com",
	drive: "drive.google.com",
	docs: "docs.google.com",
	gmail: "mail.google.com",
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

function isValidTimeRange(startTime, endTime) {
	const startMinutes = parseTimeToMinutes(startTime);
	const endMinutes = parseTimeToMinutes(endTime);

	if (startMinutes === null || endMinutes === null) {
		return false;
	}

	return endMinutes > startMinutes;
}

function setErrorMessage(element, message = "") {
	element.textContent = message;
	element.style.display = message ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", handleDOMLoad);

async function handleDOMLoad() {
	const toggle = document.getElementById("authuserToggle");
	const domainEmailList = document.getElementById("domainEmailList");
	const addButton = document.getElementById("addButton");
	const saveButton = document.getElementById("saveButton");

	// Load the toggle state from storage
	let { isEnabled } = await getFromStorage("isEnabled");
	if (!isEnabled) isEnabled = false;
	toggle.checked = isEnabled;

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
	if (!domainEmails || !Object.keys(domainEmails).length) {
		domainEmails = {
			"youtube.com": {
				email: "user@gmail.com",
				enabled: true,
				days: [...ALL_DAYS],
			},
		};
		await setStorage("domainEmails", domainEmails);
	}

	// Populate the domain-email list
	populateDomainEmailList(domainEmailList, domainEmails);
}

function getKeyFromDomain(domain) {
	return (
		Object.keys(googleDomains).find(
			(key) => googleDomains[key] === domain
		) || null
	);
}

function populateDomainEmailList(container, domainEmails) {
	container.innerHTML = "";

	for (const [domain, value] of Object.entries(domainEmails)) {
		const { email, enabled, days, timeEnabled, startTime, endTime } =
			normalizeDomainSetting(value);

		addDomainEmailPair(
			container,
			getKeyFromDomain(domain),
			email,
			enabled,
			days,
			timeEnabled,
			startTime,
			endTime
		);
	}
}

function addDomainEmailPair(
	container,
	domain = "",
	email = "",
	enabled = true,
	days = [...ALL_DAYS],
	timeEnabled = false,
	startTime = "",
	endTime = ""
) {
	const domainEmailContainer = document.createElement("div");
	domainEmailContainer.className = "domain-email-container";

	// Toggle Switch
	const toggleWrapper = document.createElement("label");
	toggleWrapper.className = "switch";
	const toggleInput = document.createElement("input");
	toggleInput.type = "checkbox";
	toggleInput.checked = enabled;
	toggleInput.addEventListener("change", enableSaveButton);

	const slider = document.createElement("span");
	slider.className = "slider"; // Removed 'round' as border-radius is handled in CSS

	toggleWrapper.appendChild(toggleInput);
	toggleWrapper.appendChild(slider);

	domainEmailContainer.appendChild(toggleWrapper);

	// Content Wrapper (Inputs + Days)
	const contentWrapper = document.createElement("div");
	contentWrapper.className = "content-wrapper";

	// Inputs Row
	const inputsRow = document.createElement("div");
	inputsRow.className = "inputs-row";

	const listContainer = document.createElement("div");
	listContainer.className = "input-domain-container"; // Add class for styling

	// Domain input with custom dropdown
	const domainInput = document.createElement("input");
	domainInput.className = "domain-input";
	domainInput.type = "text";
	domainInput.placeholder = "Select service...";
	domainInput.value = domain;
	// Remove native autocomplete
	domainInput.setAttribute("autocomplete", "off");
	listContainer.appendChild(domainInput);

	// Custom dropdown container
	const dropdownList = document.createElement("div");
	dropdownList.className = "dropdown-list";
	listContainer.appendChild(dropdownList);

	const domainErrorMessage = document.createElement("div");
	domainErrorMessage.className = "error-message domain-error-message";
	domainErrorMessage.textContent = "";
	listContainer.appendChild(domainErrorMessage);

	inputsRow.appendChild(listContainer);

	const emailContainer = document.createElement("div");
	emailContainer.className = "input-email-container"; // Add class for styling
	// Email input

	const emailInput = document.createElement("input");
	emailInput.type = "text";
	emailInput.placeholder = "Enter email...";
	emailInput.value = email;
	emailContainer.appendChild(emailInput);

	const emailErrorMessage = document.createElement("div");
	emailErrorMessage.className = "error-message email-error-message";
	emailErrorMessage.textContent = "";
	emailContainer.appendChild(emailErrorMessage);

	inputsRow.appendChild(emailContainer);

	// Remove button with trash icon
	const removeButton = document.createElement("div");
	removeButton.className = "remove-button";
	removeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
	removeButton.title = "Remove";
	removeButton.addEventListener("click", async () => {
		const domain = domainInput.value.trim();
		let { domainEmails } = await getFromStorage("domainEmails");
		if (domainEmails) {
			delete domainEmails[domain];
		}
		if (!domainEmails || !Object.keys(domainEmails).length) {
			domainEmails = {
				"youtube.com": {
					email: "user@gmail.com",
					enabled: true,
					days: [...ALL_DAYS],
				},
			};
			await setStorage("domainEmails", domainEmails);
		}
		container.removeChild(domainEmailContainer);
		enableSaveButton();
	});
	inputsRow.appendChild(removeButton);

	contentWrapper.appendChild(inputsRow);

	// Days Row
	const daysRow = document.createElement("div");
	daysRow.className = "days-row";

	const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
	const fullDayNames = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	dayLabels.forEach((label, index) => {
		const btn = document.createElement("button");
		btn.className = "day-btn";
		btn.textContent = label;
		btn.dataset.day = index;
		btn.title = fullDayNames[index];
		btn.type = "button"; // Prevent form submission behavior
		if (days.includes(index)) {
			btn.classList.add("selected");
		}
		btn.addEventListener("click", () => {
			btn.classList.toggle("selected");
			enableSaveButton();
		});
		daysRow.appendChild(btn);
	});

	contentWrapper.appendChild(daysRow);

	const timeRow = document.createElement("div");
	timeRow.className = "time-row";

	const timeToggleLabel = document.createElement("label");
	timeToggleLabel.className = "time-toggle-label";

	const timeToggle = document.createElement("input");
	timeToggle.type = "checkbox";
	timeToggle.className = "time-toggle";
	timeToggle.checked = timeEnabled;

	const timeToggleText = document.createElement("span");
	timeToggleText.textContent = "Active hours";

	timeToggleLabel.appendChild(timeToggle);
	timeToggleLabel.appendChild(timeToggleText);
	timeRow.appendChild(timeToggleLabel);

	const timeFields = document.createElement("div");
	timeFields.className = "time-fields";

	const startTimeInput = document.createElement("input");
	startTimeInput.type = "time";
	startTimeInput.className = "time-input start-time-input";
	startTimeInput.value = startTime;

	const timeSeparator = document.createElement("span");
	timeSeparator.className = "time-separator";
	timeSeparator.textContent = "to";

	const endTimeInput = document.createElement("input");
	endTimeInput.type = "time";
	endTimeInput.className = "time-input end-time-input";
	endTimeInput.value = endTime;

	timeFields.appendChild(startTimeInput);
	timeFields.appendChild(timeSeparator);
	timeFields.appendChild(endTimeInput);
	timeRow.appendChild(timeFields);
	contentWrapper.appendChild(timeRow);

	const timeErrorMessage = document.createElement("div");
	timeErrorMessage.className = "error-message time-error-message";
	timeRow.appendChild(timeErrorMessage);

	domainEmailContainer.appendChild(contentWrapper);

	// Add the row to the container
	container.appendChild(domainEmailContainer);

	// Function to check input fields and enable/disable the add button
	function checkInputs() {
		const addButton = document.getElementById("addButton");
		const domainValue = domainInput.value.trim().split(" ")[0];

		const isValidDomain = Object.keys(googleDomains).includes(domainValue);
		const isValidEmail = validateEmail(emailInput.value.trim());

		if (domainValue && isValidDomain && isValidEmail) {
			addButton.classList.remove("disabled");
		} else {
			addButton.classList.add("disabled");
		}
	}

	// Listen for input events to update button state
	domainInput.addEventListener("input", checkInputs);
	emailInput.addEventListener("input", checkInputs);
	// Call checkInputs initially to disable button if inputs are empty
	checkInputs();

	function validateTimeInputs() {
		if (!timeToggle.checked) {
			setErrorMessage(timeErrorMessage);
			return true;
		}

		const hasStartTime = Boolean(startTimeInput.value);
		const hasEndTime = Boolean(endTimeInput.value);

		if (!hasStartTime && !hasEndTime) {
			setErrorMessage(timeErrorMessage);
			return true;
		}

		if (!hasStartTime || !hasEndTime) {
			setErrorMessage(timeErrorMessage, "Start and end time are required");
			return false;
		}

		if (!isValidTimeRange(startTimeInput.value, endTimeInput.value)) {
			setErrorMessage(
				timeErrorMessage,
				"End time must be later than start time"
			);
			return false;
		}

		setErrorMessage(timeErrorMessage);
		return true;
	}

	function syncTimeFieldState({ clearValues = false } = {}) {
		const isTimeRestricted = timeToggle.checked;
		timeFields.classList.toggle("hidden", !isTimeRestricted);
		startTimeInput.disabled = !isTimeRestricted;
		endTimeInput.disabled = !isTimeRestricted;

		if (!isTimeRestricted && clearValues) {
			startTimeInput.value = "";
			endTimeInput.value = "";
		}

		validateTimeInputs();
	}

	timeToggle.addEventListener("change", () => {
		enableSaveButton();
		syncTimeFieldState({ clearValues: !timeToggle.checked });
	});

	[startTimeInput, endTimeInput].forEach((input) => {
		input.addEventListener("input", () => {
			enableSaveButton();
			validateTimeInputs();
		});
	});

	syncTimeFieldState();

	// Validation for email input
	emailInput.addEventListener("input", () => {
		enableSaveButton();

		const emailValue = emailInput.value.trim();

		if (emailValue === "") {
			setErrorMessage(emailErrorMessage, "Email is required");
		} else if (!validateEmail(emailValue)) {
			setErrorMessage(emailErrorMessage, "Invalid email format");
		} else {
			setErrorMessage(emailErrorMessage);
		}
	});

	// Populate dropdown with options
	function updateDropdown(inputValue = "") {
		dropdownList.innerHTML = "";
		let hasMatches = false;

		Object.entries(googleDomains).forEach(([key, value]) => {
			if (
				key.toLowerCase().includes(inputValue.toLowerCase()) ||
				value.toLowerCase().includes(inputValue.toLowerCase())
			) {
				hasMatches = true;
				const item = document.createElement("div");
				item.className = "dropdown-item";
				item.innerHTML = `<strong>${
					key.charAt(0).toUpperCase() + key.slice(1)
				}</strong> <small>(${value})</small>`;

				item.addEventListener("mousedown", (e) => {
					e.preventDefault(); // Prevent input blur
					domainInput.value = key;
					dropdownList.classList.remove("show");
					domainEmailContainer.classList.remove("active-editing");
					checkInputs();
					validateDomain(); // Trigger validation
				});

				dropdownList.appendChild(item);
			}
		});

		if (hasMatches) {
			dropdownList.classList.add("show");
			// Lift the parent container above others
			domainEmailContainer.classList.add("active-editing");
		} else {
			dropdownList.classList.remove("show");
			domainEmailContainer.classList.remove("active-editing");
		}
	}

	// Input event listeners
	domainInput.addEventListener("focus", () => {
		updateDropdown(domainInput.value.trim());
	});

	domainInput.addEventListener("input", () => {
		updateDropdown(domainInput.value.trim());
		checkInputs();
		validateDomain();
	});

	// Close dropdown when clicking outside
	document.addEventListener("click", (e) => {
		if (!listContainer.contains(e.target)) {
			dropdownList.classList.remove("show");
			domainEmailContainer.classList.remove("active-editing");
		}
	});

	function validateDomain() {
		const inputValue = domainInput.value.trim();

		const domains = Array.from(
			container.querySelectorAll(".domain-input")
		).map((input) => input.value.trim().toLowerCase());

		const isDuplicate =
			domains.filter((d) => d === inputValue.toLowerCase()).length > 1;

		setErrorMessage(domainErrorMessage);

		if (!inputValue) {
			setErrorMessage(domainErrorMessage, "Domain is required");
		} else if (!(inputValue in googleDomains)) {
			setErrorMessage(domainErrorMessage, "Invalid service");
		} else if (isDuplicate) {
			setErrorMessage(domainErrorMessage, "Already added");
		}
		enableSaveButton();
	}
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
	const seenDomains = new Set(); // Track domains already processed

	domainEmailContainers.forEach((container) => {
		const domainInput = container.querySelector(".domain-input");
		const emailInput = container.querySelector(
			".input-email-container input"
		);
		const toggleInput = container.querySelector(
			".switch input[type='checkbox']"
		);
		const domainErrorMessage = container.querySelector(
			".domain-error-message"
		);
		const emailErrorMessage = container.querySelector(
			".email-error-message"
		);
		const timeErrorMessage = container.querySelector(
			".time-error-message"
		);
		const timeToggleInput = container.querySelector(".time-toggle");
		const startTimeInput = container.querySelector(".start-time-input");
		const endTimeInput = container.querySelector(".end-time-input");

		const domain = domainInput.value.trim();
		const email = emailInput.value.trim();
		const enabled = toggleInput ? toggleInput.checked : true;
		const timeEnabled = timeToggleInput ? timeToggleInput.checked : false;
		const startTime = startTimeInput ? startTimeInput.value : "";
		const endTime = endTimeInput ? endTimeInput.value : "";

		setErrorMessage(domainErrorMessage);
		setErrorMessage(emailErrorMessage);
		setErrorMessage(timeErrorMessage);

		// Check if domain exists in googleDomains
		if (!(domain in googleDomains)) {
			isValid = false;
			setErrorMessage(domainErrorMessage, "Invalid domain");
			return;
		}

		// Prevent saving if both domain and email are empty
		if (!domain || !email) {
			isValid = false;
			if (!domain) {
				setErrorMessage(domainErrorMessage, "Domain is required");
			}
			if (!email) {
				setErrorMessage(emailErrorMessage, "Email is required");
			}
			return;
		}

		// Get mapped domain key
		const mappedDomain = googleDomains[domain];

		// Check if domain is already processed
		if (seenDomains.has(mappedDomain)) {
			isValid = false;
			setErrorMessage(domainErrorMessage, "Domain already exists");
			return;
		}

		// Mark domain as processed
		seenDomains.add(mappedDomain);

		// Check if email is valid
		if (!validateEmail(email)) {
			isValid = false;
			setErrorMessage(emailErrorMessage, "Invalid email format");
			return;
		}

		// Get selected days
		const dayBtns = container.querySelectorAll(".day-btn.selected");
		const days = normalizeDays(
			Array.from(dayBtns)
			.map((btn) => parseInt(btn.dataset.day))
			.sort((a, b) => a - b)
		);

		if (timeEnabled) {
			if (!startTime || !endTime) {
				isValid = false;
				setErrorMessage(
					timeErrorMessage,
					"Start and end time are required"
				);
				return;
			}

			if (!isValidTimeRange(startTime, endTime)) {
				isValid = false;
				setErrorMessage(
					timeErrorMessage,
					"End time must be later than start time"
				);
				return;
			}
		}

		// Save the domain-email pair
		domainEmails[mappedDomain] = {
			email,
			enabled,
			days,
			...(timeEnabled ? { timeEnabled: true, startTime, endTime } : {}),
		};
	});

	if (!isValid) {
		return;
	}

	try {
		await setStorage("domainEmails", domainEmails);

		let tabs = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (!tabs || tabs.length === 0) {
			console.error("No active tab found");
			return;
		}
		if (tabs[0].url.includes("chrome:")) return;

		await chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			function: () => {
				window.location.reload();
			},
		});
	} catch (error) {
		console.error("Failed to save settings:", error);
		// Optionally show an error to the user
		const saveButton = document.getElementById("saveButton");
		const originalText = saveButton.textContent;
		saveButton.textContent = "Error Saving";
		saveButton.classList.add("disabled");
		setTimeout(() => {
			saveButton.textContent = originalText;
			saveButton.classList.remove("disabled");
		}, 2000);
	}
}

function validateAndMutateKey(key) {
	if (typeof key !== "string") throw new Error("Invalid key");
	return key;
}

async function getFromStorage(key) {
	let storageKey = validateAndMutateKey(key);
	return await chrome.storage.sync.get([storageKey]);
}

async function setStorage(key, value) {
	let storageKey = validateAndMutateKey(key);
	return await chrome.storage.sync.set({ [storageKey]: value });
}

function enableSaveButton() {
	let button = document.getElementById("saveButton");
	button.classList.remove("disabled");
	button.disabled = false;
}
