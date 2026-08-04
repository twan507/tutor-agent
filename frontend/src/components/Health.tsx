export function Health({ status }: { status: string }) {
  return <p data-testid="health-status">API: {status}</p>;
}
