"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLoginTokenEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("./config");
const hasSmtpConfig = Boolean(config_1.config.smtp.host) &&
    Boolean(config_1.config.smtp.user) &&
    Boolean(config_1.config.smtp.pass) &&
    Boolean(config_1.config.smtp.from);
const sendLoginTokenEmail = async ({ to, token, expiresInMinutes, }) => {
    if (!hasSmtpConfig) {
        return false;
    }
    const transport = nodemailer_1.default.createTransport({
        host: config_1.config.smtp.host,
        port: config_1.config.smtp.port,
        secure: config_1.config.smtp.secure,
        auth: {
            user: config_1.config.smtp.user,
            pass: config_1.config.smtp.pass,
        },
    });
    await transport.sendMail({
        from: config_1.config.smtp.from,
        to,
        subject: 'Seu codigo de acesso - Dash Finance',
        text: `Seu codigo de acesso e ${token}. Ele expira em ${expiresInMinutes} minutos.`,
        html: `<p>Seu codigo de acesso e <strong>${token}</strong>.</p><p>Ele expira em ${expiresInMinutes} minutos.</p>`,
    });
    return true;
};
exports.sendLoginTokenEmail = sendLoginTokenEmail;
