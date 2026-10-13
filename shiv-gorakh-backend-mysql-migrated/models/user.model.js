const mongoose = require('../config/mysql-odm.js');
const bcrypt = require('bcryptjs');
const { UserRole } = require('../constants/app.constants');

const userSchema = new mongoose.Schema({
    name: {
    type: String,
    required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      },
    phone: {
      type: String,
      required: false,
      unique: true,
      index: true,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: [UserRole.DONOR, UserRole.VOLUNTEER, UserRole.MEMBER, UserRole.ADMIN],
      default: UserRole.DONOR
    },
    profilePicture: {
      type: String,
      default: '',
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    }
}, { timestamps: true, versionKey: false, autoIndex: false });

userSchema.pre('save', async function () {
    if (this.phone === '' || this.phone === null) {
        this.phone = undefined;
    }
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
