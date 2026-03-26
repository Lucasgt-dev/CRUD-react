import { useEffect, useState } from 'react';
import AppMenu from '../components/AppMenu';
import { request } from '../services/api';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  _id: null,
  name: '',
  id: '',
  description: '',
  price: 0,
  stock: 0
};

export default function ProductsPage() {
  const { user } = useAuth();
  const canManage = user?.role !== 'user';
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    const data = await request('/products');
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  function newItem() {
    setForm(emptyForm);
    setOpen(true);
  }

  function editItem(row) {
    setForm(row);
    setOpen(true);
  }

  async function save() {
    const payload = {
      name: form.name,
      id: form.id,
      description: form.description,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0)
    };

    if (form._id) {
      await request(`/products/${form._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      await request('/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    setOpen(false);
    load();
  }

  async function removeItem(row) {
    if (!confirm(`Excluir ${row.name}?`)) return;
    await request(`/products/${row._id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="page">
      <AppMenu />

      <div className="page-header">
        <h2>Produtos</h2>
        {canManage && <Button label="Novo produto" icon="pi pi-plus" onClick={newItem} />}
      </div>

      <DataTable value={items} paginator rows={10} stripedRows>
        <Column field="name" header="Nome" />
        <Column field="id" header="ID" />
        <Column field="price" header="Preco" />
        <Column field="stock" header="Estoque" />
        {canManage && (
          <Column
            header="Acoes"
            body={(row) => (
              <div className="row-actions">
                <Button icon="pi pi-pencil" text onClick={() => editItem(row)} />
                <Button icon="pi pi-trash" text severity="danger" onClick={() => removeItem(row)} />
              </div>
            )}
          />
        )}
      </DataTable>

      {canManage && (
        <Dialog header="Produto" visible={open} style={{ width: '30rem' }} onHide={() => setOpen(false)}>
          <div className="form-col">
            <label>Nome</label>
            <InputText value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <label>ID</label>
            <InputText value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />

            <label>Descricao</label>
            <InputText value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <label>Preco</label>
            <InputNumber value={form.price} onValueChange={(e) => setForm({ ...form, price: e.value })} />

            <label>Estoque</label>
            <InputNumber value={form.stock} onValueChange={(e) => setForm({ ...form, stock: e.value })} />

            <Button label="Salvar" onClick={save} />
          </div>
        </Dialog>
      )}
    </div>
  );
}
