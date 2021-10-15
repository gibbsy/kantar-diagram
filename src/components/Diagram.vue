<template>
  <div id="k-diagram" class="k-dia-canvas-container" />
</template>
<script>
import AppGfx from "../graphics/AppGfx.js";
export default {
  data() {
    return {
      diagram: undefined,
    };
  },
  computed: {
    appData() {
      return this.$store.state.appData;
    },
  },
  mounted() {
    this.initDiagram();
  },
  methods: {
    initDiagram() {
      const el = document.getElementById("k-diagram");
      this.diagram = new AppGfx(el, this.appData);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../style/vars.scss";
@import "../style/_mixins-utils.scss";

.k-dia-canvas-container {
  position: relative;
  display: inline-block;
  width: 96vw;
  height: 96vw;
  @include bp(768) {
    width: 85vw;
    height: 85vw;
  }
  @include bp(1024) {
    width: 60vw;
    height: 60vw;
  }
  @include bp(1200) {
    width: 50vw;
    height: 50vw;
  }
  @include bp(1800) {
    width: 40vw;
    height: 40vw;
  }
  canvas {
    width: 100%;
  }
}
</style>
