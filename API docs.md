# GameHub API Documentation

## Giới thiệu

GameHub là một nền tảng chia sẻ và đánh giá game, cho phép người dùng tương tác, review và theo dõi lẫn nhau.

## Cài đặt

```bash
# Clone repository
git clone <repository_url>

# Di chuyển vào thư mục project
cd gamehub-backend

# Cài đặt dependencies
npm install

# Tạo file .env và cấu hình
cp .env.example .env

# Chạy server
npm run dev
```

## Cấu trúc Project

```
gamehub-backend/
├── config/         # Cấu hình database, passport, socket.io
├── controllers/    # Xử lý logic cho các routes
├── middlewares/    # Middleware functions
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── server.js       # Entry point
```

## Base URL

```
http://localhost:5000/api
```

## Authentication

Tất cả các API yêu cầu xác thực (trừ các API public) cần gửi kèm token trong header:

```
Authorization: Bearer <your_token>
```

## API Endpoints

### 1. Authentication API

#### 1.1 Public Routes

##### Đăng ký tài khoản

```http
POST /auth/register
```

**Body:**

```json
{
	"email": "user@example.com",
	"password": "password123",
	"username": "username"
}
```

##### Đăng nhập

```http
POST /auth/login
```

**Body:**

```json
{
	"email": "user@example.com",
	"password": "password123"
}
```

##### Đăng nhập bằng Google

```http
GET /auth/google
```

##### Xác nhận email

```http
GET /auth/verify-email?token=<otp_token>
```

##### Quên mật khẩu

```http
POST /auth/forgot-password
```

**Body:**

```json
{
	"email": "user@example.com"
}
```

##### Đặt lại mật khẩu

```http
POST /auth/reset-password
```

**Body:**

```json
{
	"token": "reset_token",
	"newPassword": "new_password"
}
```

##### Refresh Token

```http
POST /auth/refresh
```

**Body:**

```json
{
	"refreshToken": "your_refresh_token"
}
```

#### 1.2 Protected Routes

##### Lấy thông tin user hiện tại

```http
GET /auth/me
```

##### Lấy thông tin user theo ID

```http
GET /auth/user/:id
```

##### Cập nhật profile

```http
PUT /auth/profile
```

**Body:**

```json
{
	"username": "new_username",
	"avatar": "avatar_url"
}
```

#### 1.3 Admin Routes

##### Lấy danh sách tất cả users

```http
GET /auth/users
```

### 2. Game API

#### 2.1 Public Routes

##### Lấy danh sách games

```http
GET /games
```

**Query Parameters:**

- `page`: Số trang (mặc định: 1)
- `limit`: Số item mỗi trang (mặc định: 10)
- `sort`: Sắp xếp theo (ví dụ: -created_at)
- `search`: Tìm kiếm theo tên

##### Lấy games theo thể loại

```http
GET /games/genre/:genre
```

##### Lấy games theo platform

```http
GET /games/platform/:platform
```

##### Lấy thông tin game theo ID

```http
GET /games/:id
```

##### Lấy thông tin game theo slug

```http
GET /games/slug/:slug
```

#### 2.2 Protected Routes

##### Tạo game mới

```http
POST /games
```

**Body:**

```json
{
	"title": "Game Title",
	"description": "Game Description",
	"genre": "Action",
	"platform": "PC",
	"images": ["url1", "url2"]
}
```

##### Cập nhật game

```http
PATCH /games/:id
```

**Body:**

```json
{
	"title": "Updated Title",
	"description": "Updated Description"
}
```

##### Xóa game

```http
DELETE /games/:id
```

#### 2.3 Moderator Routes

##### Phê duyệt game

```http
PATCH /games/:id/approve
```

**Body:**

```json
{
	"status": "approved"
}
```

### 3. Review API

#### 3.1 Public Routes

##### Lấy danh sách reviews

```http
GET /reviews
```

**Query Parameters:**

- `page`: Số trang
- `limit`: Số item mỗi trang
- `gameId`: Lọc theo game
- `userId`: Lọc theo user

##### Lấy thông tin review

```http
GET /reviews/:id
```

##### Lấy reviews của game

```http
GET /reviews/game/:gameId
```

##### Lấy reviews của user

```http
GET /reviews/user/:userId
```

#### 3.2 Protected Routes

