export function setCookie(name: string, value: string, days = 7) {
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "; expires=" + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value || "")}${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to set cookie:", e);
  }
}

export function getCookie(name: string): string | null {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  } catch (e) {
    console.error("Failed to read cookie:", e);
  }
  return null;
}

export function eraseCookie(name: string) {
  try {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to erase cookie:", e);
  }
}
