import { createFileRoute } from "@tanstack/react-router";
import { ConsoleApp } from "@/console/ConsoleApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FRIDAY Console — Local AI Runtime Observability" },
      { name: "description", content: "Cinematic observability and safe-control console for the FRIDAY local-first multi-agent AI runtime." },
      { property: "og:title", content: "FRIDAY Console" },
      { property: "og:description", content: "Local-first multi-agent AI runtime observability console." },
    ],
  }),
  component: Index,
});

function Index() {
  return <ConsoleApp />;
}
