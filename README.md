# Default Google User Chrome Extension

This Chrome extension simplifies switching between multiple Google accounts by automatically adding the `authuser` parameter to relevant Google domains.

## Description

The `authuser` parameter in Google URLs specifies which account should be used when accessing a Google service. This extension automates the process of adding this parameter, allowing you to easily switch between accounts without manually editing URLs.  It also prevents the `authuser` parameter from being repeatedly added to the URL, avoiding infinite redirect loops.

## Features

* **Automatic `authuser` Parameter Insertion:** The extension automatically adds the `authuser` parameter to the URLs of specified Google domains.
* **Domain Whitelisting:** Configure the extension to only add the `authuser` parameter to specific domains, preventing it from affecting other websites.
* **Easy Account Switching:** Quickly switch between Google accounts by simply changing the email address in the extension's popup.
* **Enable/Disable:** Easily enable or disable the extension with a single toggle.
* **Prevent Duplicate Parameter Insertion:** The extension prevents the `authuser` parameter from being added multiple times, avoiding redirect loops.

## Installation

1. Clone this repository: `git clone https://github.com/rohandhamapurkar/default-google-account-extension.git`
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory where you cloned the repository.

## Usage

1. Click the extension icon in the Chrome toolbar to open the popup.
2. **Enable/Disable:** Use the toggle to enable or disable the extension.
3. **Domains:** Enter the Google domains you want the extension to affect, one domain per line. For example:
```
mail.google.com
drive.google.com
youtube.com
```

4. **Authuser Email:** Enter the email address of the Google account you want to use by default.
5. Click "Save".

The extension will now automatically add the `authuser` parameter to the specified domains. To switch to a different account, simply change the email address in the popup and save the changes.

## Code Explanation

The extension uses `chrome.storage` to persist the enabled state, allowed domains, and the authuser email. The `content.js` script runs at `document_start` and checks if the extension is enabled and the current domain is allowed. If both conditions are met, it adds the `authuser` parameter to the URL.  Critically, it checks if the parameter is already present to prevent infinite redirect loops.

The `popup.html` file creates the user interface for configuring the extension.  The `popup.js` script handles saving and loading the configuration from `chrome.storage`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any suggestions or improvements.

## License

This extension is licensed under the [MIT License](LICENSE).

## Credits

This extension was developed by Rohan Dhamapurkar.

## Contact

If you have any questions or issues, please contact dhamapurkar54@gmail.com.
