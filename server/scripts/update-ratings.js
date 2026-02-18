import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Rating from '../models/Rating.js';
import Product from '../models/Product.js';

dotenv.config();

const updateProductRatings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;

    for (const product of products) {
      // Calculate rating stats from ratings collection
      const stats = await Rating.aggregate([
        { $match: { product: product._id } },
        {
          $group: {
            _id: '$product',
            averageRating: { $avg: '$rating' },
            totalRatings: { $sum: 1 }
          }
        }
      ]);

      const avgRating = stats[0]?.averageRating || 0;
      const totalRatings = stats[0]?.totalRatings || 0;

      // Update product
      await Product.findByIdAndUpdate(product._id, {
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings,
        updatedAt: new Date()
      });

      if (totalRatings > 0) {
        console.log(`Updated: ${product.name} - Rating: ${avgRating.toFixed(1)}, Reviews: ${totalRatings}`);
        updatedCount++;
      }
    }

    console.log(`\n✅ Updated ${updatedCount} products with ratings`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateProductRatings();
