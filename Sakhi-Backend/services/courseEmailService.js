import nodemailer from 'nodemailer';

export const sendCourseEnrollmentEmail = async ({
    studentEmail,
    studentName,
    courseTitle,
    instructorName,
    courseId,
}) => {
    try {
        const smtpHost = process.env.SMTP_HOST;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        // Fallback simulation if SMTP is not configured
        if (!smtpHost || !smtpUser || smtpUser === 'your_email@gmail.com') {
            console.log(`[Course Email Simulation] Welcome email for course "${courseTitle}" sent to ${studentName} (${studentEmail}).`);
            return { success: true, simulated: true };
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const courseLink = `${clientUrl}/academy/course/${courseId}`;

        const htmlContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; padding: 28px 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Welcome to Sakhi Academy!</h1>
                    <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.9;">Empowering Women Through Knowledge</p>
                </div>

                <div style="padding: 28px 24px; color: #1e293b; line-height: 1.6;">
                    <p style="font-size: 16px;">Dear <strong>${studentName}</strong>,</p>
                    <p>Congratulations on enrolling in <strong>"${courseTitle}"</strong>! You have taken an exciting step toward advancing your skills and building your future.</p>

                    <div style="background-color: #f5f3ff; border-left: 4px solid #7c3aed; padding: 18px; margin: 24px 0; border-radius: 6px;">
                        <h4 style="margin: 0 0 10px 0; color: #6d28d9; font-size: 16px;">Course Overview</h4>
                        <p style="margin: 4px 0;"><strong>Course:</strong> ${courseTitle}</p>
                        <p style="margin: 4px 0;"><strong>Instructor:</strong> ${instructorName}</p>
                        <p style="margin: 4px 0;"><strong>Enrollment Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p style="margin: 4px 0;"><strong>Status:</strong> Active / Enrolled</p>
                    </div>

                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${courseLink}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                            Start Learning Now →
                        </a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
                    <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
                        Thank you for learning with Sakhi Academy.<br />
                        If you have any questions, reach out to our community support.
                    </p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: process.env.FROM_EMAIL || `"Sakhi Academy" <${smtpUser}>`,
            to: studentEmail,
            subject: `Welcome to Sakhi Academy! You are enrolled in ${courseTitle}`,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Course Email Service] Welcome email dispatched to ${studentEmail}. ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[Course Email Service Error]:', error.message);
        return { success: false, error: error.message };
    }
};
