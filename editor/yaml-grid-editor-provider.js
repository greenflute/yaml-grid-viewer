const vscode = require('vscode')
const { YamlGridViewer } = require('./yaml-grid-viewer')

class YamlGridEditorProvider {

	constructor(context) {
		this.context = context
	}

	static register(context) {
		const viewType = 'yamlGridViewer.yaml'
		const providerRegistration = vscode.window.registerCustomEditorProvider(
			viewType, new YamlGridEditorProvider(context)
		)
		return providerRegistration
	}

	async resolveCustomTextEditor(document, webviewPanel, _token) {
		// Initialise viewer
		const yamlGridViewer = new YamlGridViewer(document, webviewPanel, this.context)

		// Make sure we clean up when our editor is closed.
		webviewPanel.onDidDispose(() => {
			yamlGridViewer.cleanup()
			yamlGridViewer = null
		});
	}
}

module.exports.YamlGridEditorProvider = YamlGridEditorProvider
