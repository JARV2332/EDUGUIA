"use client";

import { RecurrenteClaveButton } from "@/components/payments/recurrente-clave-button";

type RecurrentePayActionsProps = {
  cursoId: string;
  itemName: string;
  amountInCents: number;
  currency?: string;
  reference?: string;
};

/** Solo botón Pagar con Clave (Recurrente). */
export function RecurrentePayActions(props: RecurrentePayActionsProps) {
  return (
    <div className="course-card__pay">
      <RecurrenteClaveButton {...props} />
    </div>
  );
}
