"use client";

import { useAuth } from "@/components/auth-provider";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TimeData {
  name: string; // formato "dd/MM/yyyy"
  chamados: number;
}

interface TechnicianData {
  name: string;
  assumidos: number;
  concluidos: number;
  tempoMedio: string;
  taxaConclusao: string;
  emAndamento: number;
}

interface MetricsData {
  statusData: any[];
  timeData: TimeData[];
  technicianData: TechnicianData[];
}

const allMonths = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export function DashboardMetrics() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Chave de cache
  const timeCacheKey = `dashboard_metrics_time`;

  // Estado para taxa de satisfação
  const [satisfacaoMediana, setSatisfacaoMediana] = useState<
    Record<string, number | null>
  >({});

  // Filtros para o gráfico de linha
  const [period, setPeriod] = useState<"semana" | "mes" | "ano">("semana");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  ); // 1-12

  // Filtros de data para semana
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Função para buscar taxa de satisfação (useCallback para manter referência)
  const fetchSatisfacao = useCallback(async () => {
    if (!token) return;
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://chamados-backendapi.onrender.com";
      const response = await fetch(
        `${apiUrl}/api/relatorios/media-responsaveis`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Erro ao buscar taxa de satisfação");
      const data = await response.json();
      const map: Record<string, number | null> = {};
      data.resultado?.forEach((item: any) => {
        map[item.responsavel] = item.media;
      });
      setSatisfacaoMediana(map);
    } catch (err) {
      setSatisfacaoMediana({});
    }
  }, [token]);

  // Carregar cache da aba "time"
  useEffect(() => {
    const cached = localStorage.getItem(timeCacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          setMetricsData(parsed);
          setIsLoading(false);
        }
      } catch {}
    }
  }, [timeCacheKey]);

  // Buscar dados da API e atualizar cache
  useEffect(() => {
    async function fetchMetrics() {
      if (!token) return;

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://chamados-backendapi.onrender.com";
        const response = await fetch(`${apiUrl}/api/tickets/metrics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar métricas: ${response.status}`);
        }

        const data = await response.json();

        setMetricsData(data);
        // Atualiza cache local
        localStorage.setItem(timeCacheKey, JSON.stringify(data));
      } catch (err) {
        console.error("Erro ao buscar métricas:", err);
        setError(
          "Não foi possível carregar as métricas. Tente novamente mais tarde."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Chama a função de buscar satisfação ao montar o componente
  useEffect(() => {
    fetchSatisfacao();
  }, [fetchSatisfacao]);

  // Extrair anos disponíveis dos dados
  const allYears = metricsData
    ? Array.from(
        new Set(
          metricsData.timeData.map((d) => {
            const [day, month, year] = d.name.split("/");
            return Number(year);
          })
        )
      ).sort((a, b) => b - a)
    : [];

  // Filtrar dados conforme o período selecionado
  const filteredTimeData = (() => {
    if (!metricsData) return [];
    const data = metricsData.timeData;

    if (period === "semana") {
      if (startDate && endDate) {
        return data.filter((d) => {
          const [day, month, year] = d.name.split("/");
          const dataStr = `${year}-${month.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}`;
          return dataStr >= startDate && dataStr <= endDate;
        });
      }
      // Últimos 7 dias (padrão)
      return data.slice(-7);
    }
    if (period === "mes") {
      // Filtra pelo mês e ano selecionados
      return data.filter((d) => {
        const [day, month, year] = d.name.split("/");
        return Number(month) === selectedMonth && Number(year) === selectedYear;
      });
    }
    if (period === "ano") {
      // Filtra pelo ano selecionado
      return data.filter((d) => {
        const [day, month, year] = d.name.split("/");
        return Number(year) === selectedYear;
      });
    }
    return data;
  })();

  if (isLoading) {
    return (
      <div className="col-span-3 flex h-64 items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-3">
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!metricsData) {
    return (
      <Card className="col-span-3">
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-center text-muted-foreground">
            Nenhum dado disponível.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle className="font-semibold text-white">
            Visão Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <label>Período:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="border rounded px-2 py-1 bg-background"
            >
              <option value="semana">Semana</option>
              <option value="mes">Mês</option>
              <option value="ano">Ano</option>
            </select>
            {period === "semana" && (
              <>
                <label>Início:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-2 py-1 bg-background"
                  max={endDate || undefined}
                />
                <label>Fim:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-2 py-1 bg-background"
                  min={startDate || undefined}
                />
              </>
            )}
            {(period === "mes" || period === "ano") && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border rounded px-2 py-1 bg-background"
              >
                {allYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
            {period === "mes" && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border rounded px-2 py-1 bg-background"
              >
                {allMonths.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="rounded-xl bg-background p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="chamados"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Desempenho Individual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {metricsData.technicianData.length > 0 ? (
              metricsData.technicianData.map((tech) => (
                <div key={tech.name} className="space-y-2">
                  <h3 className="text-lg font-medium">{tech.name}</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Assumidos</p>
                      <p className="text-2xl font-bold">{tech.assumidos}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Concluídos
                      </p>
                      <p className="text-2xl font-bold">{tech.concluidos}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Tempo Médio
                      </p>
                      <p className="text-2xl font-bold">{tech.tempoMedio}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Taxa de Conclusão
                      </p>
                      <p className="text-2xl font-bold">{tech.taxaConclusao}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Em Andamento
                      </p>
                      <p className="text-2xl font-bold">{tech.emAndamento}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Taxa de satisfação
                      </p>
                      <p className="text-2xl font-bold">
                        {satisfacaoMediana[tech.name] !== undefined &&
                        satisfacaoMediana[tech.name] !== null
                          ? satisfacaoMediana[tech.name]
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                Nenhum dado de desempenho disponível.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
