import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

const cdn = () => Math.floor(Math.random() * 11) + 51;

const headers = {
  accept: "*/*",
  origin: "https://ytshorts.savetube.me",
  referer: "https://ytshorts.savetube.me/",
  "user-agent": "Postify/1.0.0",
};

const audioQualities = { 1: "32", 2: "64", 3: "128", 4: "192" };
const videoQualities = {
  1: "144",
  2: "240",
  3: "360",
  4: "480",
  5: "720",
  6: "1080",
  7: "1440",
  8: "2160",
};

const fetch = async (url) => {
  const link = url.replace("{cdn}", cdn());
  const { data } = await axios.get(link, {
    headers: { ...headers, authority: `cdn${cdn()}.savetube.su` },
  });
  return data;
};

const savetube = {
  info: async (url, type, qualityKey) => {
    const inpo = await fetch(
      `https://cdn{cdn}.savetube.su/info?url=${encodeURIComponent(url)}`
    );
    const {
      key,
      duration,
      durationLabel,
      fromCache,
      id,
      thumbnail,
      title,
      titleSlug,
      url: videoUrl,
      thumbnail_formats,
    } = inpo.data;

    const quality =
      type === "audio" ? audioQualities[qualityKey] : videoQualities[qualityKey];
    if (!quality) throw new Error("❌ Invalid quality option!");

    const dlRes = await savetube.dl(key, type, quality);

    return {
      status: true,
      creator: "Chamod Nimsara",
      title,
      id,
      videoUrl,
      thumbnail,
      duration,
      durationLabel,
      quality,
      type,
      download: dlRes.data.downloadUrl,
    };
  },

  dl: async (key, type, quality) => {
    const api = `https://cdn${cdn()}.savetube.su/download/${type}/${quality}/${key}`;
    const { data } = await axios.get(api, { headers });
    return data;
  },
};

app.get("/", (req, res) => {
  res.send({
    status: true,
    creator: "Chamod Nimsara",
    message: "White Shadow SaveTube API is Live 🚀",
  });
});

app.get("/api/savetube/info", async (req, res) => {
  const { url, type = "video", quality = 5 } = req.query;
  if (!url)
    return res.status(400).send({ status: false, error: "Missing ?url=" });
  try {
    const result = await savetube.info(url, type, quality);
    res.send(result);
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
});

app.get("/api/savetube/download", async (req, res) => {
  const { key, type = "video", quality = 5 } = req.query;
  if (!key)
    return res.status(400).send({ status: false, error: "Missing ?key=" });
  try {
    const result = await savetube.dl(key, type, quality);
    res.send(result);
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;
