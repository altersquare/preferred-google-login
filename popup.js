document.addEventListener("DOMContentLoaded", () => {
	const toggle = document.getElementById("authuserToggle");

	// Load the current state of the toggle from storage
	chrome.storage.local.get("isEnabled", (data) => {
		toggle.checked = data.isEnabled || false; // Default to false if not set
	});

	// Save the toggle state when it changes
	toggle.addEventListener("change", () => {
		chrome.storage.local.set({ isEnabled: toggle.checked });
	});
});
