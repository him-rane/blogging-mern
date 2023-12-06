import axios from "axios";
export const uploadImage = async (img) => {
  let imgUrl = null;

  await axios
    .get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")
    .then(async ({ data: { uploadURL } }) => {
      //console.log("------------->" + data.uploadURL);
      await axios({
        method: "PUT",
        url: uploadURL,
        data: img,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then(() => {
        imgUrl = uploadURL?.split("?")[0];
      });
    });

  return imgUrl;
};
