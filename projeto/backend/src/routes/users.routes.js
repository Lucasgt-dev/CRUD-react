import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();
const emailRegex = /^[^\s@]+@([^\s@.]+\.)+[A-Za-z]{2,}$/;

function isValidEmail(value) {
  return emailRegex.test(String(value ?? '').trim());
}

// LISTAR: todos podem ver, exceto o perfil super que fica invisível no CRUD
router.get('/', auth, permit('super', 'adm', 'user'), async (req, res) => {
  const users = await User.find({ role: { $ne: 'super' } })
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  res.json(users);
});

// CRIAR: só o super e adm, sem permitir criar perfil super pelo CRUD
router.post('/', auth, permit('super', 'adm'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Informe um e-mail valido' });
    }

    if (role === 'super') {
      return res.status(403).json({ message: 'Nao e permitido criar usuarios super pelo CRUD' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'E-mail ja cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuario', error: error.message });
  }
});

// EDITAR: só o super e adm, sem permitir alterar perfis super
router.put('/:id', auth, permit('super', 'adm'), async (req, res) => {
  try {
    const { name, email, role, active, password } = req.body;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'Usuario nao encontrado' });
    }

    if (targetUser.role === 'super') {
      return res.status(403).json({ message: 'Usuario super nao pode ser alterado pelo CRUD' });
    }

    if (role === 'super') {
      return res.status(403).json({ message: 'Nao e permitido promover usuarios para super pelo CRUD' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Informe um e-mail valido' });
    }

    const data = { name, email, role, active };

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, data, { new: true })
      .select('-passwordHash');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuario', error: error.message });
  }
});

// EXCLUIR: só super e adm, sem permitir remover perfis super
router.delete('/:id', auth, permit('super', 'adm'), async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    return res.status(404).json({ message: 'Usuario nao encontrado' });
  }

  if (targetUser.role === 'super') {
    return res.status(403).json({ message: 'Usuario super nao pode ser removido pelo CRUD' });
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Usuario removido com sucesso' });
});

export default router;
