/**
 * Dumb values to use as form placeholders. Just for fun.
 */

export const USERNAME_PLACEHOLDERS = [
    "16bde",
    "17bde",
    "18bde",
    "19bde",
    "16bdl",
    "17bdl",
    "18bdl",
    "19bdl",
    "16bench",
    "17bench",
    "18bench",
    "19bench",
    "16peigne",
    "17peigne",
    "18peigne",
    "19peigne",
    "16picheur",
    "17picheur",
    "18picheur",
    "19picheur",
    "16zimbra",
    "17zimbra",
    "18zimbra",
    "19zimbra",
];

export const EMAIL_PLACEHOLDERS = [
    "bde@mines-paristech.fr",
    "bdl@mines-paristech.fr",
    "bencheur@mines-paristech.fr",
    "matmaz@mines-paristech.fr",
    "peigne@mines-paristech.fr",
    "picheur@mines-paristech.fr",
    "zaza@mines-paristech.fr"
];

export const PASSWORD_PLACEHOLDERS = [
    "123456",
    "azertyuiop",
    "pichepichepiche",
    "zaza<3forever",
    "|>1<|-|3",
    "motdepasse",
    "mamanjetaime"
];

export function getUsernamePlaceholder() {
    return USERNAME_PLACEHOLDERS[Math.floor(Math.random() * Math.floor(USERNAME_PLACEHOLDERS.length))];
}

export function getEmailPlaceholder() {
    return EMAIL_PLACEHOLDERS[Math.floor(Math.random() * Math.floor(EMAIL_PLACEHOLDERS.length))];
}

export function getPasswordPlaceholder() {
    return PASSWORD_PLACEHOLDERS[Math.floor(Math.random() * Math.floor(PASSWORD_PLACEHOLDERS.length))];
}