// users.js
export const EMAILS_PERMITIDOS = {
    "ferraza865@gmail.com": "Anderson",
    "adangones55@gmail.com": "TI",
    "mariabonita7830@gmail.com": "Maria Bonita"
};

export let operadorAtual = "";

export function setOperadorAtual(nome) {
    operadorAtual = nome;
}

export function obterNomePorEmail(email) {
    return EMAILS_PERMITIDOS[email.toLowerCase()] || null;
}
