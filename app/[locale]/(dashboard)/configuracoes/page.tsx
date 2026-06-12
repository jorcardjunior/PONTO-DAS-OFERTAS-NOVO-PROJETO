"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User, Store, Bell, Shield, Info, Camera, Save,
  X, Eye, EyeOff, CheckCircle, AlertCircle,
  Building2, Phone, MapPin, FileText, Hash,
  Package, TrendingUp, DollarSign, Clock,
  Monitor, Smartphone, Globe, Mail,
  ChevronRight, ChevronLeft, Plus, Trash2, Users,
  Layers, RefreshCw, Server, ShieldCheck,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

type Tab = "perfil" | "loja" | "notificacoes" | "seguranca" | "usuarios" | "sistema";

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "loja", label: "Loja", icon: Building2 },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "sistema", label: "Sistema", icon: Info },
];

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("perfil");
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;
    async function loadProfile() {
      try {
        const { data } = await axios.get("/api/auth/profile");
        setProfileData(data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  const isAdmin = profileData?.role === "admin";

  // Se não for admin, mostra apenas a aba de perfil com aviso
  if (!isAdmin) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Configurações</h1>
        </div>
        <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-theme-primary">Acesso restrito</p>
            <p className="text-sm text-theme-secondary mt-1">
              Apenas administradores podem gerenciar as configurações do sistema.
              Entre em contato com o administrador para alterações.
            </p>
          </div>
        </div>
        <PerfilSection profileData={profileData} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-theme-primary">Configurações</h1>
        <p className="text-sm text-theme-secondary mt-1">
          Gerencie as configurações do sistema — apenas administradores têm acesso completo.
        </p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar de abas */}
        <nav className="lg:w-56 shrink-0">
          <div className="bg-theme-card rounded-xl border border-theme overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-purple-500/10 text-purple-600 border-l-2 border-purple-500"
                      : "text-theme-secondary hover:bg-theme-hover border-l-2 border-transparent"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  <ChevronRight size={14} className="ml-auto opacity-40" />
                </button>
              );
            })}
          </div>
        </nav>

        {/* Conteúdo da aba */}
        <div className="flex-1 min-w-0">
          {activeTab === "perfil" && <PerfilSection profileData={profileData} />}
          {activeTab === "loja" && <LojaSection />}
          {activeTab === "notificacoes" && <NotificacoesSection />}
          {activeTab === "seguranca" && <SegurancaSection />}
          {activeTab === "usuarios" && <UsuariosSection />}
          {activeTab === "sistema" && <SistemaSection />}
        </div>
      </div>
    </div>
  );
}

