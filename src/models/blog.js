const mongoose = require("mongoose");

// Blog JsonMembers

const BlogSchema = new mongoose.Schema({
    email: { type: String},
    name: { type: String},
    blogtitle: { type: String},
    date: { type: String},
    blogcontent : { type: String},
    image : { type: String},
})


// We Will Create a New mongoose.Collection
const Blog = new mongoose.model('Blog', BlogSchema);
module.exports = Blog;
