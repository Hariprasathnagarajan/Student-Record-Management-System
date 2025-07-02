const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  age: {
    type: Number,
    required: [true, 'Please add age'],
    min: [5, 'Age must be at least 5'],
    max: [120, 'Age must be less than 120']
  },
  grade: {
    type: String,
    required: [true, 'Please add grade'],
    enum: ['A', 'B', 'C', 'D', 'F']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  enrollmentYear: {
    type: Number,
    required: [true, 'Please add enrollment year'],
    min: [2000, 'Year must be 2000 or later'],
    max: [new Date().getFullYear(), 'Year cannot be in the future'],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value for year'
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Student', StudentSchema);