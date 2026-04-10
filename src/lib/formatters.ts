export const normalizePhone = (phone: string) => {
    if (!phone) return "";
    phone = phone.trim();
    if (phone.startsWith("+880")) return phone;
    if (phone.startsWith("880")) return "+880" + phone.slice(3);
    if (phone.startsWith("0")) return "+880" + phone.slice(1);
    return "+880" + phone;
}

export const normalizeEmail = (email: string) => {
    if (!email) return "";
    return email.trim().toLowerCase();
}
