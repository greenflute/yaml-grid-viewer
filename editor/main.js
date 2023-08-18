const { YamlGridEditorProvider } = require( "./yaml-grid-editor-provider" )

exports.activate = function ( context ) {
	context.subscriptions.push( YamlGridEditorProvider.register( context ) )
}
