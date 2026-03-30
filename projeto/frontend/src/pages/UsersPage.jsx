import { useEffect, useRef, useState } from 'react';
import AppMenu from '../components/AppMenu';
import { request } from '../services/api';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { useAuth } from '../context/AuthContext';

const TOAST_LIFE = 4200;
const TOAST_SUCCESS_LIFE = 3200;

const roleOptions = [
  { label: 'Administrador', value: 'adm' },
  { label: 'Usuário', value: 'user' }
];

const emptyForm = {
  _id: null,
  name: '',
  email: '',
  password: '',
  role: 'user'
};

function isBlank(value) {
  return !String(value ?? '').trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@([^\s@.]+\.)+[A-Za-z]{2,}$/.test(String(value ?? '').trim());
}

export default function UsersPage() {
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

  async function load() {
    const data = await request('/users');
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  function newItem() {
    setForm(emptyForm);
    setInvalidFields({});
    setSaving(false);
    setOpen(true);
  }

  function editItem(row) {
    setForm({ ...row, password: '' });
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

    const needsPassword = !form._id;
    const nextInvalidFields = {
      name: isBlank(form.name),
      email: isBlank(form.email) || !isValidEmail(form.email),
      password: needsPassword && isBlank(form.password),
      role: !form.role
    };

    if (Object.values(nextInvalidFields).some(Boolean)) {
      setInvalidFields(nextInvalidFields);
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: nextInvalidFields.email
          ? 'Informe um e-mail válido antes de salvar.'
          : needsPassword
            ? 'Preencha nome, e-mail, senha e perfil antes de salvar.'
            : 'Preencha nome, e-mail e perfil antes de salvar.',
        life: TOAST_LIFE
      });
      return;
    }

    setInvalidFields({});
    setSaving(true);

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      ...(form.password ? { password: form.password } : {})
    };

    try {
      if (form._id) {
        await request(`/users/${form._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await request('/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      setOpen(false);
      await load();
      toast.current?.show({
        severity: 'success',
        summary: form._id ? 'Usuário atualizado' : 'Usuário criado',
        detail: `${form.name} foi ${form._id ? 'editado' : 'criado'} com sucesso.`,
        life: TOAST_SUCCESS_LIFE
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Falha ao salvar',
        detail: error.message || 'Não foi possível salvar o usuário.',
        life: TOAST_LIFE
      });
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(row) {
    if (row.active !== false) {
      toast.current?.show({
        severity: 'error',
        summary: 'Desative o acesso antes de excluir',
        detail: 'Só é possível excluir usuários com o acesso desativado.',
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
          await request(`/users/${row._id}`, { method: 'DELETE' });
          await load();
          toast.current?.show({
            severity: 'success',
            summary: 'Usuário removido',
            detail: `${row.name} foi excluído com sucesso.`,
            life: TOAST_SUCCESS_LIFE
          });
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Exclusão não permitida',
            detail: error.message || 'Desative o acesso do usuário antes de excluí-lo.',
            life: TOAST_LIFE
          });
        }
      }
    });
  }

  async function toggleActive(row, nextActive = !row.active) {

    await request(`/users/${row._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: row.name,
        email: row.email,
        role: row.role,
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

  return (
    <div className="page">
      <Toast
        ref={toast}
        position="top-right"
        baseZIndex={open || viewOpen ? 2600 : 1000}
        className={open || viewOpen ? 'toast-elevated' : ''}
      />
      <ConfirmDialog />
      <AppMenu />

      <div className="page-content">
        <div className="page-header">
          <div className="page-title">
            <h2>Usuários</h2>
            <p>Visualize perfis cadastrados e mantenha o controle de acessos.</p>
          </div>
          {canManage && <Button label="Novo usuário" icon="pi pi-plus" onClick={newItem} />}
        </div>

        <DataTable value={items} paginator rows={10} stripedRows className="data-shell">
          <Column field="name" header="Nome" />
          <Column field="email" header="E-mail" />
          <Column field="role" header="Perfil" />
          <Column
            header="Status"
            headerStyle={{ textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
            headerClassName="control-column status-column"
            bodyClassName="control-column-cell status-column"
            style={{ width: '9rem' }}
            body={(row) => (
              <div className="table-control-cell">
                <span className={`status-badge ${row.active === false ? 'is-inactive' : 'is-active'}`}>
                  {row.active === false ? 'Inativo' : 'Ativo'}
                </span>
              </div>
            )}
          />
          <Column
            header="Ações"
            headerStyle={{ textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
            headerClassName="control-column actions-column"
            bodyClassName="control-column-cell actions-column"
            style={{ width: '10rem' }}
            body={(row) => (
              <div className="table-control-cell">
                <div className="row-actions">
                  <Button icon="pi pi-eye" text tooltip="Visualizar" tooltipOptions={{ position: 'top' }} aria-label="Visualizar" className="action-button action-view" onClick={() => viewItem(row)} />
                  {canManage && <Button icon="pi pi-pencil" text tooltip="Editar" tooltipOptions={{ position: 'top' }} aria-label="Editar" className="action-button action-edit" onClick={() => editItem(row)} />}
                  {canManage && <Button icon="pi pi-trash" text severity="danger" tooltip="Excluir" tooltipOptions={{ position: 'top' }} aria-label="Excluir" className="action-button action-delete" onClick={() => removeItem(row)} />}
                </div>
              </div>
            )}
          />
          {canManage && (
            <Column
              header="Acesso"
              headerStyle={{ textAlign: 'center' }}
              bodyStyle={{ textAlign: 'center' }}
              headerClassName="control-column access-column"
              bodyClassName="control-column-cell access-column"
              style={{ width: '13rem' }}
              body={(row) => (
                <div className="table-control-cell">
                  <div className="access-action">
                    <InputSwitch checked={row.active !== false} onChange={(e) => toggleActive(row, e.value)} />
                    <span className={`access-label ${row.active === false ? 'is-off' : 'is-on'}`}>
                      {row.active === false ? 'Desativado' : 'Ativado'}
                    </span>
                  </div>
                </div>
              )}
            />
          )}
        </DataTable>
      </div>

      <Dialog header="Visualizar usuário" visible={viewOpen} style={{ width: '30rem' }} onHide={() => setViewOpen(false)}>
        <div className="form-col">
          <label>Nome</label>
          <InputText value={selectedItem?.name || ''} readOnly />

          <label>E-mail</label>
          <InputText value={selectedItem?.email || ''} readOnly />

          <label>Perfil</label>
          <InputText value={selectedItem?.role || ''} readOnly />
        </div>
      </Dialog>

      {canManage && (
        <Dialog header="Usuário" visible={open} style={{ width: '30rem' }} onHide={() => setOpen(false)}>
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

            <label>Senha</label>
            <InputText
              className={invalidFields.password ? 'p-invalid' : ''}
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setInvalidFields((current) => ({ ...current, password: false }));
              }}
            />

            <label>Perfil</label>
            <Dropdown
              className={invalidFields.role ? 'p-invalid' : ''}
              value={form.role}
              options={roleOptions}
              onChange={(e) => {
                setForm({ ...form, role: e.value });
                setInvalidFields((current) => ({ ...current, role: false }));
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
