import Partner from '../models/Partner.js';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

// Generate JWT Token
const generateToken = (id, role = 'partner') => {
	return jwt.sign({ id, role }, config.jwtSecret, {
		expiresIn: config.jwtExpire,
	});
};

// Register Partner
export const registerPartner = async (req, res, next) => {
	try {
		let {
			name,
			email,
			phone,
			password,
			address,
			business,
			profileImage,
			documents,
		} = req.body;

		email = email.toLowerCase().trim();

		const existingPartner = await Partner.findOne({ email });
		if (existingPartner) {
			return res.status(400).json({
				success: false,
				message: 'Email already registered',
			});
		}

		const formattedDocuments = Array.isArray(documents)
			? documents
				.filter(doc => doc?.type && doc?.dataUrl)
				.map(doc => ({
					type: doc.type,
					fileUrl: doc.dataUrl,
					status: 'pending',
				}))
			: [];


		const partner = await Partner.create({
			name,
			email,
			phone,
			password,
			address,
			business,
			profileImage,
			documents: formattedDocuments,
			verified: false,
		});

		const token = generateToken(partner._id, 'partner');

		res.status(201).json({
			success: true,
			message:
				'Partner registered successfully. Documents submitted for verification.',
			token,
			partner: partner.toJSON(),
		});
	} catch (error) {
		next(error);
	}
};

// Login Partner
export const loginPartner = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide email and password',
			});
		}

		const partner = await Partner.findOne({ email }).select('+password');

		if (!partner) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password',
			});
		}

		const isPasswordMatched = await partner.matchPassword(password);

		if (!isPasswordMatched) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password',
			});
		}

		// Update last login
		partner.lastLogin = new Date();
		await partner.save();

		const token = generateToken(partner._id);

		res.status(200).json({
			success: true,
			message: 'Login successful',
			token,
			partner: partner.toJSON(),
		});
	} catch (error) {
		next(error);
	}
};

// Get Partner Profile
export const getPartnerProfile = async (req, res, next) => {
	try {
		const partner = await Partner.findById(req.user.id).populate('services.category');

		if (!partner) {
			return res.status(404).json({
				success: false,
				message: 'Partner not found',
			});
		}

		res.status(200).json({
			success: true,
			partner,
		});
	} catch (error) {
		next(error);
	}
};

// Update Partner Profile
export const updatePartnerProfile = async (req, res, next) => {
	try {
		const { name, phone, address, business, workingHours, isActive, paymentMethods, profileImage } = req.body;

		const partner = await Partner.findByIdAndUpdate(
			req.user.id,
			{ name, phone, address, business, workingHours, isActive, paymentMethods, profileImage },
			{ new: true, runValidators: true }
		).populate('services.category');

		if (!partner) {
			return res.status(404).json({
				success: false,
				message: 'Partner not found',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Profile updated successfully',
			partner,
		});
	} catch (error) {
		next(error);
	}
};

// Add Service
export const addService = async (req, res, next) => {
	try {
		const {
			name,
			category,
			basePrice,
			visitingFees,
			discount,
			durationInMinutes,
			availableDays,
			availableTime,
			cancellationPolicy,
			description,
			image,
			serviceArea,
			maxBookingsPerDay,
		} = req.body;

		// Calculate final price
		const finalPrice = basePrice - (basePrice * (discount || 0)) / 100;

		const partner = await Partner.findByIdAndUpdate(
			req.user.id,
			{
				$push: {
					services: {
						name,
						category,
						basePrice,
						visitingFees,
						discount,
						finalPrice,
						durationInMinutes,
						availableDays,
						availableTime,
						cancellationPolicy,
						description,
						image,
						serviceArea,
						maxBookingsPerDay,
					},
				},
			},
			{ new: true }
		).populate('services.category');

		if (!partner) {
			return res.status(404).json({
				success: false,
				message: 'Partner not found',
			});
		}

		if (partner.verification.status !== 'approved') {
			return res.status(403).json({
				success: false,
				message: 'Partner verification pending. Upload documents and wait for approval.',
			});
		}

		res.status(201).json({
			success: true,
			message: 'Service added successfully',
			partner,
		});
	} catch (error) {
		next(error);
	}
};

// Update Service
export const updateService = async (req, res, next) => {
	try {
		const { serviceId } = req.params;
		const {
			name,
			category,
			basePrice,
			visitingFees,
			discount,
			durationInMinutes,
			availableDays,
			availableTime,
			cancellationPolicy,
			description,
			image,
			serviceArea,
			maxBookingsPerDay,
		} = req.body;

		// Calculate final price if basePrice or discount is provided
		const finalPrice = basePrice ? basePrice - (basePrice * (discount || 0)) / 100 : undefined;

		const updateFields = {};
		if (name !== undefined) updateFields['services.$[elem].name'] = name;
		if (category !== undefined) updateFields['services.$[elem].category'] = category;
		if (basePrice !== undefined) updateFields['services.$[elem].basePrice'] = basePrice;
		if (finalPrice !== undefined) updateFields['services.$[elem].finalPrice'] = finalPrice;
		if (visitingFees !== undefined) updateFields['services.$[elem].visitingFees'] = visitingFees;
		if (discount !== undefined) updateFields['services.$[elem].discount'] = discount;
		if (durationInMinutes !== undefined) updateFields['services.$[elem].durationInMinutes'] = durationInMinutes;
		if (availableDays !== undefined) updateFields['services.$[elem].availableDays'] = availableDays;
		if (availableTime !== undefined) updateFields['services.$[elem].availableTime'] = availableTime;
		if (cancellationPolicy !== undefined) updateFields['services.$[elem].cancellationPolicy'] = cancellationPolicy;
		if (description !== undefined) updateFields['services.$[elem].description'] = description;
		if (image !== undefined) updateFields['services.$[elem].image'] = image;
		if (serviceArea !== undefined) updateFields['services.$[elem].serviceArea'] = serviceArea;
		if (maxBookingsPerDay !== undefined) updateFields['services.$[elem].maxBookingsPerDay'] = maxBookingsPerDay;

		const partner = await Partner.findByIdAndUpdate(
			req.user.id,
			{ $set: updateFields },
			{
				arrayFilters: [{ 'elem._id': serviceId }],
				new: true,
			}
		).populate('services.category');

		if (!partner) {
			return res.status(404).json({
				success: false,
				message: 'Partner not found',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Service updated successfully',
			partner,
		});
	} catch (error) {
		next(error);
	}
};

// Delete Service
export const deleteService = async (req, res, next) => {
	try {
		const { serviceId } = req.params;

		const partner = await Partner.findByIdAndUpdate(
			req.user.id,
			{
				$pull: { services: { _id: serviceId } },
			},
			{ new: true }
		).populate('services.category');

		if (!partner) {
			return res.status(404).json({
				success: false,
				message: 'Partner not found',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Service deleted successfully',
			partner,
		});
	} catch (error) {
		next(error);
	}
};

// Get All Partners
export const getAllPartners = async (req, res, next) => {
	try {
		const { search, city, category, minRating, isActive } = req.query;
		let filter = { isActive: isActive !== 'false' };

		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ 'business.name': { $regex: search, $options: 'i' } },
			];
		}

		if (city) {
			filter['address.city'] = { $regex: city, $options: 'i' };
		}

		if (minRating) {
			filter.rating = { $gte: parseFloat(minRating) };
		}

		const partners = await Partner.find(filter)
			.populate('services.category')
			.sort({ rating: -1, createdAt: -1 });

		res.status(200).json({
			success: true,
			count: partners.length,
			partners,
		});
	} catch (error) {
		next(error);
	}
};

