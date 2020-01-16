const jwtUnprotected = (req) => {
    const unprotectedRoutes = [
        '/auth/sign-in',
        '/auth/sign-up',
        '/auth/confirm',
        '/auth/guest-hash',
        '/auth/vkontakte/callback'
    ];

    return unprotectedRoutes.indexOf(req.path) > -1;
}

export {jwtUnprotected};
