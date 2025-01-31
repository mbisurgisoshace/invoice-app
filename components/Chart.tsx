"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

interface ChartProps {
  data: { date: string; amount: number }[];
}

export function Chart({ data }: ChartProps) {
  return (
    <ChartContainer
      config={{
        amount: {
          label: "Amount",
          color: "hsl(var(--primary))",
        },
      }}
      className="min-h-[300px]"
    >
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <LineChart data={data}>
          <XAxis dataKey={"date"} />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Line
            type={"monotone"}
            dataKey={"amount"}
            strokeWidth={2}
            stroke="var(--color-amount)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
