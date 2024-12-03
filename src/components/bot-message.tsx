import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { BotChartResponse } from "mavenagi/api/resources/conversation/types/BotChartResponse";
import { ChartSpecSchema } from "mavenagi/api/resources/conversation/types/ChartSpecSchema";
import React from "react";

import { ReactMarkdown } from "./react-markdown";

export interface BotMessageProps {
  message: string;
}

export function RenderCharts({ charts }: { charts: BotChartResponse[] }) {
  return charts.map((chart, index) => {
    try {
      // currently only handle HIGHCHARTS_TS charts
      if (chart.specSchema !== ChartSpecSchema.HighchartsTs) {
        return null;
      }
      const chartOptions = JSON.parse(chart.spec);
      return (
        <div key={index} id={`chart-${index}`}>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      );
    } catch (e) {
      console.error(`Error rendering chart ${index}`, e);
      return <div className="text-red-500">Error rendering chart</div>;
    }
  });
}

export function BotMessage({ message }: BotMessageProps) {
  return (
    <>
      <div className="prose flex flex-col gap-2 max-w-full overflow-auto p-3">
        <ReactMarkdown linkTargetInNewTab={true}>{message}</ReactMarkdown>
      </div>
    </>
  );
}
