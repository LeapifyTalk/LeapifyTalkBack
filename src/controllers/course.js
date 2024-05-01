const course = require("../models/course");
const mongoose = require("mongoose");
const paypal = require("paypal-rest-sdk");
const rating = require("../models/ratings");
const purchased = require("../models/purchased");
const ongoing = require("../models/ongoing");
const section = require("../models/sections");
const completed = require("../models/completed");
const upload = require("../utils/s3");
const jwt = require("jsonwebtoken");
const {
  pagination,
  paginationById,
  paginateCourses,
  paginateReviews,
} = require("../utils/pagination");

const user = require("../models/user");
const category1 = require("../models/category");
// const therapist = require("../models/therapists");
const therapist = require("../models/therapists");
const therapist1 = require("../models/therapists");

// ============New Course===============
exports.newCourse = async (req, res) => {
  // const photo = req.files.photo[0].location;
  const photo = req.files.photo[0].filename;
  // const video = req.files.video[0].location;
  const video = req.files.video[0].filename;
  // token from front-end
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const findToken = await user.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const instructor = decoded.payload.id;
  // res.json({ instructor });

  try {
    const {
      course_title,
      sub_heading,
      tags,
      category,
      description,
      what_youll_learn,
      offer_price,
      course_price,
    } = req.body;
    console.log(req.body);
    const tagArray = tags.split(",");
    const learnArray = what_youll_learn.split(".");
    const newCourse = await course.create({
      course_title,
      sub_heading,
      tags: tagArray,
      category,
      description,
      instructor,
      what_youll_learn: learnArray,
      photo,
      video,
      original_price: course_price,
      offer_price,
    });
    const editCategory = await category1
      .findOneAndUpdate(
        { name: category },
        { $push: { courses: newCourse._id } }
      )
      .exec();
    const editInstructor = await user
      .findByIdAndUpdate(instructor, {
        $push: { courses: newCourse._id },
      })
      .exec();
    res.json({
      status: "ok",
      msg: { newCourse, editCategory, editInstructor },
    });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "failed to add course" });
  }
};

