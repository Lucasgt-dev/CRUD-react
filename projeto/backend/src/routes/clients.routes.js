import { Router } from 'express';
import Client from '../models/Client.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();
const emailRegex = /^[^\s@]+@([^\s@.]+\.)+[A-Za-z]{2,}$/;

function isValidEmail(value) {
    return emailRegex.test(String(value ?? '').trim());
}

// LISTAR: todos podem ver
router.get('/', auth, permit('super', 'adm', 'user'), async (req, res) => {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
});

// CRIAR: só super e adm
router.post('/', auth, permit('super', 'adm'), async (req, res) => {
    if (!isValidEmail(req.body.email)) {
        return res.status(400).json({ message: 'Informe um e-mail valido' });
    }

    const client = await Client.create(req.body);
    res.status(201).json(client);
});

// EDITAR: só super e adm
router.put('/:id', auth, permit('super', 'adm'), async (req, res) => {
    if (!isValidEmail(req.body.email)) {
        return res.status(400).json({ message: 'Informe um e-mail valido' });
    }

    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(client);
});

// EXCLUIR: só super e adm
router.delete('/:id', auth, permit('super', 'adm'), async (req, res) => {
    const targetClient = await Client.findById(req.params.id);

    if (!targetClient) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    if (targetClient.active !== false) {
        return res.status(400).json({ message: 'Só é possível excluir clientes com o acesso desativado' });
    }

    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cliente removido com sucesso' });
});

export default router;
