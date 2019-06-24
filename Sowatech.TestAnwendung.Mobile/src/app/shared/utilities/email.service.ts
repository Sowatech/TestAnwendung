import { Injectable } from '@angular/core';
import { EmailComposer } from '@ionic-native/email-composer';

@Injectable()
export class EmailService {
    constructor(private emailComposer: EmailComposer) {

    }

    sendMail(to, subject, body) {
        this.emailComposer.isAvailable().then((available: boolean) => {
            let email = {
                to: to,
                subject: subject,
                body: body,
                isHtml: true
            };
            this.emailComposer.open(email);
        }).catch(() => {
            let link = "mailto:" + to
                + "?subject=" + encodeURIComponent(subject)
                + "&body=" + encodeURIComponent(body);
            window.location.href = link;
        })
    }
}