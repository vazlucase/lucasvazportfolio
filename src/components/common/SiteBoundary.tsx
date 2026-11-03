import { Component } from 'react';
import type { ReactNode } from 'react';

export function SiteLoading() {
  return <div className="site-state" role="status" aria-live="polite"><span className="site-state-brand">lucas vaz<sup>®</sup></span><span className="site-state-line" aria-hidden="true" /><p>Preparando os detalhes…</p></div>;
}

export class SiteBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="site-state site-state--error"><span className="site-state-brand">lucas vaz<sup>®</sup></span><h1>Vamos tentar mais uma vez?</h1><p>Não foi possível carregar esta tela. Recarregue a página para continuar.</p><button onClick={() => location.reload()}>Recarregar página</button><a href="/">Voltar ao início</a></main>;
    return this.props.children;
  }
}
