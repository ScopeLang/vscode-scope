import * as vscode from "vscode";
import { posix } from "path";

export async function activate(context: vscode.ExtensionContext) {
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

	if (context.workspaceState.get("scopeXml") == null) {
		// Show warning if `scope.xml` could not be found
		vscode.window.showWarningMessage("Could not find a `scope.xml` file in workspace root.\n" +
			"Scope language features will not be available.");
	} else {
		// Show info if `scope.xml` was found
		vscode.window.showInformationMessage("Scope project found!");
	}
}