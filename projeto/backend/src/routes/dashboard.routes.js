import { Router } from 'express';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Product from '../models/Product.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, permit('super', 'adm', 'user'), async (req, res) => {
    const [users, clients, products] = await Promise.all([
        User.countDocuments({ role: { $ne: 'super' } }),
        Client.countDocuments(),
        Product.countDocuments()
    ]);

    res.json({ users, clients, products });
});

export default router;
