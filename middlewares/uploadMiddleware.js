const fs = require("node:fs");
const path = require("node:path");
const { Readable } = require("node:stream");
const multer = require("multer");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../config/appError");

const filesHandler = () => {
  const multerStorge = multer.memoryStorage();
  const multerFilter = function (req, file, cb) {
    if (
      file.mimetype.startsWith("image") ||
      file.mimetype.startsWith("video")
    ) {
      cb(null, true);
    } else {
      cb(new AppError("Only Images and videos allowed", 400), false);
    }
  };
  const upload = multer({ storage: multerStorge, fileFilter: multerFilter });
  return upload;
};

exports.resizeImage = async (req, res, next, name) => {
  const filename = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .toFile(`uploads/${name}/${filename}`);
    req.body.image = filename;
  }
  next();
};

exports.resizeMultiData = async (req, res, next, name) => {
  if (req.files.imageCover) {
    const fileName = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(700, 700)
      .toFormat("jpeg")
      .toFile(`uploads/${name}/${fileName}`);
    req.body.imageCover = fileName;
  }
  if (req.files.images) {
    const data = await Promise.all(
      req.files.images.map(async (e) => {
        const fileName = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(e.buffer)
          .resize(700, 700)
          .toFormat("jpeg")
          .toFile(`uploads/${name}/${fileName}`);
        return fileName;
      })
    );
    req.body.images = data;
  }
  if (req.files.videos) {
    ffmpeg.setFfmpegPath(path.join(__dirname, "ffmpeg", "ffmpeg.exe"));
    ffmpeg.setFfprobePath(path.join(__dirname, "ffmpeg", "ffprobe.exe"));
    const data = await Promise.all(
      req.files.videos.map(async (e) => {
        const outputPath = path.join(
          __dirname,
          "..",
          "uploads",
          name,
          e.originalname
        );
        const inputBufferStream = new Readable();
        inputBufferStream.push(e.buffer);
        inputBufferStream.push(null);
        ffmpeg(inputBufferStream)
          .size("854x480")
          .output(outputPath)
          .on("error", (err) => {
            throw new AppError(err, 404);
          })
          .run();
        return e.originalname;
      })
    );
    req.body.videos = data;
  }
  if (req.files.video) {
    ffmpeg.setFfmpegPath(path.join(__dirname, "ffmpeg", "ffmpeg.exe"));
    ffmpeg.setFfprobePath(path.join(__dirname, "ffmpeg", "ffprobe.exe"));
    const video = req.files.video[0];
    const outputPath = path.join(
      __dirname,
      "..",
      "uploads",
      name,
      video.originalname
    );
    const inputBufferStream = new Readable();
    inputBufferStream.push(video.buffer);
    inputBufferStream.push(null);
    ffmpeg(inputBufferStream)
      .size("854x480")
      .output(outputPath)
      .on("error", (err) => {
        throw new AppError(err, 404);
      })
      .run();
    req.body.video = video.originalname;
  }
  next();
};

exports.uploadsModelOptions = (options, file) => {
  const setUrl = (doc) => {
    if (doc.image && !doc.image.startsWith(`${process.env.BASE_URL}`)) {
      const imgUrl = `${process.env.BASE_URL}/${file}/${doc.image}`;
      doc.image = imgUrl;
    }
    if (
      doc.imageCover &&
      !doc.imageCover.startsWith(`${process.env.BASE_URL}`)
    ) {
      const imgUrl = `${process.env.BASE_URL}/${file}/${doc.imageCover}`;
      doc.imageCover = imgUrl;
    }
    if (doc.videos) {
      const data = doc.videos.map((e) => {
        if (!e.startsWith(`${process.env.BASE_URL}`)) {
          e = `${process.env.BASE_URL}/${file}/${e}`;
        }
        return e;
      });
      doc.videos = data;
    }
  };
  const removeData = (doc) => {
    if (
      doc.image &&
      doc.image !== `${process.env.BASE_URL}/user/default.jpeg`
    ) {
      const image = doc.image.replace(`${process.env.BASE_URL}/`, "");
      fs.unlinkSync(`uploads/${image}`);
    }
    if (doc.imageCover) {
      const image = doc.imageCover.replace(`${process.env.BASE_URL}/`, "");
      fs.unlinkSync(`uploads/${image}`);
    }
    if (doc.videos) {
      doc.videos.forEach((e) => {
        const image = e.replace(`${process.env.BASE_URL}/`, "");
        fs.unlinkSync(`uploads/${image}`);
      });
    }
  };
  options.post("init", (doc) => {
    setUrl(doc);
  });
  options.post("save", (doc) => {
    setUrl(doc);
  });
  options.post("findOneAndDelete", (doc) => {
    removeData(doc);
  });
};

exports.singleImageHandler = (filename) => filesHandler().single(filename);

exports.multiDataHandler = (fialdsArray) => filesHandler().fields(fialdsArray);
