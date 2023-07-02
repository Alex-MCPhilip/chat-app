
const mongoose = require('mongoose')

const connectDatabase = () =>{
    
    const url = process.env.DB_UR
    // const url = 'mongodb+srv://booking:MLka4o5XuZczHJW6@cluster0.so3huy7.mongodb.net/Do-An?retryWrites=true&w=majority'

    // Kết nối đến cơ sở dữ liệu MongoDB
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Đã kết nối đến MongoDB'))
    .catch(err => console.log('Lỗi kết nối đến MongoDB:', err));
} 

module.exports = connectDatabase 