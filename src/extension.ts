import * as vscode from "vscode";
import { posix } from "path";
import { XMLParser } from "fast-xml-parser";

export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async event => {
		if (event.uri === context.workspaceState.get("scopeXml")) {
			await parseScopeXml(event.uri);
		}
	}));

	context.workspaceState.update("scopeXml", null);
	if (vscode.workspace.workspaceFolders !== undefined) {
		// Get the path of the `scope.xml`
		const folderUri = vscode.workspace.workspaceFolders[0].uri;
		const fileUri = folderUri.with({
			path: posix.join(folderUri.path, "scope.xml")
		});

		try {
			// See if the `scope.xml` exists
			await vscode.workspace.fs.stat(fileUri);

			// Set file URI
			context.workspaceState.update("scopeXml", fileUri);
		} catch { }
	}

	if (context.workspaceState.get("scopeXml") === null) {
		// Show warning if `scope.xml` could not be found
		vscode.window.showWarningMessage("Could not find a `scope.xml` file in workspace root.\n" +
			"Scope language features will not be available.");
	} else {
		const xml = await parseScopeXml(context.workspaceState.get("scopeXml")!);

		// Show info if `scope.xml` was found
		vscode.window.showInformationMessage("Scope project found!");
	}
}

async function parseScopeXml(xml: vscode.Uri): Promise<any> {
	const scopeXmlBytes = await vscode.workspace.fs.readFile(xml);

	const parser = new XMLParser();
	try {
		return parser.parse(Buffer.from(scopeXmlBytes));
	} catch {
		return {};
	}
}