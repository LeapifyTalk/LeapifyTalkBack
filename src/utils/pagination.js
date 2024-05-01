const mongoose = require("mongoose");
const purchased = require("../models/purchased");
const course = require("../models/course");
const rating = require("../models/ratings");
const user=require('../models/user')
const therapist1 = require("../models/user");
const pagination = async (model, page) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
    }
    // instructorDetails:in
    if (model.count({}) < page * 4) {
      page = 1;
    } else {
      let recordss = await model
        .find({})
        .sort({ students: -1 })
        .populate("instructor")
        .populate("ratings")
        .limit(4)
        .skip(page * 4)
        .exec();
      let records = [];
      recordss.forEach((course) => {
        let comp = {};
        let sum = 0;
        let toPush = {};
        course.ratings.forEach((rate) => {
          sum += rate.rates;
        });
        avgRate = sum / course.ratings.length;
        console.log(avgRate);
        course.rates = avgRate;
        let newObj = {
          _id: course._id,
          category: course.category,
          instructorName: course.instructor.name,
          course_title: course.course_title,
          video: course.video,
          photo: course.photo,
          offer_price: course.offer_price,
          original_price: course.original_price,
          tags: course.tags,
          language: course.language,
          instructorDetails: course.instructor,
          rates: course.rates,
          last_updated: course.last_updated,
          what_youll_learn: course.what_youll_learn,
          ratings: course.ratings,
          sub_heading: course.sub_heading,
          description: course.description,
        };

        //   // comp = avgRate;
        //   // comp.course = course;
        //   // compCourse = course;
        //   // course.rates1 = avgRate;
        //   // console.log("dfs", course.rates1);
        //   // console.log("vgh", compCourse.rates);
        // comp = avgRate;
        // comp.course = course;
        // compCourse = course;
        // course.rates1 = avgRate;
        // console.log("dfs", course.rates1);
        // console.log("vgh", compCourse.rates);
        records.push(newObj);
      });
      results.courses = records;
      // console.log(results);
    }
    return results;
  } catch (e) {
    console.log(e.message);
    return e;
  }
};

const paginationById = async (model, page, filter) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    }
    // if (model.count({}) < page * 4) {
    //   page = 1;
    // }
    else {
      let instructor1s = await course
        .find({ instructor: filter })
        .populate("instructor", "name")
        .populate("ratings")
        .limit(4)
        .skip(page * 4)
        .exec();
      // console.log(instructor1s[0].courses[0]);
      let instructor1 = [];
      instructor1s.forEach((course) => {
        let comp = {};
        let sum = 0;
        let toPush = {};
        course.ratings.forEach((rate) => {
          console.log("rate ", rate.rates);
          sum += rate.rates;
        });
        avgRate = sum / course.ratings.length;
        console.log("avg", avgRate);
        course.rates = avgRate;
        console.log(course.rates);
        let newObj = {
          _id: course._id,
          category: course.category,
          course_title: course.course_title,
          video: course.video,
          photo: course.photo,
          offer_price: course.offer_price,
          original_price: course.original_price,
          tags: course.tags,
          language: course.language,
          rates: course.rates,
          last_updated: course.last_updated,
          what_youll_learn: course.what_youll_learn,
          ratings: course.ratings,
          sub_heading: course.sub_heading,
          description: course.description,
        };

        //   // comp = avgRate;
        //   // comp.course = course;
        //   // compCourse = course;
        //   // course.rates1 = avgRate;
        //   // console.log("dfs", course.rates1);
        //   // console.log("vgh", compCourse.rates);
        instructor1.push(newObj);
      });
      let name = await model.find({ _id: filter }, { name: 1 }).exec();
      let courses = await therapist1
        .findOne({ _id: filter })
        .populate("courses")
        .exec();
      // console.log("name ", name);
      const instructorName = name[0].name;
      // console.log(instructorName);
      console.log(courses); 
      results = {
        instructorName,
        instructor1,
        totalCourses: courses.courses.length,
      };
      
      // if (instructor1[0].courses.length == 0) {
      //   results.error = "No Course at this page";
      //   return results;
      // }
      return results;

      // console.log(instructor1);
    }
  } catch (e) {
    console.log(e);
    const results = {};
    results.error = e.message;
    return results;
  }
};

