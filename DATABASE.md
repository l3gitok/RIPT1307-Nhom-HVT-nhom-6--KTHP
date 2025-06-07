# GameHub Database Documentation

## Tổng quan

GameHub sử dụng MongoDB làm cơ sở dữ liệu chính, với Mongoose làm ODM (Object Document Mapper). Database được thiết kế theo mô hình NoSQL, cho phép linh hoạt trong việc lưu trữ và truy vấn dữ liệu.

## Collections

### 1. Users

Collection lưu trữ thông tin người dùng.

```javascript
{
  email: String,              // Email (unique, required)
  hashed_password: String,    // Mật khẩu đã hash
  google_id: String,          // ID từ Google OAuth
  role: String,               // 'user' hoặc 'admin'
  profile: {
    username: String,         // Tên người dùng
    avatar_url: String,       // URL avatar
    cover_url: String         // URL ảnh bìa
  },
  followers: [ObjectId],      // Danh sách người theo dõi
  following: [ObjectId],      // Danh sách đang theo dõi
  is_verified: Boolean,       // Trạng thái xác thực email
  status: String,             // 'active', 'banned', 'deleted'
  ban_info: {
    reason: String,           // Lý do bị ban
    description: String,      // Mô tả chi tiết
    banned_by: ObjectId,      // Người ban
    banned_at: Date,          // Thời gian ban
    ban_expires_at: Date      // Thời gian hết hạn ban
  },
  report_count: Number,       // Số lần bị báo cáo
  created_at: Date,
  updated_at: Date
}
```

### 2. Games

Collection lưu trữ thông tin game.

```javascript
{
  title: String,              // Tên game (required)
  description: String,        // Mô tả game
  cover_url: String,          // URL ảnh bìa
  release_date: Date,         // Ngày phát hành
  genres: [String],           // Thể loại game
  platforms: [String],        // Nền tảng
  rating: Number,             // Điểm đánh giá trung bình
  metacritic: Number,         // Điểm Metacritic
  esrb_rating: String,        // Độ tuổi
  developer: [String],        // Nhà phát triển
  publisher: [String],        // Nhà phát hành
  rawg_id: Number,            // ID từ RAWG API
  slug: String,               // Slug từ RAWG
  approved: Boolean,          // Trạng thái phê duyệt
  created_by: ObjectId,       // Người tạo
  created_at: Date,
  updated_at: Date
}
```

### 3. Reviews

Collection lưu trữ đánh giá game.

```javascript
{
  content: String,            // Nội dung review (10-2000 ký tự)
  rating: Number,             // Điểm đánh giá (1-5)
  images: [String],           // Danh sách ảnh
  game_id: ObjectId,          // ID game
  author_id: ObjectId,        // ID người viết
  status: String,             // 'pending', 'approved', 'rejected'
  likes: [{                   // Danh sách like
    user_id: ObjectId,
    created_at: Date
  }],
  replies: [{                 // Danh sách reply
    user_id: ObjectId,
    content: String,
    created_at: Date
  }],
  helpful_count: Number,      // Số lượt đánh giá hữu ích
  is_featured: Boolean,       // Review nổi bật
  created_at: Date,
  updated_at: Date
}
```

### 4. Comments

Collection lưu trữ bình luận cho review.

```javascript
{
  review_id: ObjectId,        // ID review
  author_id: ObjectId,        // ID người bình luận
  content: String,            // Nội dung (1-500 ký tự)
  parent_id: ObjectId,        // ID comment cha (cho reply)
  level: Number,              // Cấp độ của comment
  status: String,             // 'pending', 'approved', 'rejected'
  reports: [{                 // Danh sách báo cáo
    user_id: ObjectId,
    reason: String,
    description: String,
    created_at: Date,
    status: String
  }],
  likes: [{                   // Danh sách like
    user_id: ObjectId,
    created_at: Date
  }],
  created_at: Date,
  updated_at: Date
}
```

### 5. Notifications

Collection lưu trữ thông báo.

