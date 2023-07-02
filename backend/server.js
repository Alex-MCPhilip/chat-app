const express = require('express')


const app = express()



const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const ws = require("ws")
const connectDatabase = require("./db/Database");




app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname,"./uploads")));


app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));


// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}


// cho phép máy chủ này kết lấy dữ liệu từ phía server
app.use(cors({
  // origin: 'http://localhost:5173',
  origin: process.env.CLIENT_URL,
  credentials: true
}));  

// import routes
const user = require("./controller/user");
const message = require("./controller/message");


app.use("/api/v2/user", user);
app.use("/api/v2/message", message);





app.get('/', (req, res) => {
  res.send('Hello World!')
})



// connect db
connectDatabase();


// create server
const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server được chạy trên cổng: http://localhost:${process.env.PORT}`
  );
});



const wss = new ws.WebSocketServer({ server });

// Xử lý kết nối mới
wss.on('connection', (connection, req) => {

  // Kiểm tra và thông báo về người dùng đang trực tuyến
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username })),
      }));
    });
  }

  connection.isAlive = true;

  // Kiểm tra tính sống còn của kết nối
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('dead');
    }, 1000);
  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });

  // Đọc thông tin người dùng từ cookie của kết nối
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  // Xử lý tin nhắn từ người dùng
  connection.on('message', async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let filename = null;
    if (file) {
      console.log('size', file.data.length);
      const parts = file.name.split('.');
      const ext = parts[parts.length - 1];
      filename = Date.now() + '.' + ext;
      const path = __dirname + '/uploads/' + filename;
      const bufferData = new Buffer(file.data.split(',')[1], 'base64');
      fs.writeFile(path, bufferData, () => {
        console.log('file saved:' + path);
      });
    }
    if (recipient && (text || file)) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });
      console.log('created message');
      [...wss.clients]
        .filter(c => c.userId === recipient)
        .forEach(c => c.send(JSON.stringify({
          text,
          sender: connection.userId,
          recipient,
          file: file ? filename : null,
          _id: messageDoc._id,
        })));
    }
  });

  // Thông báo về người dùng đang trực tuyến khi có kết nối mới
  notifyAboutOnlinePeople();
});









// Để viết một đoạn code tương tự như trên, bạn cần cung cấp các yêu cầu cụ thể để tôi có thể đáp ứng được mong đợi của bạn. Dưới đây là một số yêu cầu cần thiết để bắt đầu:

// Yêu cầu về công nghệ sử dụng: Bạn muốn sử dụng Node.js hay một ngôn ngữ lập trình khác?
// Yêu cầu về cơ sở dữ liệu: Bạn sẽ sử dụng cơ sở dữ liệu nào để lưu trữ thông tin người dùng và tin nhắn?
// Yêu cầu về giao diện người dùng: Bạn muốn tích hợp trò chuyện thời gian thực vào một ứng dụng web hiện có hay bạn chỉ cần một phần mềm dòng lệnh đơn giản?
// Yêu cầu về xác thực và bảo mật: Bạn có yêu cầu xác thực người dùng và bảo mật kết nối WebSocket không?
// Vui lòng cung cấp thông tin chi tiết về yêu cầu của bạn để tôi có thể giúp bạn viết mã tương ứng.
