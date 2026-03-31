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
import { InputMask } from 'primereact/inputmask';
import { InputSwitch } from 'primereact/inputswitch';
import { useAuth } from '../context/AuthContext';

const TOAST_LIFE = 4200;
const TOAST_SUCCESS_LIFE = 3200;
const PAGE_SIZE = 10;

const emptyForm = {
  _id: null,
  name: '',
  email: '',
  phone: '',
  document: ''
};

function isBlank(value) {
  return !String(value ?? '').trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@([^\s@.]+\.)+[A-Za-z]{2,}$/.test(String(value ?? '').trim());
}

function hasMaskGap(value) {
  const normalized = String(value ?? '').trim();
  return !normalized || normalized.includes('_');
}

export default function ClientsPage() {
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
    const data = await request('/clients');
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
      email: isBlank(form.email) || !isValidEmail(form.email),
      phone: hasMaskGap(form.phone),
      document: hasMaskGap(form.document)
    };

    if (Object.values(nextInvalidFields).some(Boolean)) {
      setInvalidFields(nextInvalidFields);
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: nextInvalidFields.email
          ? 'Informe um e-mail válido antes de salvar.'
          : 'Preencha nome, e-mail, telefone e documento antes de salvar.',
        life: TOAST_LIFE
      });
      return;
    }

    setInvalidFields({});
    setSaving(true);

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      document: form.document
    };

    try {
    if (form._id) {
      await request(`/clients/${form._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      await request('/clients', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    setOpen(false);
    await load();
    toast.current?.show({
      severity: 'success',
      summary: form._id ? 'Cliente atualizado' : 'Cliente criado',
      detail: `${form.name} foi ${form._id ? 'editado' : 'criado'} com sucesso.`,
      life: TOAST_SUCCESS_LIFE
    });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Falha ao salvar',
        detail: error.message || 'Não foi possível salvar o cliente.',
        life: TOAST_LIFE
      });
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(row) {
    if (row.active !== false) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Desative o acesso antes de excluir',
        detail: 'Só é possível excluir clientes com o acesso desativado.',
        life: TOAST_LIFE
      });
      return;
    }

    confirmDialog({
      message: `Deseja excluir ${row.name}?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await request(`/clients/${row._id}`, { method: 'DELETE' });
          await load();
          toast.current?.show({
            severity: 'error',
            summary: 'Cliente removido',
            detail: `${row.name} foi excluído.`,
            life: TOAST_SUCCESS_LIFE
          });
        } catch (error) {
          toast.current?.show({
            severity: 'warn',
            summary: 'Exclusão não permitida',
            detail: error.message || 'Desative o acesso do cliente antes de excluí-lo.',
            life: TOAST_LIFE
          });
        }
      }
    });
  }

  async function toggleActive(row, nextActive = !row.active) {

    await request(`/clients/${row._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: row.name,
        email: row.email,
        phone: row.phone,
        document: row.document,
        active: nextActive
      })
    });

    await load();
    toast.current?.show({
      severity: nextActive ? 'success' : 'warn',
      summary: nextActive ? 'Acesso ativado' : 'Acesso desativado',
      detail: `${row.name} foi ${nextActive ? 'ativado' : 'desativado'} com sucesso.`,
      life: TOAST_SUCCESS_LIFE
    });
  }

  const currentItems = items.slice(first, first + PAGE_SIZE);

  function renderStatus(row) {
    return (
      <div className="table-control-cell">
        <span className={`status-badge ${row.active === false ? 'is-inactive' : 'is-active'}`}>
          {row.active === false ? 'Inativo' : 'Ativo'}
        </span>
      </div>
    );
  }

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

  function renderAccess(row) {
    return (
      <div className="table-control-cell">
        <div className="access-action">
          <InputSwitch checked={row.active !== false} onChange={(e) => toggleActive(row, e.value)} />
          <span className={`access-label ${row.active === false ? 'is-off' : 'is-on'}`}>
            {row.active === false ? 'Desativado' : 'Ativado'}
          </span>
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
            <h2>Clientes</h2>
            <p>Consulte sua base de relacionamento com mais clareza e contexto.</p>
          </div>
          {canManage && <Button label="Novo cliente" icon="pi pi-plus" onClick={newItem} />}
        </div>

        <DataTable value={items} paginator rows={PAGE_SIZE} first={first} onPage={(e) => setFirst(e.first)} stripedRows className="data-shell table-desktop">
          <Column field="name" header="Nome" />
          <Column field="email" header="E-mail" />
          <Column field="phone" header="Telefone" />
          <Column field="document" header="Documento (CPF)" />
          <Column
            header="Status"
            headerStyle={{ textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
            headerClassName="control-column status-column"
            bodyClassName="control-column-cell status-column"
            style={{ width: '9rem' }}
            body={renderStatus}
          />
          <Column
            header="Ações"
            headerStyle={{ textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
            headerClassName="control-column actions-column"
            bodyClassName="control-column-cell actions-column"
            style={{ width: '10rem' }}
            body={renderActions}
          />
          {canManage && (
            <Column
              header="Acesso"
              headerStyle={{ textAlign: 'center' }}
              bodyStyle={{ textAlign: 'center' }}
              headerClassName="control-column access-column"
              bodyClassName="control-column-cell access-column"
              style={{ width: '13rem' }}
              body={renderAccess}
            />
          )}
        </DataTable>

        <div className="data-shell mobile-card-shell">
          <div className="mobile-card-list">
            {currentItems.map((row) => (
              <article key={row._id} className="mobile-data-card">
                <div className="mobile-card-head">
                  <div className="mobile-card-title-block">
                    <strong>{row.name}</strong>
                  </div>
                  {renderStatus(row)}
                </div>

                <div className="mobile-card-grid">
                  <div className="mobile-card-field mobile-card-field-full">
                    <span className="mobile-card-label">E-mail</span>
                    <span className="mobile-card-value">{row.email}</span>
                  </div>

                  <div className="mobile-card-field">
                    <span className="mobile-card-label">Telefone</span>
                    <span className="mobile-card-value">{row.phone}</span>
                  </div>

                  <div className="mobile-card-field">
                    <span className="mobile-card-label">Documento (CPF)</span>
                    <span className="mobile-card-value">{row.document}</span>
                  </div>
                </div>

                <div className="mobile-card-footer">
                  <div className="mobile-card-section">
                    <span className="mobile-card-section-title">Ações</span>
                    {renderActions(row)}
                  </div>

                  {canManage && (
                    <div className="mobile-card-section">
                      <span className="mobile-card-section-title">Acesso</span>
                      {renderAccess(row)}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <Paginator first={first} rows={PAGE_SIZE} totalRecords={items.length} onPageChange={(e) => setFirst(e.first)} />
        </div>
      </div>

      <Dialog header="Visualizar cliente" visible={viewOpen} style={{ width: '30rem' }} onHide={() => setViewOpen(false)}>
        <div className="form-col">
          <label>Nome</label>
          <InputText value={selectedItem?.name || ''} readOnly />

          <label>E-mail</label>
          <InputText value={selectedItem?.email || ''} readOnly />

          <label>Telefone</label>
          <InputText value={selectedItem?.phone || ''} readOnly />

          <label>Documento (CPF)</label>
          <InputText value={selectedItem?.document || ''} readOnly />
        </div>
      </Dialog>

      {canManage && (
        <Dialog header="Cliente" visible={open} style={{ width: '30rem' }} onHide={() => setOpen(false)}>
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

            <label>E-mail</label>
            <InputText
              type="email"
              className={invalidFields.email ? 'p-invalid' : ''}
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value.toLowerCase() });
                setInvalidFields((current) => ({ ...current, email: false }));
              }}
            />

            <label>Telefone</label>
            <InputMask
              className={invalidFields.phone ? 'p-invalid' : ''}
              mask="(99) 99999-9999"
              value={form.phone}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value });
                setInvalidFields((current) => ({ ...current, phone: false }));
              }}
            />

            <label>Documento (CPF)</label>
            <InputMask
              className={invalidFields.document ? 'p-invalid' : ''}
              mask="999.999.999-99"
              value={form.document}
              onChange={(e) => {
                setForm({ ...form, document: e.target.value });
                setInvalidFields((current) => ({ ...current, document: false }));
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
