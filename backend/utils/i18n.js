const messages = {
  en: {
    "error.fill_all_fields": "Fill out all the fields",
    "error.user_exists": "User already exists",
    "validation.phone.invalid": "Phone number {value} is not valid.",
    "validation.phone.required": "Phone number is required.",
  },
  sr: {
    "error.fill_all_fields": "Popunite sva polja",
    "error.user_exists": "Korisnik već postoji",
    "validation.phone.invalid": "Broj telefona {value} nije ispravan.",
    "validation.phone.required": "Broj telefona je obavezan.",
  },
};

export const getLocale = (req) => {
  const header = req.headers["accept-language"];
  if (!header) return "en";
  const lang = header.split(",")[0].trim().toLowerCase();
  if (lang.startsWith("sr")) return "sr";
  return "en";
};

export const t = (key, locale = "en", params = {}) => {
  const langMessages = messages[locale] || messages.en;
  const template = langMessages[key] || messages.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, token) => {
    const value = params[token];
    return value === undefined || value === null ? "" : String(value);
  });
};
