
# 🎮 GameHub Backend

GameHub là một nền tảng cho phép người dùng đánh giá, viết review và tương tác với các trò chơi. Hệ thống backend được xây dựng bằng **Node.js**, **Express**, **MongoDB**, hỗ trợ **JWT Auth**, **Cloudinary Upload**, **Socket.IO Real-time**, phân quyền **Admin/User**, và RESTful APIs đầy đủ.

---

## 🚀 Công nghệ sử dụng

- Node.js + Express
- MongoDB (Atlas)
- Mongoose
- JWT (JSON Web Token)
- Bcrypt.js
- Socket.IO (realtime notification)
- Cloudinary (upload ảnh)
- Multer (middleware upload)
- dotenv (biến môi trường)
- CORS, Helmet, Rate Limit (bảo mật)

---

## 📁 Cấu trúc thư mục chính

```
gamehub-backend/
├── config/             # Cấu hình DB, socket, cloudinary
├── controllers/        # Xử lý request
├── services/           # Xử lý logic nghiệp vụ
├── models/             # Mongoose schema
├── routes/             # Định tuyến API
├── middlewares/        # Auth, role, upload
├── utils/              # JWT, slug, helper
├── .env                # Biến môi trường (KHÔNG commit)
├── server.js           # File khởi động chính
```

---

## ✅ Tính năng đã hoàn thiện

| Tính năng | Mô tả |
|----------|-------|
| Auth     | Đăng ký, đăng nhập, logout, phân quyền admin/user |
| Game     | Thêm, xem game (admin thêm) |
| Review   | Viết review, duyệt review (admin) |
| Comment  | Bình luận dưới review |
| Report   | Báo cáo review/user, admin xử lý |
| Notification | Thông báo khi duyệt review, realtime bằng Socket.IO |
| Upload   | API upload ảnh lên Cloudinary |

---

## 🔐 Phân quyền

- `user`: có thể viết review, comment, report
- `admin`: duyệt review, xử lý report, thêm game
- Phân quyền bằng middleware `verifyToken`, `requireRole`

---

## 🌐 Các API chính

| Method | Endpoint                 | Bảo vệ     | Mô tả |
|--------|--------------------------|------------|------|
| POST   | `/api/auth/register`     | ❌         | Đăng ký |
| POST   | `/api/auth/login`        | ❌         | Đăng nhập |
| GET    | `/api/games`             | ❌         | Lấy danh sách game |
| POST   | `/api/games`             | ✅ (admin) | Tạo game |
| POST   | `/api/reviews`           | ✅         | Tạo review |
| GET    | `/api/reviews/game/:id`  | ❌         | Lấy review theo game |
| PATCH  | `/api/reviews/:id/status`| ✅ (admin) | Duyệt / từ chối review |
| POST   | `/api/comments`          | ✅         | Bình luận review |
| GET    | `/api/comments/review/:id`| ❌        | Lấy comment theo review |
| POST   | `/api/reports`           | ✅         | Gửi báo cáo |
| GET    | `/api/reports/pending`   | ✅ (admin) | Xem báo cáo chưa xử lý |
| PATCH  | `/api/reports/:id/resolve`| ✅ (admin)| Xử lý báo cáo |
| GET    | `/api/notifications`     | ✅         | Lấy danh sách thông báo |
| POST   | `/api/upload`            | ✅         | Upload ảnh (form-data)

---

## ⚙️ Thiết lập môi trường `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## ▶️ Chạy local

```bash
npm install
npm run dev
```

---

## 🧪 Test nhanh

Dùng Postman:
- `POST /api/auth/login` → lấy token
- Thêm token vào `Authorization: Bearer <token>`
- Gửi `POST /api/upload` với `form-data > image (file)`

---

## 📦 Ghi chú cho nhóm

- Tất cả route đều đã chia controller/service rõ ràng
- Socket.IO đã tích hợp xong, client cần `join(userId)` sau login
- Cấu trúc có thể dễ dàng mở rộng thêm module `like`, `dashboard`, `export excel`
- Vui lòng KHÔNG commit file `.env` lên GitHub

---

## ✨ Đóng góp

Team GameHub backend rất khuyến khích review, tối ưu hoá thêm các module. Mọi thành viên đều có thể:
- Mở PR để thêm tính năng
- Đề xuất qua issues
- Viết docs mở rộng nếu cần

---

## 📞 Hỗ trợ

Mọi thắc mắc kỹ thuật, liên hệ với backend lead hoặc mở issue trong repo.

---


![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/l3gitok/RIPT1307-Nhom-HVT-nhom-6--KTHP?utm_source=oss&utm_medium=github&utm_campaign=l3gitok%2FRIPT1307-Nhom-HVT-nhom-6--KTHP&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
