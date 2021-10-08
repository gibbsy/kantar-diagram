<template>
  <div class="k-app-nav">
    <button v-for="(btn, i) in navBtns" :key="i" @click.prevent="onClick">{{ btn.label }}</button>
  </div>
</template>
<script>
export default {
  props: {
    navBtns: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
