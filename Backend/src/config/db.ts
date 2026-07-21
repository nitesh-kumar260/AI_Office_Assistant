import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_office_assistant';
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('================================================================');
    console.error('WARNING: MongoDB Connection Error!');
    console.error(`Error details: ${(error as Error).message}`);
    console.error('If you are using MongoDB Atlas, make sure your current IP address is whitelisted:');
    console.error('https://www.mongodb.com/docs/atlas/security-whitelist/');
    console.error('================================================================');
  }
};
export default connectDB;
