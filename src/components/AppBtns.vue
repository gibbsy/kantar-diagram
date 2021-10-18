<template>
  <div class="k-dia-app-nav">
    <button
      v-for="(btn, i) in navBtns"
      :key="i"
      :class="['k-dia-btn-primary', { active: diagramOn }]"
      @click.prevent="btnHandler(btn._id)"
    >
      {{ btn.label }}
    </button>
  </div>
</template>
<script>
import bus from "../graphics/eventBus.js";
export default {
  props: {
    navBtns: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      diagramOn: false,
    };
  },
  created() {
    bus.on("DIAGRAM_ANI_DONE", () => {
      console.log("ani done");
      this.diagramOn = true;
    });
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

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

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
  .k-dia-btn-primary {
    opacity: 0;
    &.active {
      animation: fadein 1s ease forwards;
      @include stagger-children(animation, 4, 0, 0.1);
    }
  }
}
</style>
