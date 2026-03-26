<template>
  <div>
    <resizable-table
      v-if="displayMode === 'table'"
      :headers="tableHeaders"
      tblClass="array expanded"
      trClass = "array-hdr"
      :storage-key="storageKey"
    >
      <template #header="{ hdr }">
        <span v-if="hdr.id !== '__index__'">{{ hdr.header }}</span>
      </template>
      <template #body>
        <array-row
          v-for="(item, index) in array"
          :key="index"
          :element="item"
          :index="index"
          :columns="headers"
          :path="itemPath( index )"
        />
      </template>
    </resizable-table>

    <resizable-table
      v-else
      :headers="listHeaders"
      tblClass="array expanded"
      trClass="array-hdr"
      :storage-key="`${storageKey}:list`"
    >
      <template #header="{ hdr }">
        <span>{{ hdr.header }}</span>
      </template>
      <template #body>
        <tr v-for="(item, index) in array" :key="index" class="array-el list-mode">
          <td class="index">{{ index }}</td>
          <td class="value"><cell :element="item" :path="itemPath( index )" /></td>
        </tr>
      </template>
    </resizable-table>
  </div>
</template>

<script>
export default {
  inject: [ 'gridUi' ],
  props: [
    'array',
    'path'
  ],
  computed: {
    headers() {
      const hdrCells = this.array.reduce( ( hdrs, el ) => {
        if ( el && typeof el === 'object' && !Array.isArray( el ) ) {
          return [...new Set([...hdrs, ...Object.keys( el )])]
        }
        return hdrs
      }, [] )
        .map( header => {
          return { id: header, header, resize: true, thClass: "array member" }
        })
      return hdrCells
    },
    canToggleMode() {
      return this.headers.length > 0
    },
    displayMode() {
      return this.gridUi.getDisplayMode( this.path, 'table' )
    },
    tableHeaders() {
      return [ { id: '__index__', header: 'index', resize: false, thClass: 'index' }, ...this.headers ]
    },
    listHeaders() {
      return [
        { id: '__index__', header: 'index', resize: false, thClass: 'index' },
        { id: '__value__', header: 'value', resize: true, thClass: 'array member' }
      ]
    },
    storageKey() {
      return `array:${JSON.stringify( this.path )}`
    }
  },
  methods: {
    itemPath(index) {
      return [ ...this.path, index ]
    }
  }
}
</script>
