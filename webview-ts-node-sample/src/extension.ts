import * as vscode from 'vscode';
import * as path from 'path';
import { getHtml } from './webviewUtils';
import { VERSION_CHANGED, VersionChangeNotification } from './model/Notification';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('semverCalculator.start', () => {
			SemverCalculatorPanel.createOrShow(context.extensionUri);
		})
	);
}

/**
 * Manages Webview semver calculator webview panels
 */
class SemverCalculatorPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: SemverCalculatorPanel | undefined;

	public static readonly viewType = 'semverCalculator';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (SemverCalculatorPanel.currentPanel) {
			SemverCalculatorPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			SemverCalculatorPanel.viewType,
			'Webview semver calculator',
			column || vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true,

				// And restrict the webview to only loading content from our extension's webview/out directory.
				localResourceRoots: [vscode.Uri.joinPath(extensionUri, SemverCalculatorPanel.CONTENT_FOLDER)]
			}
		);

		panel.iconPath = vscode.Uri.joinPath(extensionUri, SemverCalculatorPanel.CONTENT_FOLDER, "icon.svg");

		SemverCalculatorPanel.currentPanel = new SemverCalculatorPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					// in case the webview shall reflect state in the extension, re-generate the html and update state
					this.resetContent(this._panel.webview);
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case VERSION_CHANGED: {
						const payload: VersionChangeNotification = message.payload;
						vscode.window.showInformationMessage(`New ${payload.kind} version: ${payload.newVersion}`);
						return;
					}
					case 'initialized':
						this.updatePanelState();
						return;
					default:
						vscode.window.showWarningMessage(`Command not supported: ${message.command}`);
				}
			},
			null,
			this._disposables
		);

		// Set the Webview's initial html content
		this.resetContent(this._panel.webview);
	}

	private postMessage(command: string, payload?: any) {
		this._panel.webview.postMessage({ command: command, payload: payload });
	}

	public dispose() {
		SemverCalculatorPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private static readonly CONTENT_FOLDER = path.join("webview", "out");

	private async resetContent(webview: vscode.Webview) {
		webview.html = await getHtml(webview, this._extensionUri, SemverCalculatorPanel.CONTENT_FOLDER, "view.html");
	}

	private updatePanelState() {
		this.postMessage('state', {
			"version": vscode.version,
			"uiKind": vscode.UIKind[vscode.env.uiKind]
		});
	}
}
