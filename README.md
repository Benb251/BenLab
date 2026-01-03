<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BenLab - The Noir Experience

Một ứng dụng web đậm chất điện ảnh (Cinematic AI) cho phép tạo hình ảnh nghệ thuật sử dụng sức mạnh của Google Gemini và Imagen. Giao diện được thiết kế theo phong cách Noir, tối giản và hiện đại.

Xem ứng dụng trên AI Studio: https://ai.studio/apps/drive/1cOtwNSgRkF7n0CRR4jBUFgBb7NzHcr3N

## 🌟 Tính Năng Chính

- **Tạo Ảnh AI**: Tích hợp Google Gemini và Imagen để tạo ảnh chất lượng cao từ văn bản (Prompt).
- **Giao Diện Cinematic**: Thiết kế tối (Dark Mode), hiệu ứng chuyển động mượt mà với Framer Motion và âm thanh tương tác.
- **Thư Viện & Lưu Trữ**: 
  - Lưu lịch sử tạo ảnh vào IndexedDB ngay trên trình duyệt.
  - Hỗ trợ Xuất (Export) và Nhập (Import) dữ liệu backup (file JSON).
  - Xóa/Quản lý ảnh đã tạo.
- **Tùy Chỉnh**:
  - Cài đặt tỷ lệ khung hình (Aspect Ratio).
  - Negative Prompt tự động.
  - Bật/Tắt âm thanh giao diện.

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, Vite
- **Styling**: TailwindCSS, Lucide React (Icons)
- **Animation**: Framer Motion
- **AI SDK**: Google GenAI SDK (`@google/genai`)
- **State Management**: Zustand
- **Local Database**: IndexedDB

## 🚀 Cài Đặt và Chạy Local

**Yêu cầu:** Đã cài đặt [Node.js](https://nodejs.org/).

1. **Cài đặt thư viện:**
   Mở terminal và chạy lệnh:
   ```bash
   npm install
   ```

2. **Cấu hình môi trường:**
   - Mở file `.env.local`
   - Điền API Key của bạn vào biến `GEMINI_API_KEY`:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```
   Truy cập vào địa chỉ `http://localhost:3000` (hoặc cổng được hiển thị trên terminal).

## 📂 Cấu Trúc Dự Án

- `src/components`: Các thành phần giao diện (UI Components).
- `src/services`: Xử lý gọi API Gemini/Imagen.
- `src/store`: Quản lý trạng thái ứng dụng (Zustand).
- `src/lib`: Các hàm tiện ích và xử lý Database (db.ts).

---
<div align="center">
  <sub>Built with ❤️ using Google Gemini API</sub>
</div>
