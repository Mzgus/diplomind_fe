import React, { useContext, useState } from "react";
import InfoField from "../components/molecules/InfoField";
import Button from "../components/atoms/Buttons/Button";
import StatusBadge from "../components/atoms/StatusBadge";
import { AuthContext } from "../context/AuthContext";
import { UsersService } from "../_services/users.service";

const Account: React.FC = () => {
  const context = useContext(AuthContext);
  if (!context) return null;
  const { user } = context;

  const [showPwdForm, setShowPwdForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 8) {
      setFeedback({ type: "error", msg: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", msg: "Les mots de passe ne correspondent pas." });
      return;
    }

    if (!user?.user_id || user.user_id <= 0) {
      setFeedback({ type: "error", msg: "Profil non associé à un compte. Impossible de changer le mot de passe." });
      return;
    }

    try {
      setLoading(true);
      await UsersService.updateUserAuthPassword(user.user_id, newPassword);
      setFeedback({ type: "success", msg: "Mot de passe mis à jour avec succès." });
      setNewPassword("");
      setConfirmPassword("");
      setShowPwdForm(false);
    } catch (err: any) {
      let errorMsg = "Erreur lors du changement de mot de passe.";
      if (err.response) {
        // Le serveur a répondu avec un code d'erreur (4xx, 5xx)
        errorMsg = err.response.data?.error || err.response.data?.message || (typeof err.response.data === "string" ? err.response.data : errorMsg);
      } else if (err.request) {
        // La requête a été envoyée mais aucune réponse n'a été reçue
        errorMsg = "Le serveur ne répond pas. Veuillez vérifier votre connexion.";
      } else {
        // Erreur lors de la configuration de la requête
        errorMsg = err.message || errorMsg;
      }
      setFeedback({ type: "error", msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-6">Chargement...</div>;

  const roleKey = user.user_role ?? "student";

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-6 p-6">Mon Compte</h1>
      <div className="bg-surface p-8 pt-5 rounded-xl shadow-md max-w-2xl mx-auto border border-border">
        <div className="mb-4">
          <StatusBadge type="role" value={roleKey} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <InfoField label="Nom" value={user.user_lastname || "—"} />
          <InfoField label="Prénom" value={user.user_firstname || "—"} />
        </div>
        <InfoField label="Email" value={user.user_email || "—"} />

        {feedback && (
          <p className={`mt-4 text-sm font-medium ${feedback.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {feedback.msg}
          </p>
        )}

        {showPwdForm ? (
          <form onSubmit={handlePasswordChange} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={8}
              />
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => { setShowPwdForm(false); setFeedback(null); }}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-main transition-colors"
              >
                Annuler
              </button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-8 flex justify-end">
            <Button onClick={() => { setShowPwdForm(true); setFeedback(null); }} className="w-full md:w-auto">
              Modifier mon mot de passe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