##### Tạo review mới

```http
POST /reviews
```

**Body:**

```json
{
	"gameId": "game_id",
	"content": "Review content",
	"rating": 5,
	"images": ["url1", "url2"]
}
```

##### Cập nhật review

```http
PUT /reviews/:id
```

**Body:**

```json
{
	"content": "Updated content",
	"rating": 4
}
```

##### Xóa review

```http
DELETE /reviews/:id
```

##### Like/Unlike review

```http
POST /reviews/:id/like
```

##### Thêm reply cho review

```http
POST /reviews/:id/reply
```

**Body:**

```json
{
	"content": "Reply content"
}
```

### 4. Comment API

#### 4.1 Public Routes

##### Lấy comments của review

```http
GET /comments/review/:reviewId
```

##### Lấy thông tin comment

```http
GET /comments/:id
```

#### 4.2 Protected Routes

##### Tạo comment mới

```http
POST /comments
```

**Body:**

```json
{
	"reviewId": "review_id",
	"content": "Comment content"
}
```

##### Cập nhật comment

```http
PUT /comments/:id
```

**Body:**

```json
{
	"content": "Updated content"
}
```

##### Xóa comment

```http
DELETE /comments/:id
```

##### Like/Unlike comment

```http
POST /comments/:id/like
```

##### Thêm reply cho comment

```http
POST /comments/:id/reply
```

**Body:**

```json
{
	"content": "Reply content"
}
```

### 5. Notification API

#### 5.1 Protected Routes

##### Lấy danh sách thông báo

```http
GET /notifications
```

**Query Parameters:**

- `page`: Số trang
- `limit`: Số item mỗi trang

##### Lấy số lượng thông báo chưa đọc

```http
GET /notifications/unread/count
```

##### Đánh dấu thông báo đã đọc

```http
PATCH /notifications/:notificationId/read
```

##### Đánh dấu tất cả thông báo đã đọc

```http
PATCH /notifications/read-all
```

##### Xóa thông báo

```http
DELETE /notifications/:notificationId
```

##### Xóa tất cả thông báo

```http
DELETE /notifications
```

### 6. Follow API

#### 6.1 Protected Routes

##### Follow user

```http
POST /followers/:userId
```

##### Unfollow user

```http
DELETE /followers/:userId
```

##### Lấy danh sách following

```http
GET /followers/following
```

**Query Parameters:**

- `page`: Số trang
- `limit`: Số item mỗi trang

##### Lấy danh sách followers

```http
GET /followers/followers
```

**Query Parameters:**

- `page`: Số trang
- `limit`: Số item mỗi trang

##### Kiểm tra trạng thái follow

```http
GET /followers/status/:userId
```

##### Lấy số lượng following và followers

```http
GET /followers/counts
```

### 7. Upload API

#### 7.1 Protected Routes

##### Upload ảnh

```http
POST /upload/image
```

**Form Data:**

- `image`: File ảnh

##### Upload avatar

```http
POST /upload/avatar
```

**Form Data:**

- `avatar`: File ảnh

##### Upload nhiều ảnh

```http
POST /upload/images
```

**Form Data:**

- `images`: Nhiều file ảnh (tối đa 10)

##### Xóa ảnh

```http
DELETE /upload/:public_id
```

## Response Format

### Success Response

```json
{
	"success": true,
	"data": {
		// Response data
	}
}
```

### Error Response

```json
{
	"success": false,
	"message": "Error message",
	"errors": [
		// Validation errors
	]
}
```

## Error Codes

- `400`: Bad Request - Yêu cầu không hợp lệ
- `401`: Unauthorized - Chưa xác thực
- `403`: Forbidden - Không có quyền truy cập
- `404`: Not Found - Không tìm thấy tài nguyên
- `500`: Internal Server Error - Lỗi server

## Socket.IO Events

### Kết nối

```javascript
socket.on('connect', () => {
	console.log('Connected to server');
});
```

### Thông báo mới

```javascript
socket.on('notification', (notification) => {
	console.log('New notification:', notification);
});
```

### Tin nhắn mới

```javascript
socket.on('newMessage', (message) => {
	console.log('New message:', message);
});
```

### Follow mới

```javascript
socket.on('newFollower', (follower) => {
	console.log('New follower:', follower);
});
```

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gamehub
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT License
