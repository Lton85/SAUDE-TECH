

"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { FilaDeEsperaItem } from "@/types/fila"
import { format } from 'date-fns';

const chartConfig = {
  atendimentos: {
    label: "Atendimentos",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function AtendimentosChart({ data }: { data: FilaDeEsperaItem[] }) {
  const chartData = React.useMemo(() => {
    const hourlyCounts: { [key: string]: number } = {};

    // Initialize hours from 7 AM to 10 PM
    for (let i = 7; i <= 22; i++) {
        const hour = i.toString().padStart(2, '0') + ":00";
        hourlyCounts[hour] = 0;
    }

    data.forEach(item => {
      if (item.finalizadaEm) {
        const hour = format(item.finalizadaEm.toDate(), 'HH') + ":00";
        if(hourlyCounts[hour] !== undefined) {
            hourlyCounts[hour]++;
        }
      }
    });

    return Object.keys(hourlyCounts).map(hour => ({
      hour,
      atendimentos: hourlyCounts[hour],
    })).sort((a,b) => a.hour.localeCompare(b.hour));
  }, [data])

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle className="text-base">Infográfico de Produtividade</CardTitle>
        <CardDescription className="text-xs">Número de atendimentos finalizados por hora.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 pl-2">
        <ChartContainer config={chartConfig} className="h-40">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} accessibilityLayer>
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
                content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="atendimentos" fill="var(--color-atendimentos)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
