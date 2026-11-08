export function firstMessageByField(errors = []) {
  const byField = {}
  for (const { field, message } of errors) {
    if (!(field in byField)) byField[field] = message
  }
  return byField
}
