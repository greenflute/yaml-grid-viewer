<template>
  <table
    :class="[ tblClass, { 'table-resize-active': activeResizeColumn } ]"
    ref="arrayTable"
    @mousemove="handleTablePointerMove"
    @mouseleave="handleTablePointerLeave"
    @mousedown="handleTablePointerDown"
  >
    <thead v-if="headers.length > 0" :class="theadClass" >
      <tr :class="trClass">
        <th
          v-for="hdr in headers"
          :key="hdr.id"
          :class="hdr.thClass"
          :style="{ minWidth: minWidthFor( hdr ), width: widthFor( hdr ) }"
          :ref="setHeaderRef"
          :data-column-id="hdr.id"
        >
          <slot name="header" :hdr="hdr" />
          <div
            v-if="!(hdr.resize === false)"
            class="resizer"
            :style="{ height: tableHeight }"
            @mousedown.prevent="resizeCol( hdr.id, $event )"
            @dblclick="resetColSize( hdr.id )"
            ></div>
        </th>
      </tr>
    </thead>
    <tbody>
      <slot name="body" />
    </tbody>
  </table>
</template>

<script>
export default {
  inject: [ 'gridUi' ],
  props: [
    'headers',
    'tblClass',
    'theadClass',
    'trClass',
    'storageKey'
  ],
  data() {
    return {
      tableHeight: 0,
      headerRefs: {},
      hoveredResizeColumn: null,
      activeResizeColumn: null
    }
  },
  methods: {
    widthFor(header) {
      return this.gridUi.getColumnWidth( this.storageKey, header.id ) || header.defaultWidth || null
    },
    minWidthFor(header) {
      return header.minWidth || '80px'
    },
    setHeaderRef(element) {
      if (!element) {
        return
      }

      this.headerRefs[element.dataset.columnId] = element
    },
    setTableCursor(value) {
      if (this.$refs.arrayTable) {
        this.$refs.arrayTable.style.cursor = value || ''
      }
    },
    getResizableBoundary(event) {
      const table = this.$refs.arrayTable
      if (!table) {
        return null
      }

      const tableRect = table.getBoundingClientRect()
      if (
        event.clientY < tableRect.top ||
        event.clientY > tableRect.bottom ||
        event.clientX < tableRect.left ||
        event.clientX > tableRect.right
      ) {
        return null
      }

      const threshold = 8
      let closestColumn = null
      let closestDistance = threshold + 1

      this.headers.forEach( header => {
        if (header.resize === false) {
          return
        }

        const headerCell = this.headerRefs[header.id]
        if (!headerCell) {
          return
        }

        const distance = Math.abs(event.clientX - headerCell.getBoundingClientRect().right)
        if (distance <= threshold && distance < closestDistance) {
          closestColumn = header.id
          closestDistance = distance
        }
      } )

      return closestColumn
    },
    handleTablePointerMove(event) {
      if (this.activeResizeColumn) {
        return
      }

      this.hoveredResizeColumn = this.getResizableBoundary(event)
      this.setTableCursor(this.hoveredResizeColumn ? 'col-resize' : '')
    },
    handleTablePointerLeave() {
      if (this.activeResizeColumn) {
        return
      }

      this.hoveredResizeColumn = null
      this.setTableCursor('')
    },
    handleTablePointerDown(event) {
      const boundaryColumn = this.getResizableBoundary(event)
      if (!boundaryColumn) {
        return
      }

      event.preventDefault()
      this.resizeCol(boundaryColumn, event)
    },
    resizeCol( hdr, e ) {
      const headerCell = this.headerRefs[hdr]
      if (!headerCell) {
        return
      }

      const startX = e.clientX
      const colStartWidth = Math.round( headerCell.getBoundingClientRect().width )
      this.activeResizeColumn = hdr

      const setSize = e => {
        const movedX = e.clientX - startX
        const nextWidth = Math.max( 80, colStartWidth + movedX )
        this.gridUi.setColumnWidth( this.storageKey, hdr, `${nextWidth}px` )
      }

      document.addEventListener( 'mousemove', setSize )
      document.body.style.cursor = 'col-resize'
      this.setTableCursor('col-resize')

      const cleanup = () => {
        document.removeEventListener( 'mousemove', setSize )
        document.removeEventListener( 'mouseup', cleanup )
        document.body.style.cursor = ''
        this.activeResizeColumn = null
        this.hoveredResizeColumn = null
        this.setTableCursor('')
      }

      document.addEventListener( 'mouseup', cleanup )
    },
    resetColSize( hdr ) {
      this.gridUi.setColumnWidth( this.storageKey, hdr, null )
    }
  },
  mounted() {
    this.$options.tableHeightObserver = new ResizeObserver(
      entries => this.tableHeight = entries[0].contentRect.height + 'px'
    )

    this.$options.tableHeightObserver.observe( this.$refs.arrayTable )
  },
  unmounted() {
    this.$options.tableHeightObserver.disconnect()
  }
}
</script>

<style scoped>
.resizer {
  position: absolute;
  top: 0;
  right: 0;
  margin-right: -6px;
  width: 12px;
  cursor: col-resize;
  user-select: none;
  z-index: 999;
}

.table-resize-active,
.table-resize-active * {
  cursor: col-resize !important;
}

th {
  position: relative;
}
</style>
