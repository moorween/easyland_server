import express from 'express';
import categories from './categories';
const router = express.Router();

const references = {
    'categories': 'Categories'
}

router.get('/', async (req, res) => {
    res.send(references);
});

router.use('/categories', categories);

export default router;
export {references};