/* ========== PERFIL ========== */
function PerfilSection({ profileData }: { profileData: any }) {
  const [name, setName] = useState(profileData?.name || "");
  const [email] = useState(profileData?.email || "");
  const [avatar, setAvatar] = useState(profileData?.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState(profileData?.avatar || "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatar(result);
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    setAvatar("");
    setAvatarPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("O nome não pode ficar vazio");
      return;
    }
    setSaving(true);
    try {
      await axios.patch("/api/auth/profile", { name: name.trim(), avatar });
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  }

  const initials = (profileData?.name || "U").charAt(0).toUpperCase();

  return (
    <SectionCard title="Perfil do Usuário" description="Suas informações pessoais e foto de perfil." icon={User}>
      {/* Avatar */}
      <div className="flex items-center gap-5 mb-6">
        <div className="relative group">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-500/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-purple-500/20">
              {initials}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg"
            title="Alterar foto"
          >
            <Camera size={14} />
          </button>
          {avatarPreview && (
            <button
              onClick={removeAvatar}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
              title="Remover foto"
            >
              <X size={10} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-theme-primary">{profileData?.name || "Usuário"}</p>
          <p className="text-xs text-theme-muted">{profileData?.email}</p>
          <p className="text-xs text-theme-muted mt-0.5 capitalize">{profileData?.role === "admin" ? "Administrador" : "Usuário"}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wide">Nome completo</label>
          <input
            type="text"
            className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wide">Email</label>
          <input
            type="email"
            className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-muted cursor-not-allowed"
            value={email}
            disabled
          />
          <p className="text-xs text-theme-muted mt-1">O email não pode ser alterado.</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            <Save size={15} />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

/* ========== LOJA ========== */
function LojaSection() {
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    ie: "",
    telefone: "",
    whatsapp: "",
    email: "",
    cep: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Carrega dados da loja do banco
  useEffect(() => {
    async function loadStore() {
      try {
        const { data } = await axios.get("/api/store");
        if (data && data.id) {
          setForm({
            nome: data.name || "",
            cnpj: data.cnpj || "",
            ie: data.ie || "",
            telefone: data.phone || "",
            whatsapp: data.whatsapp || "",
            email: data.email || "",
            cep: data.cep || "",
            endereco: data.address || "",
            bairro: data.district || "",
            cidade: data.city || "",
            estado: data.state || "",
          });
        }
      } catch {
        // store ainda não existe, usa valores vazios
      } finally {
        setLoadingData(false);
      }
    }
    loadStore();
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await axios.patch("/api/store", {
        name: form.nome,
        cnpj: form.cnpj,
        ie: form.ie,
        phone: form.telefone,
        whatsapp: form.whatsapp,
        email: form.email,
        cep: form.cep,
        address: form.endereco,
        district: form.bairro,
        city: form.cidade,
        state: form.estado,
      });
      toast.success("Dados da loja salvos no banco de dados!");
    } catch {
      toast.error("Erro ao salvar dados da loja");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard title="Dados da Loja" description="Informações do seu estabelecimento comercial." icon={Building2}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome Fantasia" icon={Store} value={form.nome} onChange={(v) => update("nome", v)} />
        <Field label="CNPJ" icon={FileText} value={form.cnpj} onChange={(v) => update("cnpj", v)} />
        <Field label="Inscrição Estadual" icon={Hash} value={form.ie} onChange={(v) => update("ie", v)} />
        <Field label="Telefone" icon={Phone} value={form.telefone} onChange={(v) => update("telefone", v)} />
        <Field label="WhatsApp" icon={Smartphone} value={form.whatsapp} onChange={(v) => update("whatsapp", v)} />
        <Field label="Email" icon={Mail} value={form.email} onChange={(v) => update("email", v)} />
      </div>
      <hr className="border-theme my-4" />
      <p className="text-xs font-semibold text-theme-secondary uppercase tracking-wide mb-3 flex items-center gap-2"><MapPin size={13} /> Endereço</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label className="text-xs text-theme-secondary block mb-1">CEP</label>
          <input className="w-full p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40" value={form.cep} onChange={(e) => update("cep", e.target.value)} />
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-theme-secondary block mb-1">Endereço</label>
          <input className="w-full p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40" value={form.endereco} onChange={(e) => update("endereco", e.target.value)} />
        </div>
        <Field label="Bairro" icon={MapPin} value={form.bairro} onChange={(v) => update("bairro", v)} />
        <Field label="Cidade" icon={MapPin} value={form.cidade} onChange={(v) => update("cidade", v)} />
        <Field label="Estado" icon={MapPin} value={form.estado} onChange={(v) => update("estado", v)} />
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          <Save size={15} />
          {saving ? "Salvando..." : "Salvar Dados da Loja"}
        </button>
      </div>
    </SectionCard>
  );
}

/* ========== NOTIFICAÇÕES ========== */
function NotificacoesSection() {
  const [settings, setSettings] = useState({
    estoqueBaixo: true,
    estoqueMinimo: 5,
    vendasDiarias: true,
    relatorioSemanal: false,
    alertasFinanceiros: true,
    sonoro: false,
    emailNotif: true,
  });

  function toggle(key: keyof typeof settings, value?: number) {
    setSettings((prev) => ({
      ...prev,
      [key]: value !== undefined ? value : !prev[key],
    }));
  }

  function handleSave() {
    localStorage.setItem("ponto-notificacoes", JSON.stringify(settings));
    toast.success("Preferências de notificação salvas!");
  }

  return (
    <SectionCard title="Notificações" description="Configure como e quando deseja ser notificado." icon={Bell}>
      <div className="space-y-4">
        <ToggleItem
          label="Alerta de estoque baixo"
          description="Notificar quando um produto atingir o estoque mínimo"
          checked={settings.estoqueBaixo}
          onChange={() => toggle("estoqueBaixo")}
        />
        {settings.estoqueBaixo && (
          <div className="ml-8 pl-4 border-l-2 border-purple-500/30">
            <label className="text-xs text-theme-secondary block mb-1">Estoque mínimo global</label>
            <input
              type="number"
              min={1}
              className="w-24 p-2 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              value={settings.estoqueMinimo}
              onChange={(e) => toggle("estoqueMinimo", parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-theme-muted mt-1">Unidades — usado como padrão para novos produtos</p>
          </div>
        )}
        <ToggleItem
          label="Resumo diário de vendas"
          description="Receber um resumo das vendas ao final do dia"
          checked={settings.vendasDiarias}
          onChange={() => toggle("vendasDiarias")}
        />
        <ToggleItem
          label="Relatório semanal"
          description="Relatório executivo enviado toda segunda-feira"
          checked={settings.relatorioSemanal}
          onChange={() => toggle("relatorioSemanal")}
        />
        <ToggleItem
          label="Alertas financeiros"
          description="Notificar quando margem de lucro cair abaixo do esperado"
          checked={settings.alertasFinanceiros}
          onChange={() => toggle("alertasFinanceiros")}
        />
        <ToggleItem
          label="Notificações por email"
          description="Receber alertas também no email"
          checked={settings.emailNotif}
          onChange={() => toggle("emailNotif")}
        />
        <ToggleItem
          label="Som de notificação"
          description="Tocar um som ao receber alertas no sistema"
          checked={settings.sonoro}
          onChange={() => toggle("sonoro")}
        />
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Save size={15} />
          Salvar Preferências
        </button>
      </div>
    </SectionCard>
  );
}

/* ========== SEGURANÇA ========== */
function SegurancaSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleChangePassword() {
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "A nova senha deve ter no mínimo 6 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não conferem." });
      return;
    }

    setSaving(true);
    try {
      await axios.post("/api/auth/change-password", { currentPassword, newPassword });
      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Erro ao alterar senha.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard title="Segurança" description="Altere sua senha e gerencie a segurança da sua conta." icon={Shield}>
      {/* Sessões ativas */}
      <div className="mb-6 p-4 bg-theme-container rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Monitor size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-theme-primary">Sessão atual</p>
              <p className="text-xs text-theme-muted">Chrome em Windows — Ativo agora</p>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">Ativo</span>
        </div>
      </div>

      <hr className="border-theme mb-6" />
      <h3 className="text-sm font-semibold text-theme-primary mb-4">Alterar Senha</h3>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wide">Senha atual</label>
          <div className="relative mt-1">
            <input
              type={showPw ? "text" : "password"}
              className="w-full p-2.5 pr-10 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wide">Nova senha</label>
          <input
            type={showPw ? "text" : "password"}
            className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wide">Confirmar nova senha</label>
          <input
            type={showPw ? "text" : "password"}
            className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-red-500/10 text-red-400"
          }`}>
            {message.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {message.text}
          </div>
        )}

        <div>
          <button
            onClick={handleChangePassword}
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            <Shield size={15} />
            {saving ? "Alterando..." : "Alterar Senha"}
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

/* ========== USUÁRIOS ========== */
const USERS_PER_PAGE = 5;

function UsuariosSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  // Confirm dialogs state
  const [confirmDel, setConfirmDel] = useState<{ userId: string; userName: string } | null>(null);
  const [confirmRole, setConfirmRole] = useState<{ userId: string; userName: string; newRole: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/auth/users");
      setUsers(data);
    } catch {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Paginação
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const displayedUsers = users.slice(page * USERS_PER_PAGE, (page + 1) * USERS_PER_PAGE);

  async function handleDelete() {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/auth/users/${confirmDel.userId}`);
      toast.success(`Usuário "${confirmDel.userName}" removido!`);
      setConfirmDel(null);
      if (page >= totalPages - 1 && page > 0) setPage(page - 1);
      loadUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Erro ao remover usuário";
      toast.error(msg);
      setConfirmDel(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleRoleChange() {
    if (!confirmRole) return;
    setUpdatingRole(true);
    const label = confirmRole.newRole === "admin" ? "administrador" : "usuário";
    try {
      await axios.patch(`/api/auth/users/${confirmRole.userId}`, { role: confirmRole.newRole });
      toast.success(`"${confirmRole.userName}" agora é ${label}!`);
      setConfirmRole(null);
      loadUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Erro ao alterar role";
      toast.error(msg);
      setConfirmRole(null);
    } finally {
      setUpdatingRole(false);
    }
  }

  return (
    <SectionCard title="Usuários do Sistema" description="Gerencie os usuários que têm acesso ao sistema." icon={Users}>
      {/* Botão Convidar + total */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-theme-muted">{users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Convidar Usuário
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      ) : (
        <>
          <div className="space-y-2 min-h-[300px]">
            {users.length === 0 ? (
              <p className="text-center py-8 text-theme-muted text-sm">Nenhum usuário encontrado.</p>
            ) : (
              displayedUsers.map((u: any) => {
                const initial = (u.name || "U").charAt(0).toUpperCase();
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-theme hover:bg-theme-hover transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-sm font-bold ${
                          u.role === "admin"
                            ? "bg-purple-500/20 text-purple-500"
                            : "bg-theme-container text-theme-secondary"
                        }`}>
                          {initial}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-theme-primary truncate">
                        {u.name || "Sem nome"}
                        {u.role === "admin" && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-medium">Admin</span>
                        )}
                      </p>
                      <p className="text-xs text-theme-muted truncate">{u.email}</p>
                      <p className="text-xs text-theme-muted mt-0.5">
                        {u._count.products} produtos · {u._count.categories} cat. · {u._count.moves} mov.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Role toggle */}
                      <select
                        value={u.role}
                        onChange={(e) => setConfirmRole({ userId: u.id, userName: u.name || u.email, newRole: e.target.value })}
                        className="text-xs p-1.5 bg-theme-container border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      >
                        <option value="user">Usuário</option>
                        <option value="admin">Admin</option>
                      </select>

                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDel({ userId: u.id, userName: u.name || u.email })}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remover usuário"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-theme">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg text-theme-secondary hover:bg-theme-hover transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    i === page
                      ? "bg-purple-500/10 text-purple-600"
                      : "text-theme-secondary hover:bg-theme-hover"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg text-theme-secondary hover:bg-theme-hover transition-colors disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!confirmDel}
        title="Remover usuário"
        message={`Tem certeza que deseja remover "${confirmDel?.userName || ""}"? Esta ação irá deletar todos os dados relacionados (produtos, vendas, etc.).`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setConfirmDel(null); setDeleting(false); }}
        loading={deleting}
      />

      {/* Confirm Role Change Dialog */}
      <ConfirmDialog
        open={!!confirmRole}
        title="Alterar permissão"
        message={`Alterar "${confirmRole?.userName || ""}" para ${confirmRole?.newRole === "admin" ? "administrador" : "usuário"}?`}
        confirmLabel="Alterar"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleRoleChange}
        onCancel={() => setConfirmRole(null)}
        loading={updatingRole}
      />

      {modalOpen && <InviteUserModal onClose={() => setModalOpen(false)} onCreated={loadUsers} />}
    </SectionCard>
  );
}

function InviteUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setSaving(true);
    try {
      await axios.post("/api/auth/users", { name: name.trim(), email: email.trim(), password, role });
      toast.success(`Usuário "${name.trim()}" criado com sucesso!`);
      onCreated();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Erro ao criar usuário";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-md w-full shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2">
            <Users size={18} /> Convidar Usuário
          </h2>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-primary">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wide">Nome completo</label>
            <input
              type="text"
              className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria Silva"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wide">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@exemplo.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wide">Senha inicial</label>
            <input
              type="password"
              className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase tracking-wide">Permissão</label>
            <div className="flex gap-3 mt-1.5">
              <button
                onClick={() => setRole("user")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  role === "user"
                    ? "ring-2 ring-purple-500 bg-purple-500/10 text-purple-600"
                    : "bg-theme-container text-theme-secondary hover:bg-theme-hover"
                }`}
              >
                <User size={14} /> Usuário
              </button>
              <button
                onClick={() => setRole("admin")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  role === "admin"
                    ? "ring-2 ring-purple-500 bg-purple-500/10 text-purple-600"
                    : "bg-theme-container text-theme-secondary hover:bg-theme-hover"
                }`}
              >
                <ShieldCheck size={14} /> Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover">
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:opacity-90"
            >
              {saving ? "Criando..." : "Criar Usuário"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== SISTEMA ========== */
function SistemaSection() {
  return (
    <SectionCard title="Sistema" description="Informações da versão, estatísticas e ações do sistema." icon={Info}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <InfoBox icon={Layers} label="Versão" value="1.0.4" />
        <InfoBox icon={Globe} label="Ambiente" value="Produção" />
        <InfoBox icon={Monitor} label="Framework" value="Next.js 16.2.9" />
        <InfoBox icon={Server} label="Banco de Dados" value="PostgreSQL" />
      </div>

      <hr className="border-theme mb-4" />

      <h3 className="text-sm font-semibold text-theme-primary mb-3 flex items-center gap-2"><TrendingUp size={15} /> Estatísticas do Sistema</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatBox icon={Package} label="Produtos" value="—" />
        <StatBox icon={DollarSign} label="Vendas" value="—" />
        <StatBox icon={Clock} label="Sessão" value="Ativa" />
      </div>

      <hr className="border-theme mb-4" />

      <h3 className="text-sm font-semibold text-theme-primary mb-3">Ações do Sistema</h3>
      <div className="space-y-2">
        <ActionItem
          icon={RefreshCw}
          label="Reindexar dados"
          description="Recalcular índices de busca e relatórios"
          onClick={() => toast.success("Reindexação iniciada!")}
        />
      </div>
    </SectionCard>
  );
}

/* ========== COMPONENTES AUXILIARES ========== */

function SectionCard({ title, description, icon: Icon, children }: { title: string; description: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="bg-theme-card rounded-xl border border-theme p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-purple-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-primary">{title}</h2>
          <p className="text-xs text-theme-muted mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange }: { label: string; icon: typeof Store; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-theme-secondary block mb-1 flex items-center gap-1.5">
        <Icon size={12} /> {label}
      </label>
      <input
        className="w-full p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ToggleItem({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-theme-hover transition-colors">
      <div>
        <p className="text-sm font-medium text-theme-primary">{label}</p>
        <p className="text-xs text-theme-muted">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-purple-500" : "bg-theme-container-high border border-theme"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-theme-container rounded-xl">
      <Icon size={16} className="text-purple-500" />
      <div>
        <p className="text-xs text-theme-muted">{label}</p>
        <p className="text-sm font-medium text-theme-primary">{value}</p>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="p-4 bg-theme-container rounded-xl text-center">
      <Icon size={20} className="mx-auto mb-2 text-purple-500" />
      <p className="text-lg font-bold text-theme-primary">{value}</p>
      <p className="text-xs text-theme-muted">{label}</p>
    </div>
  );
}

function ActionItem({ icon: Icon, label, description, onClick }: { icon: typeof RefreshCw; label: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-theme-hover transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-purple-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-theme-primary">{label}</p>
        <p className="text-xs text-theme-muted">{description}</p>
      </div>
      <ChevronRight size={14} className="text-theme-muted" />
    </button>
  );
}


