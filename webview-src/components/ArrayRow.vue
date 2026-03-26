<template>
  <tr :class="[ 'array-el', typeOfEl ]">
    <td :class="[ 'index', typeOfEl ]">{{ index }}</td>
    <template v-if="typeOfEl == 'object'">
      <td v-for="{ header } in columns" :key="header" class="member">
        <cell :element="element[header]" :path="childPath( header )" />
      </td>
    </template>
    <td v-else class="value" :colspan="columns.length">
      <cell :element="element" :path="path" />
    </td>
  </tr>
</template>

<script>
export default {
  props: [
    'element',
    'index',
    'columns',
    'path'
  ],
  computed: {
    typeOfEl() {
      return Array.isArray( this.element ) ? 'array' :
        this.element === null ? 'null' :
        typeof this.element
    }
  },
  methods: {
    childPath(header) {
      return [ ...this.path, header ]
    }
  }
  
}
</script>
