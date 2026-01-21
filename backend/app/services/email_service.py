import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL

    async def send_group_invitation_email(
        self, 
        to_email: str, 
        group_name: str, 
        invited_by_name: str, 
        invitation_code: str,
        user_exists: bool = True
    ) -> bool:
        """Send group invitation email"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"Invitation to join '{group_name}' on GroupChatAI"
            msg['From'] = self.from_email
            msg['To'] = to_email

            if user_exists:
                # User already has account - direct them to accept invitation
                html_content = f"""
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">GroupChatAI</h1>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f9f9f9;">
                        <h2 style="color: #333;">You're invited to join a group chat!</h2>
                        
                        <p><strong>{invited_by_name}</strong> has invited you to join the group "<strong>{group_name}</strong>" on GroupChatAI.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Group:</strong> {group_name}</p>
                            <p style="margin: 5px 0 0 0;"><strong>Invited by:</strong> {invited_by_name}</p>
                        </div>
                        
                        <p>To accept this invitation, please log in to your GroupChatAI account and check your notifications, or use the invitation code below:</p>
                        
                        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                            <strong>Invitation Code: {invitation_code}</strong>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3000/chat" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Open GroupChatAI
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 12px;">
                            This invitation will expire in 7 days.
                        </p>
                    </div>
                </body>
                </html>
                """
                text_content = f"""
                You're invited to join a group chat!
                
                {invited_by_name} has invited you to join the group "{group_name}" on GroupChatAI.
                
                To accept this invitation, please log in to your GroupChatAI account and check your notifications, or use the invitation code: {invitation_code}
                
                Open GroupChatAI: http://localhost:3000/chat
                
                This invitation will expire in 7 days.
                """
            else:
                # User doesn't have account - invite them to register first
                html_content = f"""
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">GroupChatAI</h1>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f9f9f9;">
                        <h2 style="color: #333;">You're invited to join GroupChatAI!</h2>
                        
                        <p><strong>{invited_by_name}</strong> has invited you to join the group "<strong>{group_name}</strong>" on GroupChatAI.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Group:</strong> {group_name}</p>
                            <p style="margin: 5px 0 0 0;"><strong>Invited by:</strong> {invited_by_name}</p>
                        </div>
                        
                        <p>To join this group, you first need to create a free account on GroupChatAI. After creating your account, you can use the invitation code below to join the group:</p>
                        
                        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                            <strong>Invitation Code: {invitation_code}</strong>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3000/auth/register" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Create Account & Join Group
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 12px;">
                            This invitation will expire in 7 days. GroupChatAI is a free platform for group conversations with AI integration.
                        </p>
                    </div>
                </body>
                </html>
                """
                text_content = f"""
                You're invited to join GroupChatAI!
                
                {invited_by_name} has invited you to join the group "{group_name}" on GroupChatAI.
                
                To join this group, first create a free account at: http://localhost:3000/auth/register
                
                After creating your account, use this invitation code to join the group: {invitation_code}
                
                This invitation will expire in 7 days.
                """

            # Create message parts
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)

            logger.info(f"Invitation email sent to {to_email} for group {group_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to send invitation email to {to_email}: {e}")
            return False


# Create singleton instance
email_service = EmailService()