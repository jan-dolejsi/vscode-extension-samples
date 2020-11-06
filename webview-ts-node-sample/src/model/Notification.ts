/** Notification message schema that webview sends back to VS Code. */
export interface VersionChangeNotification {
	kind: "major" | "minor" | "patch";
	newVersion: string;
}

/** Message command. */
export const VERSION_CHANGED = 'versionChanged';