import contactService from "../services/contact.service.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Handle the contact response
const createContact = asyncHandler(async (req, res) => {
  try {
    const contactResponse = await contactService.createContact(req.body);
    return res
      .status(200)
      .json(
        new apiResponse(200, contactResponse, "Contact created successfully"),
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiError({ statusCode: error.statusCode, message: error.message }),
      );
  }
});

const getSignleAndAllContact = asyncHandler(async (req, res) => {
  try {
    const contactResponse = await contactService.getSignleAndAllContact(
      req.query.contactId,
    );
    return res
      .status(200)
      .json(
        new apiResponse(200, contactResponse, "Contact Reterived Successfully"),
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiError({ statusCode: error.statusCode, message: error.message }),
      );
  }
});

const deleteContact = asyncHandler(async (req, res) => {
  try {
    const contactResponse = await contactService.deleteContact(
      req.query.contactId,
    );
    return res
      .status(200)
      .json(
        new apiResponse(200, contactResponse, "Contact Deleted Successfully"),
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiError({ statusCode: error.statusCode, message: error.message }),
      );
  }
});

export default {
  createContact,
  getSignleAndAllContact,
  deleteContact,
};
