const jwtUnprotected = (req) => {
    const unprotectedRoutes = [
        '/auth/sign-in',
        '/auth/vkontakte',
        '/auth/vkontakte/callback'
    ];

    return unprotectedRoutes.indexOf(req.path) > -1;
}

export {jwtUnprotected};