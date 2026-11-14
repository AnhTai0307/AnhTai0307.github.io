// Số tiền lưu bằng cents để tránh lỗi làm tròn số thực -> chia 100 khi hiển thị
export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

// Trục Y của biểu đồ doanh thu
export const generateYAxis = (revenue: { month: string; revenue: number }[]) => {
  const yAxisLabels: string[] = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

// Tạo dải số trang: 1 2 3 ... 9 10
export const generatePagination = (currentPage: number, totalPages: number) => {
  // Ít hơn hoặc bằng 7 trang -> hiện hết
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Đang ở 3 trang đầu -> hiện 3 trang đầu, dấu ..., 2 trang cuối
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // Đang ở 3 trang cuối -> hiện 2 trang đầu, dấu ..., 3 trang cuối
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // Ở giữa -> trang đầu, ..., trang hiện tại +-1, ..., trang cuối
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
