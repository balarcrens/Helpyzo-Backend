import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import Partner from '../models/Partner.js';

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, config.jwtSecret, { expiresIn: config.jwtExpire });
};

// Register User
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password, address, role, profileImage } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
            address,
            role: role || 'client',
            profileImage,
        });

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// Login User
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const isPasswordMatched = await user.matchPassword(password);

        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// Get User Profile
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

// Update User Profile
export const updateUserProfile = async (req, res, next) => {
    try {
        const { name, phone, address, profileImage } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone, address, profileImage },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user,
        });
    } catch (error) {
        next(error);
    }
};

// Change Password
export const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        const isPasswordMatched = await user.matchPassword(oldPassword);

        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: 'Old password is incorrect',
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Get All Users (for superadmin)
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        next(error);
    }
};

// Delete User
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Update Service Approval Status (for superadmin)
export const updateServiceApprovalStatus = async (req, res, next) => {
    try {
        const { partnerId, serviceId } = req.params;
        const { approvalStatus, rejectionReason } = req.body;
        
        const partner = await Partner.findById(partnerId);
        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }

        const service = partner.services.id(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        service.approvalStatus = approvalStatus;
        if (approvalStatus === 'rejected') {
            service.rejectionReason = rejectionReason;
        } else {
            service.rejectionReason = undefined;
        }

        await partner.save();

        res.status(200).json({
            success: true,
            message: 'Service approval status updated successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}