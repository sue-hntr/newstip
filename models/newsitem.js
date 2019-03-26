var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var NewsitemSchema = new Schema({
 //   * Headline - the title of the article
    headline:{
        type: String,
        required: true,
        // trim: true
    },
 //   * Summary - a short summary of the article
    summary: {
        type: String,
        required: true,
        trim: true
    },
 //   * URL - the url to the original article
    url: {
        type: String,
        required: true
    },
 //   REFER TO COMMENTS COLLECTION HERE.
    comment: {
        type: Schema.Types.ObjectId,
        ref: "comment"
  }
});


// This creates our model from the above schema, using mongoose's model method
var Newsitem = mongoose.model("Newsitem", NewsitemSchema);

// Export the Newsitem model
module.exports = Newsitem;
