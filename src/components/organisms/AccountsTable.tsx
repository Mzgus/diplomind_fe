import React from "react";
import SearchBar from "../molecules/SearchBar";
import Button from "../atoms/Buttons/Button";
import StatusBadge from "../atoms/StatusBadge";
import ActionMenu from "../molecules/ActionMenu";
import { PlusIcon } from "@heroicons/react/24/outline";

interface AccountDisplay {
    id: number;
    email: string;
    lastName: string;
    firstName: string;
    roles: string[];
    active: boolean;
    profilePicture: string | null;
    sheets: any[];
}

interface AccountsTableProps {
    accounts: AccountDisplay[];
    selectedAccountId: number | null;
    onSelectAccount: (id: number) => void;
    searchQuery: string;
    onSearchChange: (val: string) => void;
    onAddAccount: () => void;
    onEditAccount: (acc: AccountDisplay) => void;
    onDeleteAccount: (acc: AccountDisplay) => void;
    loading: boolean;
}

const AccountsTable: React.FC<AccountsTableProps> = ({
    accounts,
    selectedAccountId,
    onSelectAccount,
    searchQuery,
    onSearchChange,
    onAddAccount,
    onEditAccount,
    onDeleteAccount,
    loading
}) => {
    const filteredAccounts = accounts.filter(acc =>
        acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.firstName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-surface rounded-xl shadow-md border border-border overflow-hidden">
            {/* Header controls inside the component container */}
            <div className="p-4 border-b border-border bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-2/3">
                    <SearchBar
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Rechercher un compte..."
                    />
                </div>
                <div className="w-full sm:w-1/3">
                    <Button
                        className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-sm transition-colors"
                        onClick={onAddAccount}
                    >
                        <PlusIcon className="w-4 h-4" />
                        Nouveau compte
                    </Button>
                </div>
            </div>

            {/* Table Body with internal scroll */}
            <div className="flex-1 overflow-y-auto">
                {loading && accounts.length === 0 ? (
                    <div className="flex items-center justify-center p-12">
                        <span className="text-sm text-text-muted">Chargement des comptes...</span>
                    </div>
                ) : (
                    <table className="w-full whitespace-no-wrap">
                        <thead>
                            <tr className="text-xs font-semibold tracking-wide text-left text-text-main uppercase border-b border-border">
                                <th className="px-4 py-3 sticky top-0 bg-background z-10">Avatar</th>
                                <th className="px-4 py-3 sticky top-0 bg-background z-10">Email</th>
                                <th className="px-4 py-3 sticky top-0 bg-background z-10">Nom</th>
                                <th className="px-4 py-3 sticky top-0 bg-background z-10">Prénom</th>
                                <th className="px-4 py-3 sticky top-0 bg-background z-10">Rôles</th>
                                <th className="px-4 py-3 sticky top-0 bg-background z-10">Statut</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-background z-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredAccounts.map((acc) => {
                                const isSelected = acc.id === selectedAccountId;
                                return (
                                    <tr
                                        key={acc.id}
                                        onClick={() => onSelectAccount(acc.id)}
                                        className={`text-text-muted cursor-pointer transition-colors duration-150 ${isSelected
                                            ? "bg-[#E5F3F7] dark:bg-[#1A3644] text-[#1E3A47] dark:text-[#E2E8F0] font-medium"
                                            : "hover:bg-background/40"
                                            }`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-border flex items-center justify-center">
                                                {acc.profilePicture ? (
                                                    <img src={acc.profilePicture} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold bg-background">
                                                        {acc.firstName.charAt(0)}{acc.lastName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm truncate max-w-[150px]" title={acc.email}>
                                            {acc.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm truncate max-w-[100px]">{acc.lastName}</td>
                                        <td className="px-4 py-3 text-sm truncate max-w-[100px]">{acc.firstName}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex flex-wrap gap-1">
                                                {acc.roles.map((r, i) => (
                                                    <StatusBadge key={i} type="role" value={r} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <StatusBadge type="status" value={acc.active} />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center" onClick={(e) => e.stopPropagation()}>
                                            <ActionMenu
                                                onEdit={() => onEditAccount(acc)}
                                                onDelete={() => onDeleteAccount(acc)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredAccounts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-text-secondary">
                                        Aucun compte trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AccountsTable;
