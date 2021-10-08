<template>
  <div id="k-diagram" />
</template>
<script>
import AppGfx from "../graphics/AppGfx.js";
export default {
  data() {
    return {
      diagram: undefined,
    };
  },
  mounted() {
    this.initDiagram();
  },
  methods: {
    initDiagram() {
      const el = document.getElementById("k-diagram");
      this.diagram = new AppGfx(el);
    },
  },
};
</script>
<style lang="scss" scoped>
#k-diagram {
  position: relative;
  display: block;
  background: #ccc;
  width: 40vw;
  height: 40vw;
  canvas {
    width: 100%;
  }
}
</style>
