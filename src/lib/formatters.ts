
export const normalizeEmail = (email: string) => {
    if (!email) return "";
    return email.trim().toLowerCase();
}