const paginateCourses = async (page, filter) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    }
    // if (model.count({}) < page * 4) {
    //   page = 1;
    // }
    else {
      // let courses = await model
      //   .find({ name: filter }, { courses: 1 })
      //   .populate({
      //     path: "courses",
      //     options: {
      //       limit: 4,
      //       skip: page * 4,
      //     },
      //   })
      //   .sort({ students: -1 })
      //   .exec();
      let recordss = await course
        .find({ category: filter })
        .sort({ students: -1 })
        .populate("instructor")
        .populate("ratings")
        .limit(4)
        .skip(page * 4)
        .exec();
      let records = [];
      recordss.forEach((course) => {
        let comp = {};
        let sum = 0;
        let toPush = {};
        course.ratings.forEach((rate) => {
          sum += rate.rates;
        });
        avgRate = sum / course.ratings.length;
        console.log(avgRate);
        course.rates = avgRate;
        let newObj = {
          _id: course._id,
          category: course.category,
          instructorName: course.instructor.name,
          course_title: course.course_title,
          video: course.video,
          photo: course.photo,
          offer_price: course.offer_price,
          original_price: course.original_price,
          tags: course.tags,
          language: course.language,
          instructorDetails: course.instructor,
          rates: course.rates,
          last_updated: course.last_updated,
          what_youll_learn: course.what_youll_learn,
          ratings: course.ratings,
          sub_heading: course.sub_heading,
          description: course.description,
        };
        console.log(newObj);
        records.push(newObj);
      });
      results.courses = records;
      if (results.courses.length == 0) {
        results.error = "No Course at this page";
        return results;
      }
      return results;

      // console.log(instructor1);
    }
  } catch (e) {
    console.log(e.message);
    return e;
  }
};

const paginateDashboard = async (page, filter) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const courseDetail = await purchased
        .find(
          { instructorID: filter },
          { courseID: 1, userID: 1, createdAt: 1 }
        )
        .populate(["courseID", "userID"])
        .limit(8)
        .skip(8 * page)
        .exec();

      results.courses = courseDetail;
      return results;
    }
  } catch (e) {
    console.log(e);
    results.error = "An error occured";
  }
};

const paginateReviews = async (page, filter) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const reviews = await rating
        .find({ courseID: filter })
        .sort({ rates: -1 })
        .skip(4 * page)
        .limit(4)
        .populate("userID", ["name", "photo"])
        .exec();

      if (reviews.length == 0) {
        results.error = "No reviews for this page or course";
        return results;
      } else {
        results.courses = reviews;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = "An error occured";
    return results;
  }
};

const paginatePayments = async (page) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const findDates = await purchased
        .find({})
        .sort({ createdAt: -1 })
        .populate("instructorID", "name")
        .populate("courseID", "course_title")
        .populate("userID", ["name", "_id"])
        .skip(10 * page)
        .limit(10)
        .exec();

      if (findDates.length != 0) {
        results.courses = findDates;
        results.total = await purchased.find({}).count().exec();
        return results;
      } else {
        results.error = "No Transactions Available";
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
};

