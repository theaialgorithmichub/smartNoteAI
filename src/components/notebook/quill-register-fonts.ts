// This file must only be imported client-side (inside dynamic imports or useEffect)
// It registers custom fonts on the Quill instance used by react-quill-new

export const FONT_WHITELIST = [
  "arial", "georgia", "verdana", "tahoma", "trebuchet",
  "impact", "courier", "times", "palatino", "garamond",
  "roboto", "lato", "poppins", "montserrat", "inter",
  "raleway", "nunito", "oswald", "merriweather", "ubuntu",
  "playfair", "opensans", "sourcesans", "worksans", "dmsans",
]

export function registerFonts(Quill: any) {
  const Font = Quill.import("formats/font")
  Font.whitelist = FONT_WHITELIST
  Quill.register({ "formats/font": Font }, true)
}
