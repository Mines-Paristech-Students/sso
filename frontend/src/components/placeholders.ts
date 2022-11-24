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
  "bde@etu.minesparis.psl.eu",
  "bdl@etu.minesparis.psl.eu",
  "bencheur@etu.minesparis.psl.eu",
  "matmaz@etu.minesparis.psl.eu",
  "peigne@etu.minesparis.psl.eu",
  "picheur@etu.minesparis.psl.eu",
  "zaza@etu.minesparis.psl.eu",
];

export const PASSWORD_PLACEHOLDERS = [
  "123456",
  "azertyuiop",
  "pichepichepiche",
  "zaza<3forever",
  "|>1<|-|3",
  "motdepasse",
  "mamanjetaime",
];

export function getUsernamePlaceholder() {
  return USERNAME_PLACEHOLDERS[
    Math.floor(Math.random() * Math.floor(USERNAME_PLACEHOLDERS.length))
  ];
}

export function getEmailPlaceholder() {
  return EMAIL_PLACEHOLDERS[
    Math.floor(Math.random() * Math.floor(EMAIL_PLACEHOLDERS.length))
  ];
}

export function getPasswordPlaceholder() {
  return PASSWORD_PLACEHOLDERS[
    Math.floor(Math.random() * Math.floor(PASSWORD_PLACEHOLDERS.length))
  ];
}
