
import React from "react";
import { CheckCircle } from "lucide-react";

export default function SuccessMessage() {
  return (
    <div className="text-center py-6">
      <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
      <p className="text-sm text-gray-600">
        Sua senha foi alterada com sucesso. Você será redirecionado para a página de login em instantes.
      </p>
    </div>
  );
}