```javascript
{
  user_id: ObjectId,          // ID người nhận
  type: String,               // Loại thông báo
  payload: Mixed,             // Dữ liệu bổ sung
  read: Boolean,              // Trạng thái đã đọc
  created_at: Date,
  updated_at: Date
}
```

### 6. Follows

Collection lưu trữ mối quan hệ follow.

```javascript
{
  follower: ObjectId,         // ID người follow
  following: ObjectId,        // ID người được follow
  created_at: Date,
  updated_at: Date
}
```

### 7. UserReports

Collection lưu trữ báo cáo người dùng.

```javascript
{
  reported_user_id: ObjectId, // ID người bị báo cáo
  reporter_id: ObjectId,      // ID người báo cáo
  reason: String,             // Lý do báo cáo
  description: String,        // Mô tả chi tiết
  evidence: [{                // Bằng chứng
    type: String,             // 'image', 'link', 'text'
    content: String,
    created_at: Date
  }],
  status: String,             // 'pending', 'resolved', 'rejected'
  admin_note: String,         // Ghi chú của admin
  resolved_by: ObjectId,      // ID admin xử lý
  resolved_at: Date,          // Thời gian xử lý
  created_at: Date,
  updated_at: Date
}
```

## Indexes

### Users

- `email`: unique index
- `google_id`: unique index
- `status`: index
- `created_at`: index

### Games

- `title`: text index
- `genres`: index
- `platforms`: index
- `approved`: index
- `created_at`: index

### Reviews

- `game_id`: compound index với status
- `author_id`: index
- `created_at`: index
- `rating`: index

### Comments

- `review_id`: compound index với status
- `author_id`: index
- `parent_id`: index
- `created_at`: index
- `likes.user_id`: index
- `reports.user_id`: index
- `reports.status`: index

### Notifications

- `user_id`: compound index với created_at
- `user_id`: compound index với read
- `created_at`: index

### Follows

- `follower`: compound index với following (unique)
- `following`: compound index với created_at
- `follower`: compound index với created_at

### UserReports

- `reported_user_id`: compound index với status
- `reporter_id`: index
- `status`: index
- `created_at`: index

## Relationships

1. **User - Game**

   - One-to-Many: Một user có thể tạo nhiều game
   - `Game.created_by` references `User._id`

2. **User - Review**

   - One-to-Many: Một user có thể viết nhiều review
   - `Review.author_id` references `User._id`

3. **Game - Review**

   - One-to-Many: Một game có thể có nhiều review
   - `Review.game_id` references `Game._id`

4. **Review - Comment**

   - One-to-Many: Một review có thể có nhiều comment
   - `Comment.review_id` references `Review._id`

5. **User - Comment**

   - One-to-Many: Một user có thể viết nhiều comment
   - `Comment.author_id` references `User._id`

6. **User - User (Follow)**

   - Many-to-Many: Users có thể follow lẫn nhau
   - `Follow.follower` và `Follow.following` references `User._id`

7. **User - Notification**

   - One-to-Many: Một user có thể có nhiều notification
   - `Notification.user_id` references `User._id`

8. **User - UserReport**
   - Many-to-Many: Users có thể báo cáo lẫn nhau
   - `UserReport.reported_user_id` và `UserReport.reporter_id` references `User._id`

## Validation Rules

1. **Users**

   - Email phải hợp lệ và unique
   - Password bắt buộc nếu không có google_id
   - Role phải là 'user' hoặc 'admin'
   - Status phải là 'active', 'banned', hoặc 'deleted'

2. **Games**

   - Title bắt buộc
   - Rating phải từ 0-5
   - Rawg_id phải unique

3. **Reviews**

   - Content phải từ 10-2000 ký tự
   - Rating phải từ 1-5
   - Không thể review cùng một game nhiều lần
   - Images phải là URL hợp lệ

4. **Comments**

   - Content phải từ 1-500 ký tự
   - Level tự động tính dựa trên parent_id
   - Không thể reply quá 3 cấp

5. **UserReports**
   - Description tối đa 500 ký tự
   - Reason phải thuộc danh sách cho phép
   - Evidence phải có type hợp lệ

## Timestamps

Tất cả các collections đều có timestamps tự động:

- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật gần nhất
