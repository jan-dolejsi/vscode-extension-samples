import * as vscode from "vscode";
import * as fs from "fs";

/**
 * Reads HTML template from a file.
 * @param extensionUri extension installation uri
 * @param folder directory, where the HTML template and all media and script files are located
 * @param templateNameName HTML file name
 */
export async function getViewTemplate(extensionUri: vscode.Uri, folder: string, templateNameName: string): Promise<string> {
    const previewPath = vscode.Uri.joinPath(extensionUri, folder, templateNameName);

    return new Promise<string>((resolve, reject) => {
        fs.readFile(previewPath.fsPath, "utf8", function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}

/**
 * Reads the HTML template and injects the Content Security Policy to it and replaces media and script file URLs.
 * @param webview webview for which the HTML is being created
 * @param extensionUri extension installation uri
 * @param mediaFolder directory, where the HTML template and all media and script files are located
 * @param templateNameName HTML file name
 */
export async function getHtml(webview: vscode.Webview, extensionUri: vscode.Uri, mediaFolder: string, templateFileName: string): Promise<string> {
    const templateHtml = await getViewTemplate(extensionUri, mediaFolder, templateFileName);

    // generate nonce for secure calling of javascript
    const nonce = getNonce();

    // be sure that the template has a placeholder for Content Security Policy
    if (!templateHtml.includes("<!-- CSP -->") || templateHtml.includes('http-equiv="Content-Security-Policy"')) {
        throw new Error(`Template does not contain CSP placeholder or contains rogue CSP.`);
    }

    // insert Content Security Policy
    let html = templateHtml.replace("<!-- CSP -->", createContentSecurityPolicy(webview, nonce));

    // change resource URLs from relative URLs to vscode-resource URLs
    html = html.replace(/<(script|link) ([^>]*)(src|href)="([^"]+)"/g, (fullMatch: string, tagName: string, passThrough: string, attribName: string, attribValue: string) => {
        if (attribValue.startsWith('http')) {
            return fullMatch;
        }
        const resource = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, mediaFolder, attribValue));
        const nonceAttr = attribName.toLowerCase() === "src" ? `nonce="${nonce}" ` : "";
        return `<${tagName} ${passThrough ?? ""}${nonceAttr} ${attribName}="${resource}"`;
    });

    return html;
}

function createContentSecurityPolicy(webview: vscode.Webview, nonce: string) {
    return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; `
        + `img-src ${webview.cspSource} https:; `
        + `style-src ${webview.cspSource}; `
        + `script-src 'nonce-${nonce}'; `
        + `font-src ${webview.cspSource}; ">`;
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
