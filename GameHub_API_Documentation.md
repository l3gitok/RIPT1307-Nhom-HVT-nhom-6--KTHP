# API Documentation for GameHub Backend

## Authentication APIs

### 1. POST /api/auth/register

- **Description**: Đăng ký người dùng mới với email và mật khẩu.
- **Request Body**:

```json
{
	"email": "user@example.com",
	"password": "password123",
	"profile": {
		"username": "user1"
	}
}
```

- **Response**:

```json
{
	"accessToken": "jwt-access-token",
	"refreshToken": "jwt-refresh-token",
	"user": {
		"_id": "user-id",
		"email": "user@example.com",
		"profile": {
			"username": "user1"
		}
	}
}
```

---

### 2. POST /api/auth/login

- **Description**: Đăng nhập người dùng với email và mật khẩu.
- **Request Body**:

```json
{
	"email": "user@example.com",
	"password": "password123"
}
```

- **Response**:

```json
{
	"accessToken": "jwt-access-token",
	"refreshToken": "jwt-refresh-token",
	"user": {
		"_id": "user-id",
		"email": "user@example.com",
		"profile": {
			"username": "user1"
		}
	}
}
```

---

### 3. GET /api/auth/google

- **Description**: Đăng nhập người dùng qua tài khoản Google.
- **Response**: Người dùng sẽ được chuyển hướng tới **Google login**.

---

### 4. GET /api/auth/google/callback

- **Description**: Callback từ Google sau khi xác thực người dùng thành công.
- **Query Parameters**:
  - `code`: Mã xác thực trả về từ Google.
- **Response**:

```json
{
	"accessToken": "jwt-access-token",
	"refreshToken": "jwt-refresh-token",
	"user": {
		"_id": "user-id",
		"email": "user@example.com",
		"profile": {
			"username": "user1"
		}
	}
}
```

---

### 5. GET /api/auth/verify-email

- **Description**: Xác nhận tài khoản qua email (OTP hoặc link xác nhận).
- **Query Parameters**:

  - `otp`: Mã OTP xác nhận tài khoản.
  - `email`: Email của người dùng cần xác nhận.

- **Response**:

```json
{
	"message": "Xác nhận tài khoản thành công"
}
```

---

### 6. POST /api/auth/refresh

- **Description**: Cấp lại Access Token mới khi Refresh Token hợp lệ.
- **Request Body**:

```json
{
	"refreshToken": "jwt-refresh-token"
}
```

- **Response**:

```json
{
	"accessToken": "jwt-access-token",
	"refreshToken": "jwt-refresh-token"
}
```

---

### 7. POST /api/auth/logout

- **Description**: Đăng xuất người dùng và xoá Refresh Token khỏi hệ thống.
- **Request Body**:
  - **Authorization Header**: `Bearer <access-token>`

---

## User APIs

### 1. GET /api/users

- **Description**: Lấy danh sách người dùng (cần quyền admin).
- **Response**:

```json
[
	{
		"_id": "user-id",
		"email": "user@example.com",
		"profile": {
			"username": "user1"
		}
	}
]
```

---

## Game APIs

### 1. GET /api/games

- **Description**: Lấy danh sách các game trong hệ thống.
- **Response**:

```json
[
	{
		"_id": "game-id",
		"title": "Game Title",
		"description": "Game description",
		"cover_url": "http://url-to-image"
	}
]
```

---

### 2. POST /api/games

- **Description**: Thêm một game mới (chỉ dành cho admin).
- **Request Body**:

```json
{
	"title": "Game Title",
	"description": "Game description",
	"cover_url": "http://url-to-image"
}
```

- **Response**:

```json
{
	"_id": "game-id",
	"title": "Game Title",
	"description": "Game description",
	"cover_url": "http://url-to-image"
}
```

---

### 3. GET /api/games/:id

- **Description**: Lấy thông tin chi tiết của một game theo ID.
- **Response**:

