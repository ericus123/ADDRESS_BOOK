import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import * as nodemailer from "nodemailer";
import { mailOptions } from "./types";

@Injectable()
export class MailService {
  private authClient: OAuth2Client;
  transporter: nodemailer.Transporter;
  logger = new Logger("User Service");

  constructor(private readonly configService: ConfigService) {
    (async () => {
      const { clientId, clientSecret, redirectUri, refreshToken, from } =
        await this.getAuthConfigs();

      this.authClient = new OAuth2Client({
        clientId,
        clientSecret,
        redirectUri
      });

      this.authClient.setCredentials({
        refresh_token: refreshToken
      });

      const accessToken = await this.getAccessToken();
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: from,
          clientId,
          clientSecret,
          type: "OAUTH2",
          accessToken,
          refreshToken
        }
      });
    })();
  }

  private async getAuthConfigs(): Promise<{
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    refreshToken: string;
    from: string;
  }> {
    return {
      clientId: this.configService.get<string>("GMAIL_CLIENT_ID"),
      clientSecret: this.configService.get<string>("GMAIL_REDIRECT_SECRET"),
      redirectUri: this.configService.get<string>("GMAIL_REDIRECT_URI"),
      refreshToken: this.configService.get<string>("GMAIL_REFRESH_TOKEN"),
      from: this.configService.get<string>("GMAIL_CLIENT_FROM")
    };
  }

  async sendEmail(options: mailOptions): Promise<void> {
    const { to, subject, text, html } = options;
    const mailOptions = {
      from: this.configService.get<string>("GMAIL_CLIENT_MAIL"),
      to,
      subject,
      html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.debug("Email sent successfully");
    } catch (error) {
      this.logger.error("Error sending email:", error);
      throw error;
    }
  }

  getVerificationTemplate = ({ firstName, token }) => {
    try {
      return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
            </head>
            <body>
                <p>Hi ${firstName},</p>
                <p>Thanks for creating an account in AddressBook.</p>
                <p>Click <a href="${process.env.FRONTEND_URL}/dashboard?verify=${token}" target="_blank">here</a> to verify your account</p>
            </body>
            </html>
        `;
    } catch (error) {
      throw new Error("Something went wrong");
    }
  };

  requestPasswordResetTemplate = ({ firstName, token }) => {
    try {
      return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
            </head>
            <body>
                <p>Hi ${firstName},</p>
                <p>Sorry to hear that you forgot your password.</p>
                <p>Click <a href="${process.env.FRONTEND_URL}/forgot-password?reset=${token}" target="_blank">here</a> to reset your password</p>
            </body>
            </html>
        `;
    } catch (error) {
      throw new Error("Something went wrong");
    }
  };

  getInvitationTemplate({ token }: { token: string }): string {
    try {
      return `        <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation to Join AddressBook</title>
      </head>
      <body>
          <p>Hello,</p>
          <p>You've been invited to join AddressBook.</p>
          <p>Click <a href="${process.env.FRONTEND_URL}/invitation?token=${token}" target="_blank">here</a> to join the system</p>
      </body>
      </html>
          `;
    } catch (error) {
      throw new Error("Something went wrong");
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const { token } = await this.authClient.getAccessToken();
      return token;
    } catch (error) {
      this.logger.error("Error refreshing access token:", error);
      throw error;
    }
  }
}
