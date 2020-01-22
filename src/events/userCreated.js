import sendEmail from "../services/sendEmail";

module.exports = async function (user) {
    await sendEmail(
        user.email,
        'Welcome to Easy Land!',
        'new-user',
        {user}
    );
}
