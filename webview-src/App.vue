<template>
  <cell :element="yamlData" :expanded="true" />
</template>

<script>
export default {
  // name: 'App',
  data() {
    return {
      yamlData: {},
    }
  },
  created() {
    this.$options.vscode = window.acquireVsCodeApi();

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