//================= View Courses==============
exports.popCourses = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      const allSixCourses = await course
        .aggregate([
          {
            $project: {
              instructor: 1,
              category: 1,
              course_title: 1,
              video: 1,
              photo: 1,
              original_price: 1,
              offer_price: 1,
              tags: 1,
              language: 1,
              ratings: 1,
              last_updated: 1,
              sub_heading: 1,
              students: 1,
              what_youll_learn: 1,
              description: 1,
              student_count: { $size: "$students" },
            },
          },
          { $sort: { student_count: -1 } },
          {
            $lookup: {
              from: "ratings",
              localField: "ratings",
              as: "rates",
              foreignField: "_id",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "instructor",
              as: "instructorDetails",
              foreignField: "_id",
            },
          },
        ])
        .limit(6)
        .exec();
      let sixCourses = [];
      allSixCourses.forEach((course) => {
        let sum = 0;
        let toPush = {};
        let compCourse = course;
        course.rates.forEach((rate) => {
          sum += rate.rates;
          console.log(sum);
        });
        avgRate = sum / course.rates.length;
        compCourse.rates = avgRate;
        sixCourses.push(compCourse);
      });
      const topInstructors = await user
        .aggregate([
          {
            $project: {
              email: 1,
              name: 1,
              headline: 1,
              link: 1,
              about_instructor: 1,
              certification: 1,
              photo_url: 1,

              course_count: { $size: "$courses" },
              student_count: { $size: "$students" },
            },
          },
          { $sort: { course_count: -1 } },
        ])
        .limit(8)
        .exec();
      const allFeaturedCourse = await course
        .aggregate([
          // {
          //   $match: { category },
          // },
          {
            $project: {
              instructor: 1,
              category: 1,
              course_title: 1,
              video: 1,
              photo: 1,
              original_price: 1,
              offer_price: 1,
              tags: 1,
              language: 1,
              ratings: 1,
              last_updated: 1,
              sub_heading: 1,
              students: 1,
              what_youll_learn: 1,
              description: 1,
              student_count: { $size: "$students" },
            },
          },
          { $sort: { student_count: -1 } },
          {
            $lookup: {
              from: "ratings",
              localField: "ratings",
              as: "rates",
              foreignField: "_id",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "instructor",
              as: "instructorDetails",
              foreignField: "_id",
            },
          },
        ])
        .limit(1)
        .exec();
      let featuredCourse = [];
      allFeaturedCourse.forEach((course) => {
        let sum = 0;
        let toPush = {};
        let compCourse = course;
        course.rates.forEach((rate) => {
          sum += rate.rates;
          console.log(sum);
        });
        avgRate = sum / course.rates.length;
        compCourse.rates = avgRate;
        featuredCourse.push(compCourse);
      });
      // let featuredCourse = [];
      res.json({ sixCourses, topInstructors, featuredCourse });
    } else {
      const findCategory = await category1.findOne({ name: category }).exec();
      if (!findCategory) {
        res.json({ status: "error", msg: "Category doesnt exist" });
      } else {
        const allSixCourses = await course
          .aggregate([
            {
              $match: { category },
            },
            {
              $project: {
                instructor: 1,
                category: 1,
                course_title: 1,
                video: 1,
                photo: 1,
                original_price: 1,
                offer_price: 1,
                tags: 1,
                language: 1,
                ratings: 1,
                last_updated: 1,
                sub_heading: 1,
                students: 1,
                what_youll_learn: 1,
                description: 1,
                student_count: { $size: "$students" },
              },
            },
            { $sort: { student_count: -1 } },
            {
              $lookup: {
                from: "ratings",
                localField: "ratings",
                as: "rates",
                foreignField: "_id",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "instructor",
                as: "instructorDetails",
                foreignField: "_id",
              },
            },
          ])
          .limit(6)
          .exec();
        let sixCourses = [];
        allSixCourses.forEach((course) => {
          let sum = 0;
          let toPush = {};
          let compCourse = course;
          course.rates.forEach((rate) => {
            sum += rate.rates;
            console.log(sum);
          });
          avgRate = sum / course.rates.length;
          compCourse.rates = avgRate;
          sixCourses.push(compCourse);
        });
        const topInstructors = await user
          .aggregate([
            {
              $project: {
                email: 1,
                name: 1,
                headline: 1,
                link: 1,
                about_instructor: 1,
                certification: 1,
                photo_url: 1,

                course_count: { $size: "$courses" },
                student_count: { $size: "$students" },
              },
            },
            { $sort: { course_count: -1 } },
          ])
          .limit(8)
          .exec();
        const allFeaturedCourse = await course
          .aggregate([
            {
              $match: { category },
            },
            {
              $project: {
                instructor: 1,
                category: 1,
                course_title: 1,
                video: 1,
                photo: 1,
                original_price: 1,
                offer_price: 1,
                tags: 1,
                language: 1,
                ratings: 1,
                last_updated: 1,
                sub_heading: 1,
                students: 1,
                what_youll_learn: 1,
                description: 1,
                student_count: { $size: "$students" },
              },
            },
            { $sort: { student_count: -1 } },
            {
              $lookup: {
                from: "ratings",
                localField: "ratings",
                as: "rates",
                foreignField: "_id",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "instructor",
                as: "instructorDetails",
                foreignField: "_id",
              },
            },
          ])
          .limit(1)
          .exec();
        let featuredCourse = [];
        allFeaturedCourse.forEach((course) => {
          let sum = 0;
          let toPush = {};
          let compCourse = course;
          course.rates.forEach((rate) => {
            sum += rate.rates;
            console.log(sum);
          });
          avgRate = sum / course.rates.length;
          compCourse.rates = avgRate;
          featuredCourse.push(compCourse);
        });
        res.json({ sixCourses, topInstructors, featuredCourse });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.allCourses = async (req, res) => {
  try {
    const { page, category } = req.query;
    if (!category) {
      const courseCount = await course.count({});
      const courses = pagination(course, page);
      courses.then((rec) => {
        if (rec.courses) {
          // console.log("bjkj", rec.courses[0].rates);
          res.json({ courseCount, courses: rec.courses });
        } else {
          res.json({ error: rec.error });
        }
      });
    } else {
      const findCategory = await category1.findOne({ name: category }).exec();
      const categoryID = findCategory.name;
      const courses = await paginateCourses(page, categoryID);
      const course1 = await course.find({ category }).count().exec();
      // const courseCount = course1.students.length;
      if (courses.error) {
        res.json({ status: "error", msg: courses.error });
      } else {
        res.json({ status: "ok", response: { courses, course1 } });
      }
    }
  } catch (e) {
    res.json({ status: "error", msg: "Category Does not exist" });
  }
};

exports.postRating = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // console.log(token);
    const findToken = await user.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const userID = decoded.payload.id;
    const { rates, courseID } = req.body;
    const findRating = await rating.findOne({ courseID, userID }).exec();
    // console.log(findRating);
    let review = null;
    if (!findRating) {
      let reviews = req.body.review;
      if (reviews) {
        review = reviews;
      }
      console.log(review);
      const addRating = await rating.create({
        review,
        rates,
        courseID,
        userID,
      });
      const updateCourseRating = await course.findByIdAndUpdate(
        { _id: courseID },
        { $push: { ratings: addRating._id } }
      );
      res.json({ status: "ok", resp: { updateCourseRating, addRating } });
    } else {
      if (findRating.review == null && req.body.review != null) {
        let review = req.body.review;
        const updateRating = await rating
          .findOneAndUpdate(
            { _id: findRating._id },
            { $set: { rates, review } }
          )
          .exec();
        res.json({ status: "ok", msg: "Rating Updated" });
      } else {
        const updateRating = await rating
          .findOneAndUpdate({ _id: findRating._id }, { $set: { rates } })
          .exec();
        res.json({ status: "ok", msg: "raewrting Updated" });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error" });
  }
};

exports.getCompanionCourseById = async (req, res) => {
  try {
    const id = req.params.id;
    const instructorCourseAll = await course
      .findById(id, { approved: 0 })
      .populate(["instructor", "ratings", "sections"])
      .exec();
    let sum = 0;
    let instructorCourse = [];
    instructorCourseAll.ratings.forEach((rate) => {
      sum += rate.rates;
    });
    avgRate = sum / instructorCourseAll.ratings.length;
    instructorCourseAll.rates = avgRate;
    let newObj = {
      _id: instructorCourseAll._id,
      instructor: instructorCourseAll.instructor,
      category: instructorCourseAll.category,
      course_title: instructorCourseAll.course_title,
      video: instructorCourseAll.video,
      sections: instructorCourseAll.sections,
      photo: instructorCourseAll.photo,
      offer_price: instructorCourseAll.offer_price,
      original_price: instructorCourseAll.original_price,
      tags: instructorCourseAll.tags,
      language: instructorCourseAll.language,
      rates: instructorCourseAll.rates,
      last_updated: instructorCourseAll.last_updated,
      what_youll_learn: instructorCourseAll.what_youll_learn,
      ratings: instructorCourseAll.ratings,
      sub_heading: instructorCourseAll.sub_heading,
      description: instructorCourseAll.description,
    };

    instructorCourse.push(newObj);
    const instructor = instructorCourse.instructor;
    const instCoursesAll = await course
      .aggregate([
        {
          $match: { instructor: instructorCourseAll.instructor._id },
        },
        {
          $project: {
            instructor: 1,
            category: 1,
            course_title: 1,
            video: 1,
            photo: 1,
            original_price: 1,
            offer_price: 1,
            tags: 1,
            language: 1,
            ratings: 1,
            last_updated: 1,
            sub_heading: 1,
            students: 1,
            what_youll_learn: 1,
            description: 1,
            student_count: { $size: "$students" },
          },
        },
        { $sort: { student_count: -1 } },
        {
          $lookup: {
            from: "ratings",
            localField: "ratings",
            as: "rates",
            foreignField: "_id",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "instructor",
            as: "instructorDetails",
            foreignField: "_id",
          },
        },
      ])
      .limit(3)
      .exec();
    let instCourses = [];
    console.log(instCoursesAll);
    instCoursesAll.forEach((course) => {
      let sum = 0;
      let toPush = {};
      let compCourse = course;
      course.rates.forEach((rate) => {
        sum += rate.rates;
        console.log(sum);
      });
      avgRate = sum / course.rates.length;
      compCourse.rates = avgRate;
      instCourses.push(compCourse);
    });

    // const completeCourse = await course.findById(id).exec();

    res.json({
      status: "ok",
      resp: { instructorCourse: instructorCourse[0], instCourses },
    });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const id = req.params.id;
    // const id = "65b3fcd794f1139b614d1fe5";
    const instructorCourseAll = await course
      .findById(id, { approved: 0 })
      .populate(["instructor", "ratings", "sections"])
      .exec();
    // instructorCourseAll.forEach((course) => {
    //   let comp = {};
    let sum = 0;
    //   let toPush = {};
    let instructorCourse = [];
    instructorCourseAll.ratings.forEach((rate) => {
      sum += rate.rates;
    });
    avgRate = sum / instructorCourseAll.ratings.length;
    // console.log(avgRate);
    instructorCourseAll.rates = avgRate;
    let newObj = {
      _id: instructorCourseAll._id,
      instructor: instructorCourseAll.instructor,
      category: instructorCourseAll.category,
      course_title: instructorCourseAll.course_title,
      video: instructorCourseAll.video,
      sections: instructorCourseAll.sections,
      photo: instructorCourseAll.photo,
      offer_price: instructorCourseAll.offer_price,
      original_price: instructorCourseAll.original_price,
      tags: instructorCourseAll.tags,
      language: instructorCourseAll.language,
      rates: instructorCourseAll.rates,
      last_updated: instructorCourseAll.last_updated,
      what_youll_learn: instructorCourseAll.what_youll_learn,
      ratings: instructorCourseAll.ratings,
      sub_heading: instructorCourseAll.sub_heading,
      description: instructorCourseAll.description,
    };

    instructorCourse.push(newObj);
    // });
    const instructor = instructorCourse.instructor;
    // const instructorCourses = await course
    //   .find({ instructor })
    //   .sort({ students: -1 })
    //   .limit(3)
    //   .exec();

    // const instCourses = await course
    //   .find({ instructor })
    //   .sort({ students: -1 })
    //   .limit(3)
    //   .exec();

    // const instructorDetails = await therapist
    //   .aggregate([
    //     {
    //       $match: { _id: mongoose.Types.ObjectId(instructor) },
    //     },
    //     {
    //       $project: {
    //         email: 1,
    //         name: 1,
    //         headline: 1,
    //         link: 1,
    //         about_instructor: 1,
    //         certification: 1,
    //         photo_url: 1,

    //         student_count: { $size: "$students" },
    //       },
    //     },
    //     { $sort: { student_count: -1 } },
    //   ])
    //   .limit(3)
    //   .exec();
    // console.log("inst", instructor);
    const instCoursesAll = await course
      .aggregate([
        {
          $match: { instructor: instructorCourseAll.instructor._id },
        },
        {
          $project: {
            instructor: 1,
            category: 1,
            course_title: 1,
            video: 1,
            photo: 1,
            original_price: 1,
            offer_price: 1,
            tags: 1,
            language: 1,
            ratings: 1,
            last_updated: 1,
            sub_heading: 1,
            students: 1,
            what_youll_learn: 1,
            description: 1,
            student_count: { $size: "$students" },
          },
        },
        { $sort: { student_count: -1 } },
        {
          $lookup: {
            from: "ratings",
            localField: "ratings",
            as: "rates",
            foreignField: "_id",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "instructor",
            as: "instructorDetails",
            foreignField: "_id",
          },
        },
      ])
      .limit(3)
      .exec();
    let instCourses = [];
    console.log(instCoursesAll);
    instCoursesAll.forEach((course) => {
      let sum = 0;
      let toPush = {};
      let compCourse = course;
      course.rates.forEach((rate) => {
        sum += rate.rates;
        console.log(sum);
      });
      avgRate = sum / course.rates.length;
      compCourse.rates = avgRate;
      instCourses.push(compCourse);
    });

    // const completeCourse = await course.findById(id).exec();

    res.json({
      status: "ok",
      resp: { instructorCourse: instructorCourse[0], instCourses },
    });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { page } = req.query;
    const courseID = req.params.id;
    const result = await paginateReviews(page, courseID);
    if (result.error != null) {
      res.json({ status: "error", msg: result.error });
    } else {
      res.json({ status: "ok", msg: result });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An error occured" });
  }
};

exports.getByCategory = async (req, res) => {
  const name = req.params.category;
  try {
    const allCourse = await category1
      .findOne({ name })
      .populate("courses")
      .exec();
    if (!allCourse) {
      res.json({ status: "error", msg: "No courses in this category" });
    } else {
      const totalCourses = allCourse.courses.length;
      res.json({ totalCourses, allCourse });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.getBySubCategory = async (req, res) => {
  const subCategory = req.params.subcategory;
  const category = req.params.category;

  const findCategory = await category1
    .findOne({ name: category })
    .populate("subcategory")
    .exec();
  if (!findCategory) {
    res.json({
      status: "error",
      msg: "This category doesnt exist or doesnt have any course",
    });
  } else {
    const subCategories = findCategory.d;
  }
};

exports.editCourse = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    console.log(token);
    const findToken = await user.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const instructor = decoded.payload.id;
    // const therapistCourses=findToken.cou
    const id = req.params.id;
    const findCourse = await course.findOne({ _id: id, instructor }).exec();
    if (!findCourse) {
      res.json({ status: "error", msg: "This is not your course" });
    }
    const {
      course_title,
      sub_heading,
      tags,
      category,
      offer_price,
      original_price,
      description,
      what_youll_learn,
    } = req.body;
    const tagArray = tags.split(",");
    const learnArray = what_youll_learn.split(".");
    // res.json(req.files);
    if (!req.files.photo && !req.files.video) {
      console.log("update");
      const update = await course.findByIdAndUpdate(id, {
        $set: {
          course_title,
          sub_heading,
          tags: tagArray,
          category,
          description,
          instructor,
          what_youll_learn: learnArray,
          last_updated: Date.now(),
        },
      });
      res.json({ status: "ok", update });
    } else {
      if (req.files.photo && !req.files.video) {
        const photo = req.files.photo[0].location;
        const update = await course.findByIdAndUpdate(id, {
          $set: {
            course_title,
            sub_heading,
            tags: tagArray,
            category,
            photo,
            description,
            instructor,
            what_youll_learn: learnArray,
            last_updated: Date.now(),
          },
        });
        res.json({ status: "ok pic", update });
      } else if (!req.files.photo && req.files.video) {
        const video = req.files.video[0].location;
        const update = await course.findByIdAndUpdate(id, {
          $set: {
            course_title,
            sub_heading,
            tags: tagArray,
            category,
            video,
            description,
            instructor,
            what_youll_learn: learnArray,
            last_updated: Date.now(),
          },
        });
        res.json({ status: "ok video", update });
      } else if (req.files.photo && req.files.video) {
        const photo = req.files.photo[0].location;
        const video = req.files.video[0].location;
        const update = await course.findByIdAndUpdate(id, {
          $set: {
            course_title,
            sub_heading,
            tags: tagArray,
            category,
            photo,
            video,
            description,
            instructor,
            what_youll_learn: learnArray,
            last_updated: Date.now(),
          },
        });
        res.json({ status: "ok photo video", update });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.getSection = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // console.log(token);
    const findToken = await user.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const userID = decoded.payload.id;
    const courseID = req.query.c;
    const { id } = req.params;
    const sectionFind = await section.findOne({ _id: id }).exec();
    const validateCourse = await course
      .findOne({ _id: courseID }, { sections: { $elemMatch: { $eq: id } } })
      .exec();

    if (validateCourse.sections.length == 0) {
      res.json({ status: "Error", msg: "Invalid course or section" });
    } else {
      const findRating = await rating.findOne({ courseID, userID }).exec();

      const findComplete = await completed.findOne({ userID, courseID }).exec();
      if (findComplete) {
        res.json({ status: "ok", sectionFind, findRating, complete: true });
      } else {
        res.json({ status: "ok", sectionFind, findRating, complete: false });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An error occured" });
  }
};

exports.addSection = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const findToken = await user.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const userID = decoded.payload.id;
    const course_id = req.params.id;
    const { description, lesson_name, lesson_section, video_duration } =
      req.body;
    const courseFound = await course
      .findOne({ instructor: userID, _id: course_id })
      .exec();
    if (!courseFound) {
      res.json({ status: "error", msg: "This is not your Course" });
    } else {
      const sectionName = await section
        .findOne({
          course_id: course_id,
          section_name: lesson_section,
        })
        .exec();
      let files = {};
      if (req.files.video && req.files.doc && req.files.pdf) {
        const doc = req.files.doc[0].location;
        const video = req.files.video[0].location;
        const pdf = req.files.pdf[0].location;
        // const pdfSize = getpdfsize(pdf);
        // console.log("pdf ", pdfSize);
        files = { doc, video, pdf, video_duration };
      } else if (req.files.video && !req.files.doc && req.files.pdf) {
        const doc = null;
        const video = req.files.video[0].location;
        const pdf = req.files.pdf[0].location;
        // const pdfSize = getpdfsize(pdf);
        // pdfSize.then((x) => console.log("in", x));
        // console.log("pdf", pdfSize);
        files = { doc, video, pdf, video_duration };
      } else if (req.files.video && req.files.doc && !req.files.pdf) {
        const doc = req.files.doc[0].location;
        const video = req.files.video[0].location;
        const pdf = null;
        files = { doc, video, pdf, video_duration };
      } else if (req.files.video && !req.files.doc && !req.files.pdf) {
        const doc = null;
        const video = req.files.video[0].location;
        const pdf = null;
        files = { doc, video, pdf, video_duration };
      }
      if (sectionName == null) {
        const newSection = await section.create({
          course_id,
          section_name: lesson_section,
          lesson_name,
          files,
          description,
        });
        const updateCourse = await course
          .findOneAndUpdate(
            { _id: course_id },
            { $push: { sections: newSection._id } }
          )
          .exec();
        res.json({ status: "ok", resp: { newSection, updateCourse } });
      } else {
        const updateSection = await section.findOneAndUpdate(
          { _id: sectionName._id },
          {
            $push: {
              files,
              description,
              lesson_name,
            },
          }
        );
        res.json({ status: "ok", msg: updateSection });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error" });
  }
};

exports.delCourse = async (req, res) => {
  try {
    const course_id = req.params.id;
    const x = await course.findByIdAndDelete(course_id);
    if (!x) {
      res.json({ status: "doesnt exist" });
    } else {
      res.json({ status: "ok" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.addInstructor = async (req, res) => {
  const photo_url = req.file.location;

  try {
    const { name, email, about_instructor, salary, rating } = req.body;
    const newInstructor = await user.create({
      name,
      email,
      about_instructor,
      salary,
      rating,
      photo_url,
    });

    res.json({ newInstructor });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "failed to add instructor" });
  }
};

exports.searchCourse = async (req, res) => {
  const { search } = req.query;
  // search.trim().replace(/\s+/g, " ");
  var result = search.replace(/\s+/g, "").trim();
  console.log(result);
  const regex = new RegExp("^" + result, "i");
  const getCourses = await course
    .find(
      {
        course_title: { $regex: regex },
      },
      { course_title: 1 }
    )
    .exec();

  const getCategory = await category1
    .find({ name: { $regex: regex } }, { name: 1 })
    .exec();

  const getInstructors = await user
    .find(
      { $or: [{ name: { $regex: regex } }, { headline: { $regex: regex } }] },
      { _id: 1, name: 1 }
    )
    .exec();

  const getTags = await course
    .find({ tags: { $in: regex } }, { course_title: 1, tags: 1 })
    .exec();

  let sendTags = [];
  getTags.forEach((each) => {
    each.tags.forEach((one) => {
      if (regex.test(one)) {
        sendTags.push(one);
      }
    });
  });

  // console.log(sendTags);
  // let tagCourses = [];
  // sendTags.forEach(async (each) => {
  //   const cou = await course
  //     .findOne({ _id: each._id }, { course_title: 1, tags: 1 })
  //     .exec();
  //   tagCourses.push(cou);
  //   if (tagCourses.length == sendTags.length) {
  if (
    (getCourses.length == 0 &&
      getInstructors.length == 0 &&
      getTags.length == 0 &&
      getCategory.length == 0) ||
    result == "" ||
    result == new RegExp(/\A\s*\z/)
  ) {
    res.json({ status: "ok", msg: "No Result Found" });
  } else {
    res.json({
      status: "ok",
      response: { getCourses, getInstructors, sendTags, getCategory },
    });
  }
  //   }
  // });
};

exports.getTags = async (req, res) => {
  try {
    const result = req.query.search;
    // result == new RegExp(/\A\s*\z/);
    const regex = new RegExp("^" + result, "i");
    const getTags = await course
      .find({ tags: { $in: regex } }, { course_title: 1, tags: 1 })
      .exec();

    let sendTags = [];
    getTags.forEach((each) => {
      each.tags.forEach((one) => {
        if (regex.test(one)) {
          sendTags.push(one);
        }
      });
    });

    if (sendTags.length == 0 && result == new RegExp(/\A\s*\z/)) {
      res.json({ status: "ok", msg: "No Tags available" });
    } else {
      res.json({ status: "ok", msg: sendTags });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.delInstructor = async (req, res) => {
  try {
    const inst_id = req.params.id;
    const x = await user.findByIdAndDelete(inst_id);
    if (!x) {
      res.json({ status: "doesnt exist" });
    } else {
      res.json({ status: "ok" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.ongoingCourse = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const findToken = await user.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const userID = decoded.payload.id;
    console.log(userID);
    const { courseID, sectionID } = req.body;
    const validateCourse = await course.findOne({
      _id: "65b3fcd794f1139b614d1fe5",
      sections: sectionID,
    });
    if (!validateCourse) {
      res.json({ status: "error", msg: "Not Valid Course or Section" });
    } else {
      const findCourse = await ongoing.findOne({ userID, courseID }).exec();

      if (!findCourse) {
        // =======adding new course to ongoing========
        // const progress = (1 / validateCourse.sections.length) * 100;
        const progress = 100;
        if (progress == 100) {
          const findInComplete = await completed.findOne({ userID }).exec();
          if (!findInComplete) {
            const deleteFromOngoing = await ongoing
              .findOneAndDelete({ userID, courseID })
              .exec();
            // First completed course
            const addToCompleted = await completed.create({
              courseID,
              userID,
            });
            findToken.ready_for_quiz = true;
            await findToken.save();
            console.log("752 ", addToCompleted);
            res.json({
              status: "ok",
              msg: { addToCompleted, deleteFromOngoing },
            });
          } else {
            const deleteFromOngoing = await ongoing
              .findOneAndDelete({ userID, courseID })
              .exec();
            console.log(findInComplete);
            // Another completed course
            const updateCompleted = await completed
              .findOneAndUpdate({ userID }, { $addToSet: { courseID } })
              .exec();
            res.json({
              status: "ok",
              msg: {
                updateCompleted,
                deleteFromOngoing,
              },
            });
          }
        } else {
          console.log("700", progress);
          const addToOngoing = await ongoing.create({
            userID,
            courseID,
            sections: sectionID,
            progress,
          });

          const removeFromCourses = await user
            .findOneAndUpdate({ _id: userID }, { $pull: { courses: courseID } })
            .exec();

          // const addToUser = await user
          //   .findOneAndUpdate(
          //     { _id: userID },
          //     { $push: { ongoing_courses: addToOngoing._id } }
          //   )
          //   .exec();

          res.json({ status: "ok", msg: { addToOngoing, removeFromCourses } });
        }
      } else {
        const currentCourse = await course.findOne({ _id: courseID }).exec();

        if (findCourse.sections.length + 1 == currentCourse.sections.length) {
          // adding to completed courses
          console.log("721 ", findCourse._id);

          const findInComplete = await completed.findOne({ userID }).exec();
          if (!findInComplete) {
            const deleteFromOngoing = await ongoing
              .findOneAndDelete({ userID, courseID })
              .exec();
            // First completed course
            const addToCompleted = await completed.create({
              courseID,
              userID,
            });
            findToken.ready_for_quiz = true;
            await findToken.save();
            console.log("752 ", addToCompleted);
            res.json({
              status: "ok",
              msg: { addToCompleted, deleteFromOngoing },
            });
          } else {
            const deleteFromOngoing = await ongoing
              .findOneAndDelete({ userID, courseID })
              .exec();
            console.log(findInComplete);
            // Another completed course
            const updateCompleted = await completed
              .findOneAndUpdate({ userID }, { $addToSet: { courseID } })
              .exec();
            findToken.ready_for_quiz = true;
            await findToken.save();
            res.json({
              status: "ok",
              msg: {
                updateCompleted,
                deleteFromOngoing,
              },
            });
          }
        } else {
          // adding to section in ongoing courses
          const findSection = await ongoing
            .findOne(
              { userID },
              { sections: { $elemMatch: { $eq: sectionID } } }
            )
            .exec();

          console.log(findSection.sections.length);
          if (findSection.sections.length != 0) {
            res.json({ status: "ok", msg: "Nice try" });
            // res.json({ status: "ok", msg: "..", updateOngoing });
          } else {
            // const progress =
            //   ((1 + findCourse.sections.length) /
            //     validateCourse.sections.length) *
            //   100;
            const progress = 100;
            console.log("743 ", progress);
            // if (progress == 100) {

            // } else {
            const updateOngoing = await ongoing
              .findOneAndUpdate(
                {
                  userID,
                  course: courseID,
                },
                { $addToSet: { sections: sectionID, progress } }
              )
              .exec();
            res.json({ updateOngoing });
            // }
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occurred" });
  }
};

exports.getOngoingCourse = async (req, res) => {
  console.log("getOngoingCourse - 65b3fcd794f1139b614d1fe5")
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const findToken = await user.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const userID = decoded.payload.id;
    // let finalArray = [];
    const theCourses = await ongoing
      .find({ userID })
      .populate("courseID")
      .exec();
    console.log("theCourses", theCourses);
    res.json({ theCourses });
    let finalArray = [];
    for (const oneCourse of theCourses) {
      const instructor = await user
        // .findOne({ _id: oneCourse.courseID.instructor }, { name: 1 })
        .findOne({ _id: "65b3fcd794f1139b614d1fe5" }, { name: 1 })
        .exec();
      const oneArray = {};
      const ratings = await rating
        .findOne({ courseID: oneCourse.courseID, userID })
        .exec();
      // const courses = await course.findOne({ _id: oneCourse.courseID });
      oneArray.ratings = ratings;
      let newObj = {
        _id: oneCourse.courseID._id,
        instructor: instructor,
        category: oneCourse.courseID.category,
        course_title: oneCourse.courseID.course_title,
        video: oneCourse.courseID.video,
        photo: oneCourse.courseID.photo,
        offer_price: oneCourse.courseID.offer_price,
        original_price: oneCourse.courseID.original_price,
        sections: oneCourse.sectionID,
        progress: oneCourse.progress,
        tags: oneCourse.courseID.tags,
        language: oneCourse.courseID.language,
        rates: oneCourse.courseID.rates,
        last_updated: oneCourse.courseID.last_updated,
        what_youll_learn: oneCourse.courseID.what_youll_learn,
        // ratings: oneCourse.courseID.ratings,
        sub_heading: oneCourse.courseID.sub_heading,
        description: oneCourse.courseID.description,
      };

      oneArray.courses = newObj;
      finalArray.push(oneArray);
    }
    // console.log(theCourses.userID);
    // const courseArray = theCourses.courseID;
    res.json({ status: "ok", finalArray });
    // courseArray.forEach(async (one) => {
    //   let oneArray = {};

    //   let ratings = await rating
    //     .findOne({ userID, courseID: one.courseID })
    //     .exec();
    //   console.log(one);
    //   let courses = await course
    //     .findOne({ _id: one.courseID })
    //     .populate("instructor", "name")
    //     .exec();

    //   // console.log(courses);
    //   oneArray.ratings = ratings;
    //   oneArray.courses = courses;
    //   oneArray.progress = one.progress;
    //   finalArray.push(oneArray);
    //   if (finalArray.length == theCourses.length) {
    //     res.json({ status: "ok", finalArray });
    //   }
    // });

    // res.json({ status: "ok", theCourses });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An error occured" });
  }
};

exports.getCompleteCourse = async (req, res) => {
  console.log("getCompleteCourse - 65b3fcd794f1139b614d1fe5")
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const findToken = await user.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const userID = decoded.payload.id;

    const myCourses = await completed.find({ userID }).exec();
    let courseArray = myCourses[0].courseID;
    let finalArray = [];
    courseArray.forEach(async (one) => {
      let oneArray = {};
      let ratings = await rating.findOne({ userID, courseID: one }).exec();
      let courses = await course
        .findOne({ _id: one })
        .populate("instructor", "name")
        .exec();
      // console.log(courses);
      oneArray.ratings = ratings;
      oneArray.courses = courses;
      finalArray.push(oneArray);
      if (finalArray.length == myCourses.length) {
        res.json({ status: "ok", finalArray });
      }
    });

    // res.json({ status: "ok", myCourses });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An error occured" });
  }
};
exports.purchasedCourses = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const findToken = await user.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const userID = decoded.payload.id;
    console.log(decoded);
    // old one

    // new One
    const allPurchased = await purchased
      .find({ userID })
      .populate("courseID")
      .exec();
    let finalArray = [];
    for (const one of allPurchased) {
      const oneArray = {};
      const ratings = await rating
        .findOne({
          userID,
          courseID: one.courseID,
        })
        .exec();
      oneArray.ratings = ratings;
      oneArray.courses = one.courseID;
      // console.log("couid", one.courseID._id);
      // const completedOne = await completed
      //   .findOne({ userID, courseID: one.courseID._id })
      //   .populate("courseID")
      //   .exec();
      // const progress = await ongoing
      //   .findOne({ userID, courseID: one.courseID._id })
      //   .populate("courseID")
      //   .exec();
      // console.log(ratings);
      // if (ratings) {
      //   oneArray.ratings = ratings;
      // } else {
      //   oneArray.ratings = null;
      // }
      // if (progress) {
      //   oneArray.courses = progress;
      // } else {
      //   if (completedOne) {
      //     oneArray.courses = completedOne;
      //   } else {
      //     oneArray.courses = one.courseID;
      //   }
      // }

      finalArray.push(oneArray);
    }

    res.json({ status: "ok", finalArray });
    // }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An error occured" });
  }
};

exports.buyCourse = async (req, res) => {
  try {
    const { courseID } = req.body;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const findToken = await user.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const userID = decoded.payload.id;
    console.log(decoded);
    const purchase = await course.findOne({ _id: courseID }).exec();

    // console.log(purchase);
    if (!purchase) {
      res.json({ status: "error", msg: "Course doesnt exist" });
    } else {
      paypal.configure({
        mode: "sandbox",
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_CLIENT_SECRET,
      });
      console.log(purchase._id);
      var create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:5000/api/courses/success",
          cancel_url: "http://localhost:5000/api/courses/cancel",
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: purchase.course_title,
                  price: purchase.offer_price,
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: purchase.offer_price,
            },
            description: "This is the payment description.",
          },
        ],
      };
      let u = "";
      let link = "";
      paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
          console.log(error);
          res.json({ status: "error", msg: error });
        } else {
          console.log("Create Payment Response");
          // Redirecting to payment url
          link = payment.links[1].href;
          console.log(link);
          var params = new URLSearchParams(payment.links[1].href);
          u = params.get("token");
          const pushToken = user
            .findOneAndUpdate(
              { _id: userID },
              { $set: { paymentToken: u, proceedToBuy: courseID } }
            )
            .exec();
          pushToken.then((rec) => res.json({ status: "ok", link }));
        }
      });
    }
  } catch (e) {
    res.json({ status: "error", msg: "An error occured" });
  }
};

exports.successBuy = async (req, res) => {
  const { paymentId, PayerID, token } = req.query;
  const findUser = await user.findOne({ paymentToken: token }).exec();
  const course1 = await course.findOne({ _id: findUser.proceedToBuy }).exec();
  console.log(course1);
  if (!findUser.proceedToBuy && paymentToken == "") {
    res.json({ status: "error", msg: "An error occured. Please try again" });
  } else {
    const execute_payment = {
      payer_id: PayerID,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: course1.offer_price,
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment,
      async (error, payment) => {
        if (error) {
          console.log(error.response);
          res.json({ error });
        } else {
          console.log(payment);
          const addStudent = await course.findOneAndUpdate(
            { _id: findUser.proceedToBuy },
            { $addToSet: { students: findUser._id } }
          );
          // const completePayment = await user
          //   .findOneAndUpdate(
          //     { _id: findUser._id },
          //     {
          //       $addToSet: { courses: findUser.proceedToBuy },
          //       $set: { proceedToBuy: null, paymentToken: null },
          //     }
          //   )
          //   .exec();
          const updateTherapist = await user
            .findOneAndUpdate(
              { _id: course1.instructor },
              { $addToSet: { students: findUser._id } }
            )
            .exec();
          const date = new Date();
          console.log(date);
          const pushToPurchase = await purchased.create({
            userID: findUser._id,
            courseID: findUser.proceedToBuy,
            instructorID: course1.instructor,
            price: payment.transactions[0].amount.total,
          });
          // res.json({
          //   status: "ok",
          //   response: {
          //     // completePayment,
          //     addStudent,
          //     updateTherapist,
          //     pushToPurchase,
          //     payment: payment.transactions[0].amount.total,
          //   },
          // });
          res.redirect("https://leapifytalk.netlify.app/student/course");
        }
      }
    );
    // res.redirect("The Front End page link")
  }
};

exports.cancelBuy = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  const findToken = await user.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const userID = decoded.payload.id;
  const findCourse = await user
    .findOneAndUpdate(
      { _id: userID },
      { $set: { paymentToken: null, proceedToBuy: null } }
    )
    .exec();
  res.json({ status: "error", msg: "payment cancelled" });
};

// 61ceec6749e3f49def26acc4 61ceec8449e3f49def26acd1
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxYzA4NjI3MTMwOWY0NGMzZDc3ZGUzMiIsImVtYWlsIjoibXVoc2luMjJAZ21haWwuY29tIiwibmFtZSI6Ik11aHNpbjIyIiwidXNlcm5hbWUiOiJVQ09FTlVXTCIsImlhdCI6MTY0MDAwNzMwNSwiZXhwIjoxNjQxMzAzMzA1fQ.jptjIuQ_gQhx6PpTGnfagJQUhVCmIdrelzP3vSbT4o0
exports.tp = async (req, res) => {};
