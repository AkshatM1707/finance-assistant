import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true, // hash this in production
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
