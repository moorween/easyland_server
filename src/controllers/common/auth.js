import express from 'express';
import {db, sequelize} from '../../lib/db';
import sendEmail from '../../services/sendEmail';
import hash from '../../lib/hash';
const router = express.Router();

router.post('/sign-in', async (req, res) => {
    const user = await db.users
        .scope(null)
        .findOne({
            where: {
                login: req.body.login
            }
        });
    
    if (!user || !user.validPassword(req.body.password)) {
        res.status(401).json({error: 'wrong password'})
        return;
    }

    await user.attachGuestOrders(req.body.guestHash);

    res.send({user, token: await user.jwtToken()});
});

router.post('/sign-up', async (req, res) => {
    try {
        const user = await db.users.create(req.body);

        res.json(await user.reload());
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

router.post('/password-restore', async (req, res) => {
    try {
        const user = await db.users.findOne({
            where: {
                email: req.body.email
            }
        });

        if (!user) {
            res.status(401).json({error: 'user not found'});
            return false;
        }

        if (req.body.code) {
            if (user.confirmation === req.body.code) {
                user.password = req.body.password;
                await user.save();

                res.json({user, token: await user.jwtToken()});
            } else {
                res.status(401).json({error: 'confirmation code is wrong'});
            }
        } else {
            user.updateConfirmationCode();
            await user.save();

            await sendEmail(
                user.email,
                'Restore EasyLand account',
                'password-restore',
                {user}
            );

            res.json({status: true});
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

router.get('/confirm', async (req, res) => {
    const params = req.query;
    try {
        const user = await db.users.findOne({
            where: {
                id: params.id,
                confirmation: params.code,
            }
        })

        if (!user || !params.code) {
            res.status(401).json({error: 'confirmation code is wrong'});
            return false;
        }

        user.unprotect(['status']);
        user.status = 'confirmed';
        user.updateConfirmationCode();

        await user.save();

        res.json({user, token: await user.jwtToken()});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }

});

router.put('/:id', async (req, res) => {
    try {
        const user = await db.users.findByPk(req.params.id);

        if (!user) {
            res.status(404).json({error: 'user not found'});
            return false;
        }
        if (user.id !== req.user.id) {
            res.status(401).json({error: 'user owner is wrong'});
            return false;
        }

        await user.update(req.body);

        res.json({status: true, user});
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.get('/guest-hash', async (req, res) => {
    let freeHash;
    do {
        freeHash = hash();
    } while (await db.orders.scope(null).findOne({where: {guestId: freeHash}}))

    res.json({guestHash: freeHash});
});

export default router;
