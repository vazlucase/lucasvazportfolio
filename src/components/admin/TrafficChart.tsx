import { useMemo, useState } from 'react';
import type { AnalyticsReport, DailyPoint } from '../../analytics/types';
import { DashboardIcon } from './DashboardIcon';

interface ChartPoint { label: string; available: boolean; views: number; contacts: number; previousViews: number }
const shortDate = (date: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(`${date}T12:00:00-03:00`)).replace('.', '');
const count = (value: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
function groupDays(days: DailyPoint[], period: AnalyticsReport['period']): ChartPoint[] {
  if (period === '30d') return days.map(day => ({ label: shortDate(day.date), available: day.available, views: day.views, contacts: day.contacts, previousViews: day.previousViews }));
  const groups = new Map<string, ChartPoint>();
  for (let index = 0; index < days.length; index++) {
    const day = days[index];
    const key = period === '3m' ? String(Math.floor(index / 7)) : day.date.slice(0, 7);
    const label = period === '3m' ? `Semana de ${shortDate(day.date)}` : new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(`${day.date}T12:00:00-03:00`)).replace('.', '');
    const point = groups.get(key) ?? { label, available: false, views: 0, contacts: 0, previousViews: 0 };
    point.available = point.available || day.available;
    point.views += day.views; point.contacts += day.contacts; point.previousViews += day.previousViews;
    groups.set(key, point);
  }
  return [...groups.values()];
}
function curve(points: { x: number; y: number }[]) {
  return points.map((point, index) => {
    if (!index) return `M${point.x},${point.y}`;
    const previous = points[index - 1], middle = (previous.x + point.x) / 2;
    return `C${middle},${previous.y} ${middle},${point.y} ${point.x},${point.y}`;
  }).join(' ');
}

