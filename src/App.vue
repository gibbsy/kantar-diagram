<template>
  <div :class="['k-dia-container', { standalone: isStandalone }, lang.toString()]">
    <header v-if="isStandalone" id="k-demo-page-header">
      <div class="k-dia-demo-logo">
        <svg viewBox="0 0 149 28" role="img">
          <use xlink:href="static/assets/sprite.svg#kantar-logo" />
        </svg>
      </div>
    </header>
    <app-body v-if="loading == false" />
    <div v-if="error !== null">
      <p>Sorry, we couldn't load the data.</p>
    </div>
    <footer v-if="isStandalone">
      <p id="k-dia-copyright">© Kantar Group and Affiliates 2021</p>
    </footer>
  </div>
</template>

<script>
import AppBody from "./components/AppBody.vue";
import sanity from "./client.js";
import config from "./config.js";

const query = `
{
  "appData": *[_type=="diagram" && version=="${config.lang}"][0]{
  title, fontSize,
  mainArcs[]->{label, _id}, centreLinkTop->{label, _id}, centreLinkBottom->{label, _id}, 
  blackRing->{label, _id}, outerLinkLeft->{label, _id}, outerLinkRight->{label, _id}, bottomBtns[]->{label, _id}
}, 
"pages": *[_type=="page" && version == "${config.lang}"]
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
  computed: {
    isStandalone() {
      return this.$store.state.isStandalone;
    },
    lang() {
      return this.$store.state.lang;
    },
  },
  created() {
    this.fetchData();
    this.$store.commit("setStandalone", config.standalone);
    this.$store.commit("setLang", config.lang);
  },
  methods: {
    fetchData() {
      sanity.fetch(query).then(
        (diagram) => {
          diagram.appData.title = diagram.appData.title.replaceAll("\\n", "\n");
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
  font-weight: 200;
  font-style: normal;
  color: #000;
  font-size: 1.6rem;
  line-height: 1.5;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  @include bp(1080) {
    font-size: 1.8rem;
  }

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
    margin-bottom: 2rem;
    font-weight: inherit;
  }
  .k-dia-modal-main-title {
    font-size: 2rem;
    line-height: 1.25;
    @include bp(720) {
      font-size: 2.4rem;
    }
    @include bp(1080) {
      font-size: 3rem;
    }
  }
  .k-dia-heading-thin {
    font-size: 1.8rem;
    line-height: 1.25;
    font-weight: 100;
    @include bp(720) {
      font-size: 2.2rem;
      line-height: 3.2rem;
    }
    @include bp(1080) {
      font-size: 2.8rem;
      line-height: 4.2rem;
    }
  }
  p,
  a,
  li {
    font-size: 1.6rem;
    @include bp(1080) {
      font-size: 1.8rem;
    }
  }
  button {
    border: none;
    outline: none;
    cursor: pointer;
  }
  button.k-dia-btn-primary,
  a.k-dia-btn-primary {
    position: relative;
    display: inline-block;
    text-decoration: none;
    border: none;
    outline: none;
    background: $darkGrey;
    color: #fff;
    padding: 1.8rem 4rem;
    font-size: 1.6rem;
    cursor: pointer;
    overflow: hidden;
    font-weight: 400;
    margin: 1rem 0;
    width: 100%;
    @include bp(768) {
      width: auto;
    }
    &:before {
      content: "";
      position: absolute;
      width: 0.8rem;
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
    width: 100%;
    max-width: 1440px;
    padding: 0 2rem;
  }

  #k-demo-content {
    position: relative;
    width: 100%;
    padding-bottom: 10vh;
  }
  #k-demo-page-header {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 20px;
  }

  .k-dia-demo-logo {
    position: relative;
    width: 100px;
    padding-top: 20px;
    display: inline-block;
    /* margin-top: auto; */
  }

  footer {
    width: 100%;
    font-weight: 200;
    display: flex;
    margin-top: 1rem;
    justify-content: flex-end;
    padding: 0 20px;

    p {
      font-size: 1.4rem;
    }
    @include bp(768) {
      margin-top: 2rem;
      padding: 0 40px;
    }
    @include bp(1080) {
      margin-top: 3rem;
      padding: 0 60px;
    }
  }
  .k-dia-demo-logo svg {
    width: 100%;
    fill: #000;
  }

  @media screen and (min-width: 768px) {
    #k-demo-page-header {
      padding: 0 40px;
    }
    .k-dia-demo-logo {
      width: 120px;
      padding-top: 30px;
    }
  }
  @media screen and (min-width: 1080px) {
    #k-demo-page-header {
      padding: 0 60px;
    }
    .k-dia-demo-logo {
      width: 140px;
      padding-top: 30px;
    }
  }
}
</style>
