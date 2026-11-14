/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // xuất ra file HTML tĩnh vào thư mục out/
  images: {
    unoptimized: true, // tối ưu ảnh cần server nên tắt khi export tĩnh
  },
};

export default nextConfig;