// Get Partner by ID
export const getPartnerById = async (req, res, next) => {
	try {
		const partner = await Partner.findById(req.params.id).populate('services.category');

		if (!partner) {
			return res.status(404).json({
				success: false,
				message: 'Partner not found',
			});
		}

		res.status(200).json({
			success: true,
			partner,
		});
	} catch (error) {
		next(error);
	}
};

// Delete Partner (for superadmin)
export const deletePartner = async (req, res, next) => {
	try {
		const partner = await Partner.findByIdAndDelete(req.params.id);

		if (!partner) {
			return res.status(404).json({
				success: false,
				message: 'Partner not found',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Partner deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

// Update Partner Document Status (for superadmin)
export const updateDocumentStatus = async (req, res) => {
	try {
		const { partnerId, docId } = req.params;
		const { status, rejectionReason } = req.body;

		const partner = await Partner.findById(partnerId);
		if (!partner) {
			return res.status(404).json({ success: false, message: 'Partner not found' });
		}

		const document = partner.documents.id(docId);
		if (!document) {
			return res.status(404).json({ success: false, message: 'Document not found' });
		}

		document.status = status;
		document.rejectionReason = status === 'rejected' ? rejectionReason : null;

		const allApproved = partner.documents.every(doc => doc.status === 'approved');
		const anyRejected = partner.documents.some(doc => doc.status === 'rejected');

		let finalStatus = partner.verification.status;

		if (allApproved) {
			finalStatus = 'approved';
			partner.verification = {
				status: 'approved',
				verifiedAt: new Date(),
				verifiedBy: req.user.id,
				rejectionReason: null,
			};
		}
		else if (anyRejected) {
			finalStatus = 'rejected';
			partner.verification = {
				status: 'rejected',
				verifiedAt: new Date(),
				verifiedBy: req.user.id,
				rejectionReason: 'One or more documents rejected',
			};
		}
		else {
			finalStatus = 'pending';
			partner.verification.status = 'pending';
		}


		await partner.save();

		if (allApproved || anyRejected) {
			await Notification.create({
				title:
					finalStatus === 'approved'
						? 'Verification Approved'
						: 'Verification Rejected',
				message:
					finalStatus === 'approved'
						? 'Your account has been successfully verified 🎉'
						: 'Your verification was rejected. Please review and resubmit documents.',
				type: 'verification',
				sender: {
					model: 'User',
					userId: req.user.id, // superadmin
				},
				receiver: {
					model: 'Partner',
					userId: partner._id,
				},
				related: {
					model: 'Partner',
					id: partner._id,
				},
			});
			console.log("notification created");
		}

		res.json({
			success: true,
			message: 'Document status updated',
			verificationStatus: partner.verification.status,
		});

	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Get Approved Services for Customers
export const getApprovedServices = async (req, res, next) => {
	try {
		const partners = await Partner.find({ isActive: true })
			.populate("services.category");

		// keep only approved & active services
		const filteredPartners = partners
			.map(partner => ({
				...partner.toObject(),
				services: partner.services.filter(
					service =>
						service.approvalStatus === "approved" &&
						service.isActive === true
				)
			}))
			// remove partners having no approved services
			.filter(partner => partner.services.length > 0);

		res.status(200).json({
			success: true,
			partners: filteredPartners
		});
	} catch (error) {
		next(error);
	}
};