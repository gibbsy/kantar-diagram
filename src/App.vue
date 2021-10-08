<template>
  <div>
    <div class="body">
      <main class="content">
        <app-body />
      </main>
    </div>
  </div>
</template>

<script>
import AppBody from "./components/AppBody.vue";

export default {
  name: "App",
  components: { AppBody },
};
</script>
