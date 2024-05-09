import { isValidObjectId } from "mongoose";
import { validateEmail } from "../helper/helper.functions.js";
import Contact from "../models/contact.model.js";
import { apiError } from "../utils/apiError.js";
import { sendEmail } from "../utils/send.email.js";

// Contact Methods
const createContact = async (contactDetails) => {
  const { firstName, lastName, phoneNumber, email, message } = contactDetails;

  if (!firstName || !phoneNumber || !email || !message) {
    throw new apiError(400, "Missing Fiels Are Required");
  }

  const validateEmailCheck = validateEmail(email);
  if (!validateEmailCheck) {
    throw new apiError(400, "Provide valid email");
  }

  const newContact = new Contact({
    firstName,
    lastName,
    phoneNumber,
    email,
    message,
  });

  const savedContact = await newContact.save();
  if (!savedContact) {
    throw new apiError(400, "Something Went Wrong");
  }

  const subject = "New Website Inquiry";

  const mesgForAdminFromUser = `<p> Hello admin,</p>
  <p>You have received a new inquiry from your website:</p>
  <P>Name: ${firstName} ${lastName}</P>
  <p>Email: ${email}</p>
  <p>Phone Number: ${phoneNumber}</p>
  <p>Message: ${message}</p>

   <p>Regards,</p>
   <p>Dagna.De</p>
  `;

  // Send the email for new contact user
  await sendEmail(email, subject, mesgForAdminFromUser);

  return savedContact;
};

// Get the contact
const getSignleAndAllContact = async (contactId) => {
  if (contactId) {
    if (!isValidObjectId(contactId)) {
      throw new apiError(400, "Invalid contactId format");
    }
    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw new apiError(404, "Contact Not Found");
    }
    return contact;
  } else {
    const getAllContact = await Contact.find();
    if (getAllContact.length === 0) {
      throw new apiError(404, "Contact is empty");
    }
    return getAllContact;
  }
};

// Delete the contact

const deleteContact = async (contactId) => {
  if (!isValidObjectId(contactId)) {
    throw new apiError(400, "Invalid contactId format");
  }
  const deletedContact = await Contact.findByIdAndDelete(contactId);
  if (!deletedContact) {
    throw new apiError(404, "Contact Not Found");
  }
  return deletedContact;
};

export default {
  createContact,
  getSignleAndAllContact,
  deleteContact,
};
