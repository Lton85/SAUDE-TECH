
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { FilaDeEsperaItem } from "@/types/fila"
import { format } from 'date-fns';

const chartConfig = {
  normal: {
    label: "Normal",
    color: "hsl(var(--chart-2))",
  },
  preferencial: {
    label: "Preferencial",
    color: "hsl(var(--chart-4))",
  },
  urgencia: {
    label: "Urgência",
    color: "hsl(var(--chart-1))",
  },
  cancelado: {
    label: "Cancelado",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function AtendimentosChart({ data }: { data: FilaDeEsperaItem[] }) {
  const chartData = React.useMemo(() => {
    const hourlyCounts: { [key: string]: { normal: number; preferencial: number; urgencia: number; cancelado: number; } } = {};

    // Initialize hours from 7 AM to 10 PM
    for (let i = 7; i <= 22; i++) {
        const hour = i.toString().padStart(2, '0') + ":00";
        hourlyCounts[hour] = { normal: 0, preferencial: 0, urgencia: 0, cancelado: 0 };
    }

    data.forEach(item => {
      const eventTime = item.status === 'cancelado' ? item.canceladaEm?.toDate() : item.finalizadaEm?.toDate();
      if (eventTime) {
        const hour = format(eventTime, 'HH') + ":00";
        if(hourlyCounts[hour]) {
            if (item.status === 'cancelado') {
                hourlyCounts[hour].cancelado++;
            } else {
                 switch(item.classificacao) {
                    case 'Normal':
                        hourlyCounts[hour].normal++;
                        break;
                    case 'Preferencial':
                        hourlyCounts[hour].preferencial++;
                        break;
                    case 'Urgência':
                        hourlyCounts[hour].urgencia++;
                        break;
                }
            }
        }
      }
    });

    return Object.keys(hourlyCounts).map(hour => ({
      hour,
      ...hourlyCounts[hour],
    })).sort((a,b) => a.hour.localeCompare(b.hour));
  }, [data])

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle className="text-base">Infográfico de Produtividade</CardTitle>
        <CardDescription className="text-xs">Atendimentos finalizados e cancelados por hora, divididos por tipo.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 pl-2">
        <ChartContainer config={chartConfig} className="h-80 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} accessibilityLayer stackOffset="sign" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="hour"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 2) + 'h'}
                />
                <YAxis allowDecimals={false}/>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="urgencia" fill="var(--color-urgencia)" radius={0} stackId="a" />
                <Bar dataKey="preferencial" fill="var(--color-preferencial)" radius={0} stackId="a" />
                <Bar dataKey="cancelado" fill="var(--color-cancelado)" radius={0} stackId="a" />
                <Bar dataKey="normal" fill="var(--color-normal)" radius={4} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
