import { Resend } from 'resend';
import type { ContactInput } from '../../../lib/contactSchema.js';

export async function sendContactEmail(input: ContactInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) throw new Error('Contact email is not configured');

  const resend = new Resend(apiKey);
  const safeName = input.name.replace(/[\r\n]+/g, ' ');
  const from =
    // `||`, not `??`: a variable saved empty in the dashboard must fall through too.
    process.env.CONTACT_FROM_EMAIL ||
    (process.env.RESEND_EMAIL_DOMAIN ? `IReactIt <contact@${process.env.RESEND_EMAIL_DOMAIN}>` : '') ||
    'IReactIt <onboarding@resend.dev>';
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: input.email,
    subject: `ireactit.com: commit from ${safeName}`,
    text: `${input.message}\n\n— ${input.name} <${input.email}>`,
  });
  if (error) throw new Error(error.message);
}