export function TrafficChart({ report }: { report: AnalyticsReport }) {
  const [metric, setMetric] = useState<'views' | 'contacts'>('views');
  const [compare, setCompare] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const data = useMemo(() => groupDays(report.daily, report.period), [report.daily, report.period]);
  const showComparison = compare && report.meta.comparisonComplete && metric === 'views';
  const width = 900, height = 280, left = 46, right = 18, top = 26, bottom = 42;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const maximum = Math.max(4, ...data.map(point => point[metric]), ...(showComparison ? data.map(point => point.previousViews) : []));
  const maxY = Math.ceil(maximum / 4) * 4;
  const coordinates = (previous = false) => data.map((point, index) => ({
    x: left + index / Math.max(1, data.length - 1) * plotWidth,
    y: top + plotHeight - (previous ? point.previousViews : point[metric]) / maxY * plotHeight,
  }));
  const points = coordinates(), visiblePoints = points.filter((_, index) => data[index].available), path = curve(visiblePoints), baseline = top + plotHeight;
  const active = selected === null ? null : { ...data[Math.min(selected, data.length - 1)], ...points[Math.min(selected, points.length - 1)] };
  const total = data.reduce((sum, point) => sum + point[metric], 0);
  return <section className="admin-card admin-traffic" aria-label="Evolução do tráfego">
    <div className="admin-card-heading"><div><span className="admin-eyebrow">AO LONGO DO TEMPO</span><h2>O movimento do seu site</h2><p>{report.period === '30d' ? 'Visão diária' : report.period === '3m' ? 'Visão semanal' : 'Visão mensal'} · horário de Brasília</p></div>
      <label className="admin-select-label"><span className="visually-hidden">Métrica do gráfico</span><select value={metric} onChange={event => { setMetric(event.target.value as 'views' | 'contacts'); setSelected(null); }}><option value="views">Visualizações</option><option value="contacts">Cliques de contato</option></select></label>
    </div>
    <div className="admin-chart-summary"><strong>{count(total)}</strong><span>{metric === 'views' ? 'visualizações' : 'cliques de contato'} no período</span><span className="admin-chart-legend"><i />Período atual</span>{showComparison && <span className="admin-chart-legend admin-chart-legend--previous"><i />Período anterior</span>}</div>
    <div className="admin-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="admin-chart" role="img" tabIndex={0}
        aria-label={`Evolução de ${metric === 'views' ? 'visualizações' : 'cliques de contato'}: ${count(total)} no período. Use as setas para explorar os pontos. A tabela abaixo contém todos os valores.`}
        onPointerMove={event => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width * width;
          setSelected(Math.max(0, Math.min(data.length - 1, Math.round((x - left) / plotWidth * (data.length - 1)))));
        }} onPointerLeave={() => setSelected(null)} onBlur={() => setSelected(null)}
        onKeyDown={event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); setSelected(Math.max(0, Math.min(data.length - 1, (selected ?? 0) + (event.key === 'ArrowRight' ? 1 : -1)))); } }}>
        <defs><linearGradient id="admin-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--lilac)" stopOpacity="0.3" /><stop offset="100%" stopColor="var(--lilac)" stopOpacity="0.01" /></linearGradient></defs>
        {Array.from({ length: 5 }, (_, index) => {
          const y = top + index / 4 * plotHeight;
          return <g key={index}><line x1={left} y1={y} x2={width - right} y2={y} stroke="var(--admin-line)" strokeDasharray="3 5" /><text x={left - 14} y={y + 4} textAnchor="end" className="admin-chart-label">{count(maxY * (1 - index / 4))}</text></g>;
        })}
        {showComparison && <path d={curve(coordinates(true))} fill="none" stroke="var(--admin-chart-previous)" strokeWidth="2" strokeDasharray="5 6" />}
        {visiblePoints.length > 0 && <><path d={`${path} L${visiblePoints[visiblePoints.length - 1].x},${baseline} L${visiblePoints[0].x},${baseline} Z`} fill="url(#admin-chart-fill)" /><path d={path} fill="none" stroke="var(--admin-chart)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{visiblePoints.length === 1 && <circle cx={visiblePoints[0].x} cy={visiblePoints[0].y} r="4" fill="var(--admin-chart)" />}</>}
        {data.map((point, index) => index % Math.max(1, Math.ceil((data.length - 1) / 5)) === 0 || index === data.length - 1 ? <text key={index} x={points[index].x} y={height - 11} textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'} className="admin-chart-label">{point.label.replace('Semana de ', '')}</text> : null)}
        {active?.available && <g><line x1={active.x} y1={top} x2={active.x} y2={baseline} stroke="var(--admin-chart)" strokeDasharray="3 4" /><circle cx={active.x} cy={active.y} r="5" fill="var(--admin-chart)" stroke="white" strokeWidth="3" /></g>}
      </svg>
      {active && <div className="admin-chart-tooltip" role="status" style={{ left: `${Math.min(80, Math.max(8, active.x / width * 100))}%` }}><span>{active.label}</span><strong>{active.available ? `${count(active[metric])} ${metric === 'views' ? 'views' : 'cliques'}` : 'Anterior à coleta'}</strong>{showComparison && <small>Anterior: {count(active.previousViews)}</small>}</div>}
      {!total && <div className="admin-chart-empty"><span><DashboardIcon name="conversions" /></span><strong>O próximo acesso vira um ponto aqui.</strong><p>O gráfico se atualiza conforme as visitas reais chegam.</p></div>}
    </div>
    <div className="admin-chart-footer"><label className="admin-check"><input type="checkbox" checked={compare} disabled={!report.meta.comparisonComplete || metric !== 'views'} onChange={event => setCompare(event.target.checked)} />Comparar com período anterior</label><span>{report.meta.comparisonComplete ? `${report.range.days} dias no período` : 'Histórico anterior ainda em formação'}</span></div>
    <details className="admin-chart-data"><summary>Ver dados do gráfico</summary><div className="admin-table-scroll"><table><caption className="visually-hidden">Dados diários do tráfego</caption><thead><tr><th>Data</th><th>Views</th><th>Visitantes</th><th>Contatos</th></tr></thead><tbody>{report.daily.map(day => <tr key={day.date}><td>{shortDate(day.date)}</td><td>{day.available ? count(day.views) : 'Sem histórico'}</td><td>{day.available ? count(day.visitors) : '—'}</td><td>{day.available ? count(day.contacts) : '—'}</td></tr>)}</tbody></table></div></details>
  </section>;
}
