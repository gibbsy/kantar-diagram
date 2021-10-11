<template>
  <div class="k-dia-app-nav">
    <button v-for="(btn, i) in navBtns" :key="i" class="k-dia-btn-primary" @click.prevent="onClick">
      {{ btn.label }}
    </button>
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
<style lang="scss">
.k-dia-app-nav {
  display: flex;
  gap: 3rem;
}
</style>
