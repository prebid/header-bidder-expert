# Header Bidder Expert

A Chrome and Firefox extension to show header bidding activity on the websites.

## Build

```
npm install

gulp
```

The following folders will be created:

- `target/chrome/local` - Extension that can be loaded in local Chrome browser. Used for for development and debugging.
- `target/chrome/package` - Packed extension that can be uploaded to Chrome Web Store. Used to distribute the extension to the end users.
- `target/firefox/local` - Extension that can be loaded in local Firefox browser. Used for for development and debugging.
- `target/firefox/package` - Packed extension that can be uploaded to Firefox Add-ons Store. Used to distribute the extension to the end users.

## Usage

Visit the website of interest. If the extension detects header bidding activity, then its icon will become colored. Click the icon to see the report.
