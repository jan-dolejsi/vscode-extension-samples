import { State, VersionChangeNotification } from "model";
import { increment } from "./versionManagement";

/** VS Code stub, so we can work with it in a type safe way. */
interface VsCodeApi {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postMessage(payload: any): void;
}

declare const acquireVsCodeApi: () => VsCodeApi;

let vscode: VsCodeApi | undefined;
try {
    vscode = acquireVsCodeApi();
} catch (error) {
    console.warn(error);
    // swallow, so the script can be tested in a browser
}

window.addEventListener('message', event => {
    const message = event.data;

    switch (message.command) {
        case 'state':
            renderState(message.payload);
            break;
        default:
            console.error("Unexpected message: " + message.command);
    }
});

function postCommand(command: string): void {
    postMessage({ 'command': command });
}

function postMessage(message: unknown): void {
    if (vscode) { vscode.postMessage(message); }
    else {
        console.log(`Message would be sent to VS Code:`);
        console.dir(message);
    }
}

const VERSION_HOST = "version";
const UI_KIND_HOST = "uiKind";

/** Html element that hosts the version string */
let versionHostElement: HTMLElement | null = null;
let uiKindHostElement: HTMLElement | null = null;

// `export` ensures the function is visible to the HTML
export function initialize(): void {
    console.log(`Webview was loaded and starts initializing...`);

    versionHostElement = document.getElementById(VERSION_HOST);
    if (!versionHostElement) {
        console.error(`Cannot find any '${VERSION_HOST}' element in the document.`);
        return;
    }

    uiKindHostElement = document.getElementById(UI_KIND_HOST);
    if (!uiKindHostElement) {
        console.error(`Cannot find any '${UI_KIND_HOST}' element in the document.`);
        return;
    }

    registerCallback("incrementMajor", incrementMajor);
    registerCallback("incrementMinor", incrementMinor);
    registerCallback("incrementPatch", incrementPatch);

    if (!vscode) {
        // we are running outside of VS Code
        populateWithTestData();
    }
    postCommand('initialized');
}

window.document.body.onload = initialize;

function registerCallback(buttonId: string, buttonCallback: () => void) {
    const incrementBtn = document.getElementById(buttonId);
    if (incrementBtn) {
        incrementBtn.onclick = buttonCallback;
    } else {
        console.error(`Cannot find any #${buttonId} element in the document.`);
    }
}

function renderState(state: State): void {
    console.log("New state received from the extension.");
    if (versionHostElement) {
        versionHostElement.innerText = state.version;
    }

    if (uiKindHostElement) {
        uiKindHostElement.innerHTML = state.uiKind;
    }
}

function populateWithTestData(): void {
    renderState({ version: "9.9.9", uiKind: "browser" });
}

function incrementMajor() {
    if (versionHostElement) {
        versionHostElement.innerText =
            increment(versionHostElement.innerText, "major");
        
        // notify the extension that tha major version changed
        const payload: VersionChangeNotification = { kind: 'major', newVersion: versionHostElement.innerText };
        
        postMessage({ command: 'versionChanged', payload: payload });
    }
}

function incrementMinor() {
    if (versionHostElement) {
        versionHostElement.innerText =
            increment(versionHostElement.innerText, "minor");
    }
}

function incrementPatch() {
    if (versionHostElement) {
        versionHostElement.innerText =
            increment(versionHostElement.innerText,"patch");
    }
}