<template>
  <template v-if="Array.isArray( element )">
    <span class="array collapsed">
      <span class="array badge">Array[{{ element.length }}]</span>
      <button class="icon-button toggle-button" @click="toggleExpanded" :title="expanded ? 'Collapse' : 'Expand'">
        <svg viewBox="0 0 16 16" class="icon toggle-icon" aria-hidden="true">
          <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
          <path d="M5 8h6" />
          <path v-if="!expanded" d="M8 5v6" />
        </svg>
      </button>
      <button
        v-if="canToggleArrayMode"
        class="icon-button toggle-button"
        :title="arrayDisplayMode === 'table' ? 'Switch to list mode' : 'Switch to table mode'"
        @click="toggleArrayMode"
      >
        <svg v-if="arrayDisplayMode === 'table'" viewBox="0 0 16 16" class="icon" aria-hidden="true">
          <rect x="2.5" y="3" width="11" height="10" rx="1.2" />
          <path d="M2.5 6.5h11" />
          <path d="M2.5 10h11" />
          <path d="M6 3v10" />
          <path d="M10 3v10" />
        </svg>
        <svg v-else viewBox="0 0 16 16" class="icon" aria-hidden="true">
          <rect x="2.5" y="3" width="11" height="2.2" rx="1" />
          <rect x="2.5" y="6.9" width="11" height="2.2" rx="1" />
          <rect x="2.5" y="10.8" width="11" height="2.2" rx="1" />
        </svg>
      </button>
    </span>
    <array-table v-if="expanded" :array="element" :path="path" />
  </template>
  <template v-else-if="typeof element === 'object' && element != null">
    <span class="object collapsed">
      <span class="object badge">Object[{{ Object.keys( element ).length}}]</span>
      <button class="icon-button toggle-button" @click="toggleExpanded" :title="expanded ? 'Collapse' : 'Expand'">
        <svg viewBox="0 0 16 16" class="icon toggle-icon" aria-hidden="true">
          <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
          <path d="M5 8h6" />
          <path v-if="!expanded" d="M8 5v6" />
        </svg>
      </button>
    </span>
    <object-table v-if="expanded" :member="element" :path="path" />
  </template>
  <span v-else class="value-inline hover-edit-anchor hover-edit-right" :class="{ editing }">
    <span v-if="!editing" :class="['value', (element === null ? 'null' : typeof element)]">{{ displayValue }}</span>
    <span v-else class="inline-editor" :class="{ multiline: useTextarea }">
      <span v-if="useTextarea" class="textarea-overlay">
        <pre ref="previewLayer" class="yaml-textarea-preview" aria-hidden="true"><span v-for="(line, index) in previewLines" :key="`${index}:${line.text}`" class="preview-line">{{ line.text || '\u200b' }}<span v-if="line.hasBreak" class="hard-break-marker">↵</span></span></pre>
        <textarea
          ref="editorInput"
          v-model="draft"
          class="yaml-textarea yaml-textarea-overlay"
          @input="syncTextareaSize"
          @scroll="syncTextareaScroll"
          @keydown.meta.enter.prevent="saveEdit"
          @keydown.ctrl.enter.prevent="saveEdit"
        />
      </span>
      <input
        v-else
        ref="editorInput"
        v-model="draft"
        class="yaml-input"
        @keyup.enter="saveEdit"
      />
      <span class="editor-actions" :class="{ multiline: useTextarea }">
        <button class="cell-action" @click="saveEdit">save</button>
        <button class="cell-action subtle-action" @click="toggleEdit">cancel</button>
      </span>
    </span>
    <button
      v-if="!editing"
      class="icon-button hover-edit-button"
      @click="toggleEdit"
      title="Edit value"
    >
      <svg viewBox="0 0 16 16" class="icon" aria-hidden="true">
        <path d="m11.8 1.8 2.4 2.4-8.1 8.1-3.3.9.9-3.3 8.1-8.1ZM10.7 2.9 4.6 9l-.4 1.4 1.4-.4 6.1-6.1-1-1Z" />
      </svg>
    </button>
  </span>
</template>

<script>
export default {
  inject: [ 'gridUi' ],
  props: [
    'element',
    'path'
  ],
  data() {
    return {
      editing: false,
      draft: ''
    }
  },
  computed: {
    expanded() {
      return this.gridUi.isExpanded(this.path, this.isRoot)
    },
    isRoot() {
      return this.path.length === 0
    },
    displayValue() {
      return this.element === null ? 'null' : String(this.element)
    },
    useTextarea() {
      return typeof this.element === 'string' && this.element.includes('\n')
    },
    previewLines() {
      return this.draft.split('\n').map( ( text, index, lines ) => ({
        text,
        hasBreak: index < lines.length - 1
      }) )
    },
    canToggleArrayMode() {
      if ( !Array.isArray( this.element ) ) {
        return false
      }

      return this.element.some( item => item && typeof item === 'object' && !Array.isArray( item ) )
    },
    arrayDisplayMode() {
      return this.gridUi.getDisplayMode( this.path, 'table' )
    }
  },
  methods: {
    toggleExpanded() {
      this.gridUi.setExpanded(this.path, !this.expanded)
    },
    toggleArrayMode() {
      this.gridUi.setDisplayMode( this.path, this.arrayDisplayMode === 'table' ? 'list' : 'table' )
    },
    toggleEdit() {
      this.editing = !this.editing
      this.draft = this.editing ? this.serializeForEdit(this.element) : ''
      if ( this.editing ) {
        this.$nextTick( () => {
          this.$refs.editorInput?.focus()
          this.syncTextareaSize()
          this.syncTextareaScroll()
        } )
      }
    },
    saveEdit() {
      this.gridUi.updateValue(this.path, this.valueForSave())
      this.editing = false
    },
    serializeForEdit(value) {
      if (typeof value === 'string') {
        return value
      }

      if (value === undefined) {
        return ''
      }

      return String(value)
    },
    valueForSave() {
      if ( typeof this.element === 'string' ) {
        return JSON.stringify( this.draft )
      }

      return this.draft
    },
    syncTextareaScroll() {
      if ( !this.useTextarea ) {
        return
      }

      const input = this.$refs.editorInput
      const preview = this.$refs.previewLayer
      if ( input && preview ) {
        preview.scrollTop = input.scrollTop
        preview.scrollLeft = input.scrollLeft
      }
    },
    syncTextareaSize() {
      if ( !this.useTextarea ) {
        return
      }

      const input = this.$refs.editorInput
      if ( !input ) {
        return
      }

      input.style.height = 'auto'
      input.style.height = `${Math.max( input.scrollHeight, 96 )}px`
    }
  }
}
</script>
