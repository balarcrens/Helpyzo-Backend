import Contact from "../models/Contact.js";

export const createContact = async (req, res, next) => {
    try {
        const user = req.user.id;
        const { fullName, email, subject, message } = req.body;

        const contact = await Contact.create({
            user,
            fullName,
            email,
            subject,
            message
        });

        res.status(200).json({ success: true, contact, message: "Contact send successfully" });
    } catch (error) {
        next(error);
    }
}

export const getAllContact = async (req, res, next) => {
    try {
        const contacts = await Contact.find();

        if (!contacts)
            return res.status(404).json({ success: false, message: "Contact not found" });

        res.status(200).json({ success: true, contacts });
    } catch (error) {
        next(error)
    }
}

export const getContactById = async (req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact)
            return res.status(404).jsonContact({ success: false, message: "Contact not found" });

        res.status(200).json({ success: true, contact })
    } catch (error) {
        next(error);
    }
}

export const deleteContact = async (req, res, next) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact)
            res.status(404).json({ success: false, message: "Contact not found" });

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}