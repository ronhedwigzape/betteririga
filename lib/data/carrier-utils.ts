export type CarrierType = "smart" | "globe" | "landline"

export function detectCarrier(
  number?: string,
  networkOrType?: string
): CarrierType {
  const text = `${networkOrType ?? ""} ${number ?? ""}`.toLowerCase()

  if (
    text.includes("smart") ||
    text.includes("0921") ||
    text.includes("0928") ||
    text.includes("0918") ||
    text.includes("0919") ||
    text.includes("0998")
  ) {
    return "smart"
  }
  if (
    text.includes("globe") ||
    text.includes("0956") ||
    text.includes("0917") ||
    text.includes("0927") ||
    text.includes("0915") ||
    text.includes("0916")
  ) {
    return "globe"
  }

  return "landline"
}
