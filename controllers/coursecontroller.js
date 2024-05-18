const fs = require("fs");
const path = require("path");
const expressAsyncHandler = require("express-async-handler");
const {
  multiDataHandler,
  resizeMultiData,
} = require("../middlewares/uploadMiddleware");
const course = require("../models/courseModel");
const MainController = require("./mainController");
const AppError = require("../config/appError");

exports.setUserId = (req,res,next)=>{
  req.body.instructor = req.user._id
  next()
}

exports.postcourse = MainController.postOne(course);

exports.getcourses = MainController.getAll(course);

exports.updatecourse = expressAsyncHandler(async (req, res, next) => {
  const data = await course.findOne({ _id: req.params.id });
  if (!data) {
    next(new AppError("id is not valid", 404));
  }
  if(data.instructor.toString() !== req.user._id.toString()){
    next(new AppError("you are not allowed to update this course", 404));
  }
  if (req.body.imageCover) {
    const image = data.imageCover.replace(`${process.env.BASE_URL}/`, "");
    fs.unlinkSync(`uploads/${image}`);
  }
  if (req.body.videos) {
    const newVideos = req.body.videos;
    const oldVideos = data.videos.map((video) =>
      video.replace(`${process.env.BASE_URL}/course/`, "")
    );

    const videosToRemove = oldVideos.filter(
      (video) => !newVideos.includes(video)
    );

    videosToRemove.forEach((video) => {
      fs.unlinkSync(`uploads/course/${video}`);
    });
  }
  const entries = Object.entries(req.body);
  entries.forEach(([key, value]) => {
    data[key] = req.body[key];
  });
  data.save();
  res.status(200).json({ status: "success", data });
});

exports.updateVideoName = expressAsyncHandler(async (req, res, next) => {
  const { oldVideoName, newVideoName } = req.body;

  const courseData = await course.findById(req.params.id);
  if (!courseData) {
    return next(new AppError("Course not found", 404));
  }
  if(courseData.instructor.toString() !== req.user._id.toString()){
    next(new AppError("you are not allowed to update this course", 404));
  }
  const videoIndex = courseData.videos.indexOf(
    `${process.env.BASE_URL}/course/${oldVideoName}`
  );
  if (videoIndex === -1) {
    return next(new AppError("Video not found in course", 404));
  }

  const oldFilePath = path.join(
    "uploads/course",
    oldVideoName.replace(`${process.env.BASE_URL}/`, "")
  );
  const newFilePath = path.join(
    "uploads/course",
    newVideoName.replace(`${process.env.BASE_URL}/`, "")
  );

  fs.rename(oldFilePath, newFilePath, (err) => {
    if (err) {
      return next(new AppError("Error renaming video file", 500));
    }
  });
  courseData.videos[videoIndex] = newVideoName;

  await courseData.save();

  res.status(200).json({ status: "success", data: courseData });
});

exports.removeVideo = expressAsyncHandler(async (req, res, next) => {
  const courseData = await course.findById(req.params.id);
  if (!courseData) {
    return next(new AppError("Course not found", 404));
  }

  const videoIndex = courseData.videos.indexOf(
    `${process.env.BASE_URL}/course/${req.body.videoName}`
  );
  if (videoIndex === -1) {
    return next(new AppError("Video not found in course", 404));
  }

  courseData.videos.splice(videoIndex, 1);

  fs.unlinkSync(`uploads/course/${req.body.videoName}`);

  await courseData.save();

  res.status(200).json({ status: "success", data: courseData });
});

exports.postVideo = expressAsyncHandler(async (req, res, next) => {
  const courseData = await course.findOneAndUpdate(
    { _id: req.params.id },
    { $addToSet: { videos: req.body.video } },
    { new: true }
  );

  if (!courseData) {
    return next(new AppError("Course not found", 404));
  }

  res.status(200).json({ status: "success", data: courseData });
});

exports.getcourse = MainController.getOne(course);
exports.deletecourse = MainController.deleteOne(course);
exports.courseDataHandler = multiDataHandler([
  { name: "imageCover", maxCount: 1 },
  { name: "videos", maxCount: 50 },
  { name: "video", maxCount: 1 },
]);
exports.resizecourseFiles = expressAsyncHandler((req, res, next) =>
  resizeMultiData(req, res, next, "course")
);
