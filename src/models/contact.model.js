import mongoose, {Schema} from "mongoose";

const contactSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        default: "",
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;