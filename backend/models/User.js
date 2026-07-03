import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    connectCode:{
        type: String,
        required: true,
        unique: true
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 30,
},
username:{
    type: String,
    required: true,
    minLength: 3,
    maxLength: 30,
    unique: true,
    trim: true,
},
email:{
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
},
password:{
    type: String,
    required: true,    
    minLength: 6,

}
});
const User = mongoose.model('User', userSchema);
export default User;