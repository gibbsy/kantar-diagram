import sanityClient from "@sanity/client";

export default sanityClient({
  projectId: "k7sqtopt",
  dataset: "production",
  useCdn: true,
  apiVersion: "2021-03-25",
});
