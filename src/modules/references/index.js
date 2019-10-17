import express from 'express';
import categories from './categories';
import templates from './templates';
const router = express.Router();

const references = {
    'categories': 'Categories',
    'templates': 'Templates'
}

router.get('/', async (req, res) => {
    res.send(references);
});

router.use('/categories', categories);
router.use('/templates', templates);

export default router;
export {references};