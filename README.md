# register-login-firebase

A simple registration, login, and profile website using HTML, CSS, JavaScript, and Firebase Authentication + Firestore.

## Project Structure
- `assets/` - images and other static assets
- `css/` - shared styles
- `js/` - application logic for auth and profile validation
- `pages/` - `login.html`, `register.html`, `profile.html`
- `firebase.json` - Firebase Hosting and Firestore settings
- `.firebaserc` - linked Firebase project

## Features
- Real-time registration validation
- Email/password authentication
- Profile page with editable details
- Firebase Hosting deployment support

## Hướng dẫn cài đặt và chạy dự án cục bộ

Để chạy dự án này trên máy tính của bạn, hãy làm theo các bước sau:

1.  **Clone Repository:**
    Mở terminal hoặc command prompt và clone dự án về máy của bạn:
    ```bash
    git clone https://github.com/LucioKaidener/register-login-firebase.git
    cd register-login-firebase
    ```

2.  **Cài đặt Node.js và npm:**
    Đảm bảo bạn đã cài đặt Node.js và npm (Node Package Manager) trên máy tính của mình. Bạn có thể tải xuống từ trang web chính thức của Node.js: [https://nodejs.org/](https://nodejs.org/)

3.  **Cài đặt Firebase CLI:**
    Nếu bạn chưa có, hãy cài đặt Firebase Command Line Interface (CLI) toàn cục:
    ```bash
    npm install -g firebase-tools
    ```

4.  **Đăng nhập vào Firebase:**
    Đăng nhập vào tài khoản Firebase của bạn thông qua CLI:
    ```bash
    firebase login
    ```

5.  **Khởi tạo dự án Firebase (Tùy chọn):**
    Nếu bạn muốn kết nối dự án này với một dự án Firebase của riêng mình, bạn cần khởi tạo nó. Nếu không, dự án sẽ sử dụng cấu hình Firebase mặc định (hoặc fallback về Local Storage nếu cấu hình Firebase không hợp lệ).
    ```bash
    firebase init
    ```
    Trong quá trình này, chọn `Hosting` và `Firestore`. Khi được hỏi về việc sử dụng một dự án hiện có, hãy chọn dự án Firebase của bạn.

6.  **Cài đặt Dependencies:**
    Dự án này không có các dependencies phức tạp ngoài Firebase SDK được tải qua CDN. Tuy nhiên, nếu có bất kỳ gói npm nào được thêm vào trong tương lai, bạn sẽ cần chạy:
    ```bash
    npm install
    ```

7.  **Chạy dự án cục bộ:**
    Để chạy ứng dụng trên máy chủ cục bộ, sử dụng lệnh Firebase Hosting:
    ```bash
    firebase serve
    ```
    Thao tác này sẽ khởi động một máy chủ cục bộ và cung cấp cho bạn một URL (thường là `http://localhost:5000` hoặc một cổng khác) để truy cập ứng dụng trong trình duyệt của bạn.

**Lưu ý về cấu hình Firebase:**

*   Dự án này được cấu hình để sử dụng Firebase. Thông tin cấu hình Firebase được đặt trong `js/app.js`.
*   Nếu `firebaseConfig` trong `js/app.js` chứa các giá trị `YOUR_API_KEY`, `YOUR_AUTH_DOMAIN`, v.v., hoặc nếu Firebase SDK không được tải, ứng dụng sẽ tự động chuyển sang chế độ **Local Storage Fallback**. Ở chế độ này, dữ liệu người dùng (đăng ký, đăng nhập, hồ sơ) sẽ được lưu trữ trong Local Storage của trình duyệt thay vì Firebase.
*   Để sử dụng Firebase thực sự, bạn cần thay thế các giá trị placeholder trong `firebaseConfig` bằng thông tin cấu hình từ dự án Firebase của bạn.

## Deploy to Firebase Hosting
1. Install Firebase CLI if needed.
2. Authenticate: `firebase login`
3. From project root: `firebase deploy --only hosting`

## Notes
- The register page now validates email, password strength, and password matching in real time.
- `firebaseConfig` in `js/app.js` must match the Firebase project being used.