```json
{
	"_id": "game-id",
	"title": "Game Title",
	"description": "Game description",
	"cover_url": "http://url-to-image"
}
```

---

## Review APIs

### 1. POST /api/reviews

- **Description**: Viết review cho game (cần đăng nhập).
- **Request Body**:

```json
{
	"game_id": "game-id",
	"content": "This is a review",
	"rating": 5,
	"images": ["http://image-url"]
}
```

- **Response**:

```json
{
	"_id": "review-id",
	"game_id": "game-id",
	"content": "This is a review",
	"rating": 5,
	"images": ["http://image-url"]
}
```

---

### 2. GET /api/reviews/game/:id

- **Description**: Lấy các review cho game theo ID.
- **Response**:

```json
[
	{
		"_id": "review-id",
		"game_id": "game-id",
		"content": "This is a review",
		"rating": 5,
		"images": ["http://image-url"]
	}
]
```

---

### 3. PATCH /api/reviews/:id/status

- **Description**: Duyệt hoặc từ chối review (dành cho admin).
- **Request Body**:

```json
{
	"status": "approved" // Hoặc "rejected"
}
```

- **Response**:

```json
{
	"message": "Review status updated"
}
```

---

## Comment APIs

### 1. POST /api/comments

- **Description**: Bình luận dưới review (cần đăng nhập).
- **Request Body**:

```json
{
	"review_id": "review-id",
	"content": "This is a comment"
}
```

- **Response**:

```json
{
	"_id": "comment-id",
	"review_id": "review-id",
	"content": "This is a comment"
}
```

---

### 2. GET /api/comments/review/:id

- **Description**: Lấy các bình luận dưới review theo ID review.
- **Response**:

```json
[
	{
		"_id": "comment-id",
		"review_id": "review-id",
		"content": "This is a comment"
	}
]
```

---

## Report APIs

### 1. POST /api/reports

- **Description**: Gửi báo cáo về review hoặc game.
- **Request Body**:

```json
{
	"target_type": "review", // Hoặc "game"
	"target_id": "target-id",
	"reason": "Reason for report"
}
```

- **Response**:

```json
{
	"_id": "report-id",
	"target_type": "review",
	"target_id": "target-id",
	"reason": "Reason for report"
}
```

---

### 2. GET /api/reports/pending

- **Description**: Xem các báo cáo chưa xử lý (dành cho admin).
- **Response**:

```json
[
	{
		"_id": "report-id",
		"target_type": "review",
		"target_id": "target-id",
		"reason": "Reason for report"
	}
]
```

---

### 3. PATCH /api/reports/:id/resolve

- **Description**: Xử lý báo cáo (dành cho admin).
- **Request Body**:

```json
{
	"action": { "type": "ban", "days": 7 }
}
```

- **Response**:

```json
{
	"message": "Report resolved"
}
```

---

## File Uploads

### 1. POST /api/upload

- **Description**: Upload hình ảnh (dùng `form-data`).
- **Request Body**:

  - **Key**: `image`
  - **Value**: File image.

- **Response**:

```json
{
	"url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1633456789/image.jpg"
}
```

---

## Notes

- Các API cần **JWT token** cho các yêu cầu có bảo vệ như **/api/reviews**, **/api/comments**, **/api/reports**, và các API cần quyền admin.
- Dữ liệu trả về từ các API đều được cấu trúc theo chuẩn JSON.
- Mọi API sử dụng **HTTP Status Codes** chuẩn cho các kết quả (200, 400, 404, 500, v.v.).

---

### Các tính năng có thể mở rộng:

- **Quản lý session**: Để quản lý phiên người dùng, có thể thêm tính năng quản lý session hoặc xác thực qua cookies.
- **2FA**: Thêm xác thực hai yếu tố (2FA) cho các tài khoản người dùng.
- **WebSocket / Socket.io**: Để cung cấp thông báo real-time cho người dùng.
