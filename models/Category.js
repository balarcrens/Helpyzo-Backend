import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide category name'],
			unique: true,
			trim: true,
			minlength: 2,
			maxlength: 50,
		},
		description: {
			type: String,
			trim: true,
			maxlength: 300,
		},
		image: {
			type: String, // Data URL or URL
			required: [true, 'Category image is required'],
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		sortOrder: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

export default mongoose.model('Category', categorySchema);