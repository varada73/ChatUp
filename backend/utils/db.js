import mongoose from 'mongoose';

export const connectDB = async () => {
    const uri= process.env.MONGO_URI;
    if (!uri) {
       throw new Error('MONGO_URI is not defined in environment variables');
    }
    try{
        await mongoose.connect(uri, {dbName: 'chatty'});
        console.log('Connected to MongoDB');

    }
    catch(err){
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}