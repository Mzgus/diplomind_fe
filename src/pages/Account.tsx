import React from "react";
import InfoField from "../components/molecules/InfoField";
import Button from "../components/atoms/Button";
import Label from "../components/atoms/Label";
import Badge from "../components/atoms/Badge";

const Account: React.FC = () => {
  // Données fictives pour l'exemple
  const userAccount = {
    lastName: "Franchomme",
    firstName: "Maxime",
    email: "maxime.franchomme@ecole-89.com",
    profileType: "Admin",
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mon Compte</h1>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <InfoField label="Nom" value={userAccount.lastName} />
          <InfoField label="Prénom" value={userAccount.firstName} />
        </div>
        <InfoField label="Email" value={userAccount.email} />
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-600">
            Type de profil
          </Label>
          <div className="mt-2">
            <Badge color="red">{userAccount.profileType}</Badge>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => console.log("Modification du compte")}
            className="w-full md:w-auto"
          >
            Modifier mes informations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Account;
