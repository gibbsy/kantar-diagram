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
  mainArcs[]->{label, _id}, centreLinkTop->{label, _id}, centreLinkBottom->{label, _id}, 
  blackRing->{label, _id}, outerLinkLeft->{label, _id}, outerLinkRight->{label, _id}, bottomBtns[]->{label, _id}
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
          diagram.appData.title = diagram.appData.title.replace("\\n", "\n");
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
    margin: 0;
    margin-bottom: 1.5rem;
  }
  h1 {
    font-weight: 100;
    font-size: 2.4rem;
  }
  h2 {
    font-weight: 600;
    font-size: 1.5rem;
    @include bp(1400) {
      font-size: 2rem;
    }
    @include bp(1800) {
      font-size: 2.5rem;
    }
  }
  .k-dia-heading-thin {
    font-weight: 200;
    font-size: 1.5rem;
    line-height: 1.25;
    @include bp(1400) {
      font-size: 2rem;
    }
    @include bp(1800) {
      font-size: 2.5rem;
    }
  }
  p,
  a,
  li,
  button {
    font-size: 0.75rem;
    @include bp(500) {
      font-size: 0.875rem;
    }
    @include bp(768) {
      font-size: 1rem;
    }
    @include bp(1400) {
      font-size: 1.125rem;
    }
    @include bp(1800) {
      font-size: 1.25rem;
    }
  }
  button {
    border: none;
    outline: none;
    cursor: pointer;
  }
  button.k-dia-btn-primary {
    position: relative;
    border: none;
    outline: none;
    background: $darkGrey;
    color: #fff;
    padding: 0.875rem 1rem;
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
    @include bp(768) {
      padding: 1.125rem 2rem;
    }
  }
  .k-dia-app-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 1280px;
  }
}
</style>
