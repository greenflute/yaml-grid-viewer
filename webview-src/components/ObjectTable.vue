<template>
  <resizable-table
    :headers="headers"
    tblClass="object expanded"
    trClass="object-hdr"
    :storage-key="storageKey"
  >
    <template #body>
      <tr v-for="(val, key) in member" class="object member" :key="key">
        <th class="object key">
          <span class="key-inline hover-edit-anchor hover-edit-right" :class="{ editing: editingKey === key }">
            <span v-if="editingKey !== key">{{ key }}</span>
            <span v-else class="inline-editor">
              <input v-model="keyDraft" class="yaml-input key-input" @keyup.enter="saveRename( key )" />
              <button class="cell-action" @click="saveRename( key )">save</button>
              <button class="cell-action subtle-action" @click="cancelRename">cancel</button>
            </span>
            <button
              v-if="editingKey !== key"
              class="icon-button hover-edit-button"
              @click="startRename( key )"
              title="Rename property"
            >
              <svg viewBox="0 0 16 16" class="icon" aria-hidden="true">
                <path d="m11.8 1.8 2.4 2.4-8.1 8.1-3.3.9.9-3.3 8.1-8.1ZM10.7 2.9 4.6 9l-.4 1.4 1.4-.4 6.1-6.1-1-1Z" />
              </svg>
            </button>
          </span>
        </th>
        <td class="object element"><cell :element="val" :path="childPath( key )" /></td>
      </tr>
    </template>
  </resizable-table>
</template>

<script>
import ResizableTable from './ResizableTable.vue'
export default {
  inject: [ 'gridUi' ],
  components: { ResizableTable },
  // name: 'ObjectTable',
  props: [
    'member',
    'path'
  ],
  data() {
    return {
      headers: [
        { id: 'key', header: 'key', thClass: 'object key', defaultWidth: '10rem', minWidth: '6rem' },
        { id: 'val', header: 'val', thClass: 'object value' }
      ],
      editingKey: null,
      keyDraft: ''
    }
  },
  computed: {
    storageKey() {
      return `object:${JSON.stringify( this.path )}`
    }
  },
  methods: {
    childPath(key) {
      return [ ...this.path, key ]
    },
    startRename(key) {
      this.editingKey = key
      this.keyDraft = key
    },
    cancelRename() {
      this.editingKey = null
      this.keyDraft = ''
    },
    saveRename(key) {
      this.gridUi.renameKey( this.childPath( key ), this.keyDraft )
      this.cancelRename()
    }
  }
}
</script>
