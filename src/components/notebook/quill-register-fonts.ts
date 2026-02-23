// This file must only be imported client-side (inside dynamic imports or useEffect)
// It registers custom fonts on the Quill instance used by react-quill-new

export const FONT_WHITELIST = [
  "sans", "serif", "mono", "handwriting",
  "roboto", "playfair", "lato", "oswald", "merriweather",
  "raleway", "ubuntu", "nunito", "poppins", "crimson",
]

export function registerFonts(Quill: any) {
  const Font = Quill.import("formats/font")
  Font.whitelist = FONT_WHITELIST
  Quill.register({ "formats/font": Font }, true)
}
