<template>
  <div class="k-dia-app-nav">
    <button
      v-for="(btn, i) in navBtns"
      :key="i"
      class="k-dia-btn-primary"
      @click.prevent="btnHandler(btn._id)"
    >
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
  methods: {
    btnHandler(id) {
      this.$store.commit("selectSection", id);
      this.$nextTick(() => {
        this.$store.commit("toggleModal", true);
      });
    },
  },
};
</script>
<style lang="scss">
@import "../style/vars.scss";
@import "../style/_mixins-utils.scss";

.k-dia-app-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  @include bp(768) {
    gap: 1rem;
  }
  @include bp(1200) {
    gap: 2rem;
  }
  @include bp(1400) {
    gap: 3rem;
  }
}
</style>
