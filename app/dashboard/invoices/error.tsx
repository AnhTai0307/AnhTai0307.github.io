'use client'; // error boundary bắt buộc là Client Component

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ghi log lỗi (thực tế có thể gửi tới dịch vụ theo dõi lỗi)
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        // thử render lại segment
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
}
