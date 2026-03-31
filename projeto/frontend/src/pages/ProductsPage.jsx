import { useEffect, useRef, useState } from 'react';
import AppMenu from '../components/AppMenu';
import { request } from '../services/api';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { useAuth } from '../context/AuthContext';

const TOAST_LIFE = 4200;
const TOAST_SUCCESS_LIFE = 3200;
const PAGE_SIZE = 10;

const emptyForm = {
  _id: null,
  name: '',
  id: '',
  description: '',
  price: 0,
  stock: 0
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function isBlank(value) {
  return !String(value ?? '').trim();
}

function hasValidStock(value) {
  return value !== null && value !== undefined && Number(value) > 0;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const canManage = user?.role !== 'user';
  const toast = useRef(null);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedItem, setSelectedItem] = useState(null);
  const [invalidFields, setInvalidFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [first, setFirst] = useState(0);

  async function load() {
    const data = await request('/products');
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const lastValidFirst = Math.max(0, Math.floor(Math.max(items.length - 1, 0) / PAGE_SIZE) * PAGE_SIZE);
    if (first > lastValidFirst) {
      setFirst(lastValidFirst);
    }
  }, [items.length, first]);

  function newItem() {
    setForm(emptyForm);
    setInvalidFields({});
    setSaving(false);
    setOpen(true);
  }

  function editItem(row) {
    setForm(row);
    setInvalidFields({});
    setSaving(false);
    setOpen(true);
  }

  function viewItem(row) {
    setSelectedItem(row);
    setViewOpen(true);
  }

  async function save() {
    if (saving) {
      return;
    }

    const nextInvalidFields = {
      name: isBlank(form.name),
      id: isBlank(form.id),
      description: isBlank(form.description),
      price: Number(form.price) <= 0,
      stock: !hasValidStock(form.stock)
    };

    if (Object.values(nextInvalidFields).some(Boolean)) {
      setInvalidFields(nextInvalidFields);
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Preencha nome, ID, descrição, preço e pelo menos 1 unidade em estoque antes de salvar.',
        life: TOAST_LIFE
      });
      return;
    }

    setInvalidFields({});
    setSaving(true);

    const payload = {
      name: form.name,
      id: form.id,
      description: form.description,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0)
    };

    try {
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
    await load();
    toast.current?.show({
      severity: 'success',
      summary: form._id ? 'Produto atualizado' : 'Produto criado',
      detail: `${form.name} foi ${form._id ? 'editado' : 'criado'} com sucesso.`,
      life: TOAST_SUCCESS_LIFE
    });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Falha ao salvar',
        detail: error.message || 'Não foi possível salvar o produto.',
        life: TOAST_LIFE
      });
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(row) {
    confirmDialog({
      message: `Deseja excluir ${row.name}?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        await request(`/products/${row._id}`, { method: 'DELETE' });
        await load();
        toast.current?.show({
          severity: 'error',
          summary: 'Produto removido',
          detail: `${row.name} foi excluído.`,
          life: TOAST_SUCCESS_LIFE
        });
      }
    });
  }

  const currentItems = items.slice(first, first + PAGE_SIZE);

  function renderActions(row) {
    return (
      <div className="table-control-cell">
        <div className="row-actions">
          <Button icon="pi pi-eye" text tooltip="Visualizar" tooltipOptions={{ position: 'top' }} aria-label="Visualizar" className="action-button action-view" onClick={() => viewItem(row)} />
          {canManage && <Button icon="pi pi-pencil" text tooltip="Editar" tooltipOptions={{ position: 'top' }} aria-label="Editar" className="action-button action-edit" onClick={() => editItem(row)} />}
          {canManage && <Button icon="pi pi-trash" text severity="danger" tooltip="Excluir" tooltipOptions={{ position: 'top' }} aria-label="Excluir" className="action-button action-delete" onClick={() => removeItem(row)} />}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Toast
        ref={toast}
        position="top-right"
        baseZIndex={open || viewOpen ? 2600 : 1000}
        appendTo={open || viewOpen ? document.body : 'self'}
        className={open || viewOpen ? 'toast-elevated' : ''}
      />
      <ConfirmDialog />
      <AppMenu />

      <div className="page-content">
        <div className="page-header">
          <div className="page-title">
            <h2>Produtos</h2>
            <p>Acompanhe identificação, preço e estoque em um painel mais limpo.</p>
          </div>
          {canManage && <Button label="Novo produto" icon="pi pi-plus" onClick={newItem} />}
        </div>

        <DataTable value={items} paginator rows={PAGE_SIZE} first={first} onPage={(e) => setFirst(e.first)} stripedRows className="data-shell table-desktop">
          <Column field="name" header="Nome" />
          <Column header="ID" body={(row) => row.id || row._id} />
          <Column field="description" header="Descrição" />
          <Column header="Preço" body={(row) => currencyFormatter.format(Number(row.price || 0))} />
          <Column header="Estoque" body={(row) => `${Number(row.stock || 0)} unidades`} />
          <Column
            header="Ações"
            headerStyle={{ textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
            headerClassName="control-column actions-column"
            bodyClassName="control-column-cell actions-column"
            style={{ width: '10rem' }}
            body={renderActions}
          />
        </DataTable>

        <div className="data-shell mobile-card-shell">
          <div className="mobile-card-list">
            {currentItems.map((row) => (
              <article key={row._id} className="mobile-data-card">
                <div className="mobile-card-head">
                  <div className="mobile-card-title-block">
                    <strong>{row.name}</strong>
                  </div>
                </div>

                <div className="mobile-card-grid">
                  <div className="mobile-card-field">
                    <span className="mobile-card-label">ID</span>
                    <span className="mobile-card-value">{row.id || row._id}</span>
                  </div>

                  <div className="mobile-card-field">
                    <span className="mobile-card-label">Preço</span>
                    <span className="mobile-card-value">{currencyFormatter.format(Number(row.price || 0))}</span>
                  </div>

                  <div className="mobile-card-field">
                    <span className="mobile-card-label">Estoque</span>
                    <span className="mobile-card-value">{`${Number(row.stock || 0)} unidades`}</span>
                  </div>

                  <div className="mobile-card-field mobile-card-field-full">
                    <span className="mobile-card-label">Descrição</span>
                    <span className="mobile-card-value">{row.description}</span>
                  </div>
                </div>

                <div className="mobile-card-footer">
                  <div className="mobile-card-section">
                    <span className="mobile-card-section-title">Ações</span>
                    {renderActions(row)}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Paginator first={first} rows={PAGE_SIZE} totalRecords={items.length} onPageChange={(e) => setFirst(e.first)} />
        </div>
      </div>

      <Dialog header="Visualizar produto" visible={viewOpen} style={{ width: '30rem' }} onHide={() => setViewOpen(false)}>
        <div className="form-col">
          <label>Nome</label>
          <InputText value={selectedItem?.name || ''} readOnly />

          <label>ID</label>
          <InputText value={selectedItem?.id || selectedItem?._id || ''} readOnly />

          <label>Descrição</label>
          <InputText value={selectedItem?.description || ''} readOnly />

          <label>Preço</label>
          <InputText value={currencyFormatter.format(Number(selectedItem?.price || 0))} readOnly />

          <label>Estoque</label>
          <InputText value={`${Number(selectedItem?.stock || 0)} unidades`} readOnly />
        </div>
      </Dialog>

      {canManage && (
        <Dialog header="Produto" visible={open} style={{ width: '30rem' }} onHide={() => setOpen(false)}>
          <div className="form-col">
            <label>Nome</label>
            <InputText
              className={invalidFields.name ? 'p-invalid' : ''}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setInvalidFields((current) => ({ ...current, name: false }));
              }}
            />

            <label>ID</label>
            <InputText
              className={invalidFields.id ? 'p-invalid' : ''}
              value={form.id}
              onChange={(e) => {
                setForm({ ...form, id: e.target.value });
                setInvalidFields((current) => ({ ...current, id: false }));
              }}
            />

            <label>Descrição</label>
            <InputText
              className={invalidFields.description ? 'p-invalid' : ''}
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                setInvalidFields((current) => ({ ...current, description: false }));
              }}
            />

            <label>Preço</label>
            <InputNumber
              inputClassName={invalidFields.price ? 'p-invalid' : ''}
              value={form.price}
              onValueChange={(e) => {
                setForm({ ...form, price: e.value });
                setInvalidFields((current) => ({ ...current, price: false }));
              }}
            />

            <label>Estoque</label>
            <InputNumber
              inputClassName={invalidFields.stock ? 'p-invalid' : ''}
              value={form.stock}
              onValueChange={(e) => {
                setForm({ ...form, stock: e.value });
                setInvalidFields((current) => ({ ...current, stock: false }));
              }}
            />

            <Button
              label={saving ? (form._id ? 'Editando...' : 'Salvando...') : (form._id ? 'Editar' : 'Salvar')}
              loading={saving}
              disabled={saving}
              onClick={save}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}
