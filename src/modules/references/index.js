import express from 'express';
import categories from './categories';
import templates from './templates';
import renderReferences from './renderReferences';

const router = express.Router();

const references = {
    'categories': 'Categories',
    'templates': 'Templates',
    'renderReferences': 'Render References'
}

router.get('/', async (req, res) => {
    res.send(references);
});

router.use('/categories', categories);
router.use('/templates', templates);
router.use('/render', renderReferences);

export default router;
export {references};