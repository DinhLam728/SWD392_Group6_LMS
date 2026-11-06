// ApiError.errors is a list of { field, message }; keep the first message per field.
export function firstMessageByField(errors = []) {
  const byField = {}
  for (const { field, message } of errors) {
    if (!(field in byField)) byField[field] = message
  }
  return byField
}
