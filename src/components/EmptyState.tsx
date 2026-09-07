import { Link } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit";

export function EmptyState({
  title = "Nada por aqui ainda",
  description = "Inicie uma produção na Fábrica ou carregue o modo demonstração.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Panel className="text-center">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      <Link
        to="/fabrica"
        className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Ir para a Fábrica
      </Link>
    </Panel>
  );
}
