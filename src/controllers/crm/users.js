import {db} from "../../lib/db";
import router from "../common/auth";

router.get('/:id', async (req, res) => {
    try {
        const user = await db.users
            .scope('withProjects', 'noPassword')
            .findByPk(req.params.id);

        if (!user) {
            res.status(404).json({error: 'user not found'});
            return false;
        }

        res.json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

router.get('/', async (req, res) => {
    const users = await db.users.findAll();
    res.json(users);
})

export default router;
