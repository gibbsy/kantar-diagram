<template>
  <div class="k-dia-container">
    <app-body v-if="loading == false" />
    <div v-if="error !== null">
      <p>Sorry, something went wrong.</p>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import AppBody from "./components/AppBody.vue";
import sanity from "./client.js";

const query = `
{
  "appData": *[_type=="diagram" && version=="en"][0]{
  title, fontSize,
  mainArcs[]->, centreLinkTop->, centreLinkBottom->, 
  blackRing->, outerLinkLeft->, outerLinkRight->, bottomBtns[]->
}, 
"pages": *[_type=="page" && version == "en"]
}
`;

export default {
  name: "App",
  components: { AppBody },
  data() {
    return {
      loading: true,
      error: null,
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      sanity.fetch(query).then(
        (diagram) => {
          console.log(diagram);
          this.$store.commit("saveAppData", diagram.appData);
          this.$store.commit("savePages", diagram.pages);
          this.loading = false;
        },
        (error) => {
          this.error = error;
        }
      );
    },
  },
};
</script>
<style lang="scss">
@import "./node_modules/normalize.css/normalize";
@import "./style/vars.scss";
@import "./style/_mixins-utils.scss";
@import "./style/reset.scss";
@import "./style/transitions.scss";

.k-dia-container {
  font-family: "KantarBrown", sans-serif;
  font-weight: 400;
  font-style: normal;
  color: #000;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  @include bp(1920) {
    font-size: 112.5%;
  }
  @include bp(2500) {
    font-size: 125%;
  }
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hgroup,
  ul,
  ol,
  dd,
  p,
  figure,
  pre,
  table,
  fieldset,
  hr {
    // margin: 0;
    margin-bottom: 1.5rem;
  }
  h1 {
    font-family: "KantarBrown";
    font-weight: 100;
  }
  .k-dia-heading-thin {
    font-weight: 200;
    font-size: 2.4rem;
    line-height: 1.25;
  }

  p,
  a,
  li {
    font-size: 1.125rem;
  }
  button {
    border: none;
    outline: none;
    cursor: pointer;
  }
  button.k-dia-btn-primary {
    position: relative;
    font-size: 1.125rem;
    border: none;
    outline: none;
    background: $darkGrey;
    color: #fff;
    padding: 1.125rem 2rem;
    cursor: pointer;
    overflow: hidden;
    &:before {
      content: "";
      position: absolute;
      width: 0.5rem;
      height: 100%;
      left: 0;
      top: 0;
      background: $goldGrad;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    &:hover:before {
      transform: translateX(0);
    }
  }
  .k-dia-app-view {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
