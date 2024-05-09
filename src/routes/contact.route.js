import express, { Router } from "express";
import contactController from "../controllers/contact.controller.js";

const contact_route = Router();

// Routes
contact_route.post("/create-contact", contactController.createContact);

contact_route.get("/get-contact", contactController.getSignleAndAllContact);

contact_route.delete("/delete-contact", contactController.deleteContact);

export default contact_route;
