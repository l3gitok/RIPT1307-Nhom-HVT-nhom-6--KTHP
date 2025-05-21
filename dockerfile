# Sử dụng Node.js LTS
FROM node:20-slim

# Đặt thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install && npm audit fix --force || true

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose port (dùng biến môi trường PORT nếu có)
EXPOSE 5000

# Chạy ứng dụng
CMD ["npm", "run", "dev"]