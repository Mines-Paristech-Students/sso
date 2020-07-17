import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from jinja2 import Template

from django.conf import settings


class EmailSender:
    def __init__(self, name, account=settings.EMAIL["ADDRESS"]):
        self.smtp = None
        self.account = account
        self.name = name

    def connect(self):
        self.smtp = smtplib.SMTP_SSL(settings.EMAIL["HOST"], settings.EMAIL["PORT"])
        self.smtp.ehlo()
        pw = settings.EMAIL["PASSWORD"]
        self.smtp.login(self.account, pw)

    def sendemail(self, to, subject, text, cc=None, bcc=None, attachment=None, attachments=None, template=False, template_file_path=None, **kwargs):
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"[Rezal] {subject}"
        msg['From'] = f'{self.name} <{self.account}>'
        msg['To'] = to
        destinations = [email.strip() for email in to.split(',')]
        if cc is not None:
            msg['Cc'] = cc
            destinations += [email.strip() for email in cc.split(',')]
        if bcc is not None:
            msg['Bcc'] = bcc
            destinations += [email.strip() for email in bcc.split(',')]

        if template and template_file_path:
            with open(template_file_path) as template_file:
                template = Template(template_file.read())
            content = template.render(**kwargs)
        else:
            content = text

        msg.attach(MIMEText(content, 'html'))
        if attachment is not None:
            part = MIMEApplication(
                attachment[0].read(),
                Name=attachment[1]
            )
            part['Content-Disposition'] = 'attachment; filename="{}"'.format(attachment[1])
            msg.attach(part)
        if attachments is not None:
            for attachment in attachments:
                part = MIMEApplication(
                    attachment[0].read(),
                    Name=attachment[1])
                part['Content-Disposition'] = 'attachment; filename="{}"'.format(attachment[1])
                msg.attach(part)
        if len(to) > 0:
            self.smtp.sendmail(self.account, destinations, msg.as_string())

    def send_passwordrecovery_link(self, user_address, name, passwordrecovery_id):
        link = settings.FRONTEND_HOST + "/mot-de-passe/nouveau/" + passwordrecovery_id
        text = "Cliquez sur ce lien pour reéinitialiser votre mot de passe : " + link
        self.sendemail(to=user_address, subject="Nouveau mot de passe",text = text, cc=None, bcc=None, attachment=None, attachments=None, template=True,
                  template_file_path="sso_server/email_template/passwordRecovery.html", name=name, link=link)

    def close(self):
        self.smtp.quit()
