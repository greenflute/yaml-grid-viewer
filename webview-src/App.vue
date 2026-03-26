<template>
  <cell :element="yamlData" :path="[]" />
</template>

<script>
export default {
  provide() {
    return {
      gridUi: {
        isExpanded: (path, defaultValue) => this.isExpanded(path, defaultValue),
        setExpanded: (path, value) => this.setExpanded(path, value),
        getDisplayMode: (path, fallback) => this.getDisplayMode(path, fallback),
        setDisplayMode: (path, value) => this.setDisplayMode(path, value),
        getColumnWidth: (key, headerId) => this.getColumnWidth(key, headerId),
        setColumnWidth: (key, headerId, value) => this.setColumnWidth(key, headerId, value),
        updateValue: (path, value) => this.updateValue(path, value),
        renameKey: (path, nextKey) => this.renameKey(path, nextKey)
      }
    }
  },
  data() {
    return {
      yamlData: {},
      uiState: {
        expandedPaths: { '[]': true },
        displayModes: {},
        columnWidths: {}
      }
    }
  },
  methods: {
    pathKey(path) {
      return JSON.stringify(path)
    },
    persistUiState() {
      this.$options.vscode.setState(this.uiState)
    },
    isExpanded(path, defaultValue = false) {
      const key = this.pathKey(path)
      return key in this.uiState.expandedPaths ? this.uiState.expandedPaths[key] : defaultValue
    },
    setExpanded(path, value) {
      this.uiState.expandedPaths[this.pathKey(path)] = value
      this.persistUiState()
    },
    getDisplayMode(path, fallback = 'table') {
      const key = this.pathKey(path)
      return this.uiState.displayModes[key] || fallback
    },
    setDisplayMode(path, value) {
      this.uiState.displayModes[this.pathKey(path)] = value
      this.persistUiState()
    },
    getColumnWidth(key, headerId) {
      return this.uiState.columnWidths[key]?.[headerId] || null
    },
    setColumnWidth(key, headerId, value) {
      if (!this.uiState.columnWidths[key]) {
        this.uiState.columnWidths[key] = {}
      }

      if (value === null) {
        delete this.uiState.columnWidths[key][headerId]
      } else {
        this.uiState.columnWidths[key][headerId] = value
      }

      this.persistUiState()
    },
    updateValue(path, value) {
      this.$options.vscode.postMessage({
        type: 'edit',
        path,
        value
      })
    },
    renameKey(path, nextKey) {
      this.$options.vscode.postMessage({
        type: 'rename-key',
        path,
        nextKey
      })
    }
  },
  created() {
    this.$options.vscode = window.acquireVsCodeApi()
    this.uiState = {
      ...this.uiState,
      ...(this.$options.vscode.getState() || {})
    }

    window.addEventListener('message', event => {
      switch (event.data.type) {
        case 'update':
          this.yamlData = event.data.doc
          break;
      }
    })

    this.$options.vscode.postMessage({
      type: 'ready'
    })
  }
}
</script>
