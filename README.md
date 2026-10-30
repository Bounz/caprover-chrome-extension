# CapRover Redeploy

CapRover Redeploy is a Chrome extension that adds a redeploy button next to each
Docker image in the **Version History** table on a CapRover app page.

When you click the button, the extension:

1. reads the image name from the selected row;
2. enters it into CapRover's built-in **Method 6: Deploy via ImageName** form;
3. clicks the built-in **Deploy Now** button.

The extension does not read or store passwords, tokens, or cookies. Deployment
is performed by the CapRover interface in your already authenticated tab.

## Installation

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this directory.
5. Refresh your open CapRover tab.

## Installation in Firefox / Zen Browser

The Firefox build uses the same `content.js` and `styles.css` with its own
manifest in `firefox/manifest.json`.

1. Run `./firefox/build.sh`. It creates `dist/firefox/` and
   `dist/caprover-redeploy-firefox.zip`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…** and select `dist/firefox/manifest.json`.
4. Open `about:addons`, select **CapRover Redeploy**, and on the
   **Permissions** tab make sure access to all websites is allowed.
5. Refresh your open CapRover tab.

A temporary add-on is removed when the browser restarts. To keep it installed
permanently, sign `dist/caprover-redeploy-firefox.zip` on
[addons.mozilla.org](https://addons.mozilla.org/developers/) as an unlisted
add-on and install the signed `.xpi` file.

## Usage

Open an app in CapRover and select the **Deployment** tab. A blue redeploy button
will appear next to each image in the **Image Name** column. Click the button in
the desired row to start deploying that image immediately.

The extension requests access to HTTP and HTTPS pages because CapRover can be
hosted on any custom domain. The script does nothing on pages whose URL does not
match `/apps/details/<app-name>`.
