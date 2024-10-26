# Tool Auto BIRDS-SUI sử dụng Node.js (Hỗ trợ cả Không có Proxy và Proxy)

## Mô tả
Auto BIRDS là một tập lệnh được phát triển bằng Node.js để tự động hóa các tác vụ trong trò chơi BIRDS. Công cụ này cung cấp các tính năng chính sau:

- ✔️ Tự động bắt sâu
- ✔️ Tự động đập trứng
- ✔️ Tự động nâng cấp
- ✔️ Nhiệm vụ tự động (tự động thực hiện một số tác vụ, một số có thể không được hỗ trợ)
- ✔️ Tự động tham gia guild
- 🚫 Nhiệm vụ hàng ngày hiện chưa được hỗ trợ, chúng sẽ được đưa vào các phiên bản sắp tới.

## Yêu cầu

- Node.js phải được cài đặt trên hệ thống của bạn.

## Hướng dẫn cài đặt

1. **Cài đặt các mô-đun cần thiết**
Chạy lệnh sau để cài đặt các mô-đun Node.js cần thiết:
   ```bash
   npm install
2. **Tạo tệp dữ liệu**
Tạo hai tệp có tên data.txt và proxy.txt:

- data.txt:
   - Tệp này phải bao gồm định dạng query_id=xxx hoặc user=xxxx
- proxy.txt (Chỉ tạo nếu sử dụng nhiều tài khoản):
   - Định dạng proxy phải là: http://user:pass@ip:port
   - Nếu bạn chỉ sử dụng một tài khoản, không cần tạo tệp này.
## Chạy tool

- Nếu không sử dụng proxy, hãy chạy lệnh sau:
   ```bash
   node birds.js
- Nếu sử dụng proxy, hãy chạy lệnh:
   ```bash
   node birds-proxy.js
## Lưu ý
- Thay thế mã giới thiệu
Trong mã nguồn của công cụ, hãy tìm và thay thế mã giới thiệu bằng:

- Nhấn Ctrl + F để tìm kiếm từ khóa 376905749 và thay thế bằng liên kết giới thiệu hoặc ID người dùng của bạn.
- [Đăng ký BirdX](https://t.me/birdx2_bot/birdx?startapp=1288479303)

## Định dạng tệp
- Định dạng tệp data.txt:

   ```bash
   query_id=xxx
- hoặc

   ```bash
   user=xxxx
- Định dạng tệp proxy.txt (nếu sử dụng proxy):

   ```text
   http://user:pass@ip:port
