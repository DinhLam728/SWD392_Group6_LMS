const numberFormat = new Intl.NumberFormat('en-US')

export function formatVnd(amount) {
  return `${numberFormat.format(Number(amount) || 0)} VND`
}
