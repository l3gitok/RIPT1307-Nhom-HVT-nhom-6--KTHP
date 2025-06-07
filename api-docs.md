# 📘 GameHub API Documentation

API_URL = https://gamehubapi-test.onrender.com/

Đây là tài liệu RESTful API cho hệ thống GameHub. Tất cả API đều chạy trên nền tảng `Express + MongoDB`, sử dụng `JWT` cho xác thực.

## 🔐 Xác thực

### ▶️ Đăng ký (Register)

- **POST** `/api/auth/register`
- **Body**:

```json
{
	"email": "user@example.com",
	"password": "123456",
	"profile": { "username": "tester" }
}
```

- **Response**: `{ token, user }`

### ▶️ Đăng nhập (Login)

- **POST** `/api/auth/login`
- **Body**:

```json
{
	"email": "user@example.com",
	"password": "123456"
}
```

- **Response**: `{ token, user }`

### 🔒 Đăng xuất (Logout)

- **POST** `/api/auth/logout`
- **Header**: `Authorization: Bearer <token>`

---

## 🎮 Games

### ▶️ Lấy danh sách game

- **GET** `/api/games`

### ▶️ Thêm game (admin only)

- **POST** `/api/games`
- **Header**: `Authorization: Bearer <admin_token>`
- **Body**:

```json
{
	"title": "Cyberpunk 2077",
	"description": "Futuristic RPG",
	"cover_url": "https://..."
}
```

---

## 📝 Reviews

### ▶️ Viết review

- **POST** `/api/reviews`
- **Header**: `Authorization: Bearer <token>`
- **Body**:

```json
{
	"game_id": "<game_id>",
	"content": "Game quá hay!",
	"rating": 5,
	"images": []
}
```

### ▶️ Lấy review theo game

- **GET** `/api/reviews/game/:gameId`

### ▶️ Admin duyệt review

- **PATCH** `/api/reviews/:reviewId/status`
- **Header**: `Authorization: Bearer <admin_token>`
- **Body**: `{ "status": "approved" }`

---

## 💬 Comments

### ▶️ Viết bình luận

- **POST** `/api/comments`
- **Header**: `Authorization: Bearer <token>`
- **Body**:

```json
{
	"review_id": "<review_id>",
	"content": "Đồng ý với bạn!"
}
```

### ▶️ Lấy comment theo review

- **GET** `/api/comments/review/:reviewId`

---

## 🚩 Reports

### ▶️ Gửi báo cáo

- **POST** `/api/reports`
- **Header**: `Authorization: Bearer <token>`
- **Body**:

```json
{
	"target_type": "review",
	"target_id": "<review_id>",
	"reason": "Nội dung không phù hợp"
}
```

### ▶️ Admin xem report chưa xử lý

- **GET** `/api/reports/pending`
- **Header**: `Authorization: Bearer <admin_token>`

### ▶️ Admin xử lý report

- **PATCH** `/api/reports/:reportId/resolve`
- **Header**: `Authorization: Bearer <admin_token>`
- **Body**:

```json
{
	"action": { "type": "ban", "days": 7 }
}
```

---

## 🔔 Notifications

### ▶️ Lấy danh sách thông báo

- **GET** `/api/notifications`
- **Header**: `Authorization: Bearer <token>`

### ▶️ Đánh dấu đã đọc

- **PATCH** `/api/notifications/:id/read`
- **Header**: `Authorization: Bearer <token>`

---

## ☁️ Upload ảnh

### ▶️ Upload ảnh Cloudinary

- **POST** `/api/upload`
- **Header**: `Authorization: Bearer <token>`
- **Body (form-data)**:

  - `image`: (file)

- **Response**:

```json
{ "url": "https://res.cloudinary.com/..." }
```

---

## 🧪 Test nhanh (Postman)

- Đăng nhập để lấy token → thêm vào Header `Authorization`
- Gọi các API khác để test flow: review, comment, report, upload

---

## 📌 Ghi chú

- Tất cả API sử dụng `application/json` trừ upload (form-data)
- Các API `POST`, `PATCH`, `DELETE` đều yêu cầu token (trừ login/register)
