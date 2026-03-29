import { Router } from 'express';
import  bcrypt from 'bcryptjs';
import  jwt  from 'jsonwebtoken';
import  User  from '../models/User.js';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email ?? '').trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if(!user) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        if(!user.active) {
            return res.status(403).json({ message: 'Seu acesso está desativado. Fale com um administrador.' });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if(!ok) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h'}
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch(error) {
        res.status(500).json({ message: 'Erro no login', error: error.message });
    }
});

export default router;
