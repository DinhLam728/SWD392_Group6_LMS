const numberFormat = new Intl.NumberFormat('vi-VN')

export function formatVnd(amount) {
  return `${numberFormat.format(Number(amount) || 0)} VND`
}