const paginateTherapistAdmin = async (page) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const allTherapists = await therapist1
        .find(
          { onHold: true, registered: true },
          {
            _id: 1,
            name: 1,
            created_at: 1,
            updated_at: 1,
            onHold: 1,
            email: 1,
            phone: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(10 * page)
        .limit(10)
        .exec();

      if (allTherapists.length == 0) {
        results.courses = "No therapists available";
        return results;
      } else {
        results.total = await therapist1.find({ onHold: true }).count().exec();
        results.courses = allTherapists;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
};

const paginateCourseAdmin = async (page, condition) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const allCourses = await course
        .find(
          { condition: true },
          {
            _id: 1,
            course_title: 1,
            created_at: 1,
            updated_at: 1,
            condition: 1,
            photo: 1,
            onHold: 1,
            approved: 1,
            offer_price: 1,
            original_price: 1,
            students: 1,
            video: 1,
          }
        )
        .populate("instructor", "name")
        .sort({ createdAt: -1 })
        .skip(10 * page)
        .limit(10)
        .exec();

      if (allCourses.length == 0) {
        results.courses = "No courses available";
        return results;
      } else {
        results.total = await course.find({ condition: true }).count().exec();
        results.courses = allCourses;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
};

const paginateStudentCourseCount = async (page) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const studentCount = await course
        .aggregate([
          {
            $lookup: {
              from: "therapists",
              localField: "instructor",
              as: "instructorName",
              foreignField: "_id",
            },
          },
          {
            $unwind: "$instructorName",
          },
          {
            $project: {
              _id: 1,
              course_title: 1,
              photo: 1,
              "instructorName.name": 1,
              student_count: { $size: "$students" },
            },
          },
          {
            $sort: { student_count: -1 },
          },
        ])
        .skip(10 * page)
        .limit(10)
        .exec();
      results.courses = studentCount;
      results.total = await course.find({}).count().exec();
      return results;
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
};

const paginateCourseApproved = async (page) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const allCourses = await course
        .find(
          { approved: true },
          {
            _id: 1,
            course_title: 1,
            created_at: 1,
            updated_at: 1,
            condition: 1,
            photo: 1,
            onHold: 1,
            approved: 1,
            offer_price: 1,
            original_price: 1,
            students: 1,
            video: 1,
          }
        )
        .populate("instructor", "name")
        .sort({ createdAt: -1 })
        .skip(10 * page)
        .limit(10)
        .exec();

      if (allCourses.length == 0) {
        results.courses = "No courses available";
        return results;
      } else {
        results.total = await course.find({ approved: true }).count().exec();
        results.courses = allCourses;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
};

const paginateCompanionApproved = async (page) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const allCourses = await user
        .find(
          { approved: true ,role:'companion'},
        )
        .sort({ createdAt: -1 })
        .skip(10 * page)
        .limit(10)
        .exec();

      if (allCourses.length == 0) {
        results.courses = "No approved companion available";
        return results;
      } else {
        results.total = await user.find({ approved: true,role:'companion' }).count().exec();
        results.companions = allCourses;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
};

const paginateCompanionunApproved=async(page)=>{
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const allCourses = await user
        .find(
          { notApproved: true ,role:'companion'},
        )
        .sort({ createdAt: -1 })
        .skip(10 * page)
        .limit(10)
        .exec();

      if (allCourses.length == 0) {
        results.courses = "No rejected companion available";
        return results;
      } else {
        results.total = await user.find({ notApproved: true,role:'companion' }).count().exec();
        results.companions = allCourses;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
}

const paginateCourseunApproved = async (page) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const allCourses = await course
        .find(
          { notApproved: true },
          {
            _id: 1,
            course_title: 1,
            created_at: 1,
            updated_at: 1,
            condition: 1,
            photo: 1,
            onHold: 1,
            approved: 1,
            notApproved: 1,
            offer_price: 1,
            original_price: 1,
            students: 1,
            video: 1,
          }
        )
        .populate("instructor", "name")
        .sort({ createdAt: -1 })
        .skip(10 * page)
        .limit(10)
        .exec();

      if (allCourses.length == 0) {
        results.courses = "No courses available";
        return results;
      } else {
        results.total = await course.find({ notApproved: true }).count().exec();
        results.courses = allCourses;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
};

const paginateTherapistunApproved = async (page) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const allTherapists = await therapist1
        .find(
          { notApproved: true, registered: true },
          {
            _id: 1,
            name: 1,
            created_at: 1,
            updated_at: 1,
            onHold: 1,
            notApproved: 1,
            email: 1,
            phone: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(10 * page)
        .limit(10)
        .exec();

      if (allTherapists.length == 0) {
        results.courses = "No therapists available";
        return results;
      } else {
        results.total = await therapist1
          .find({ notApproved: true })
          .count()
          .exec();
        results.courses = allTherapists;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
};

const paginateTherapistApproved = async (page) => {
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const allTherapists = await therapist1
        .find(
          { approved: true, registered: true },
          {
            _id: 1,
            name: 1,
            created_at: 1,
            updated_at: 1,
            onHold: 1,
            approved: 1,
            email: 1,
            phone: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(10 * page)
        .limit(10)
        .exec();

      if (allTherapists.length == 0) {
        results.courses = "No therapists available";
        return results;
      } else {
        results.total = await therapist1
          .find({ approved: true })
          .count()
          .exec();
        results.courses = allTherapists;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
};

const paginateReportedCompanion=async(page)=>{
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const allTherapists = await rating
        .find(
          { reported:true },
        ).populate("companionID","name")
        .populate("userID","name")
        .sort({ createdAt: -1 })
        .skip(10 * page)
        .limit(10)
        .exec();

      if (allTherapists.length == 0) {
        results.courses = "No reports available";
        return results;
      } else {
        results.total = await rating
          .find({ reported: true })
          .count()
          .exec();
        results.reported = allTherapists;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
}

const paginateCompaniononhold=async(page)=>{
  
  try {
    page = parseInt(page - 1);
    let results = {};
    if (page < 0 || isNaN(page)) {
      results.error = "invalid page number";
      return results;
    } else {
      const allCourses = await user
        .find(
          { onHold: true ,role:'companion'},
        )
        .sort({ createdAt: -1 })
        .skip(10 * page)
        .limit(10)
        .exec();

      if (allCourses.length == 0) {
        results.courses = "No on hold companions available";
        return results;
      } else {
        results.total = await user.find({ onHold: true,role:'companion' }).count().exec();
        results.companions = allCourses;
        return results;
      }
    }
  } catch (e) {
    console.log(e);
    let results = {};
    results.error = e.messages;
    return results;
  }
}

module.exports = {
  pagination,
  paginationById,
  paginateCourses,
  paginateDashboard,
  paginateReviews,
  paginatePayments,
  paginateTherapistAdmin,
  paginateCourseAdmin,
  paginateCourseunApproved,
  paginateTherapistunApproved,
  paginateTherapistApproved,
  paginateCourseApproved,
  paginateStudentCourseCount,
  paginateReportedCompanion,
  paginateCompanionApproved,
  paginateCompanionunApproved,
  paginateCompaniononhold
};
