import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface EventData {
  eventType: string;
  dates: { date: string; title: string }[];
}

interface TimelineChartProps {
  data: EventData[];
}

const HighTimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  const [selectedPoint, setSelectedPoint] = useState<{
    seriesName: string;
    date: string;
    titles: string[];
  } | null>(null);

  useEffect(() => {
    console.log("Highcharts version:", Highcharts.version);
  }, []);

  const uniqueEventTypes = data.map((d) => d.eventType);
  const colors = ["#FF4560", "#00E396", "#008FFB", "#FEB019", "#775DD0"];

  const series: Highcharts.SeriesScatterOptions[] = uniqueEventTypes.map((eventType, index) => {
    const entry = data.find((d) => d.eventType === eventType);

    const dateMap = (entry?.dates || []).reduce<
      Record<number, { count: number; fullDates: string[]; titles: string[] }>
    >((acc, { date, title }) => {
      const timestamp = new Date(date).getTime();
      if (!acc[timestamp]) {
        acc[timestamp] = { count: 0, fullDates: [], titles: [] };
      }
      acc[timestamp].count += 1;
      acc[timestamp].fullDates.push(new Date(timestamp).toLocaleDateString());
      acc[timestamp].titles.push(title);
      return acc;
    }, {});

    const scatterData = Object.entries(dateMap).map(([timestamp, val]) => ({
      x: Number(timestamp),
      y: index,
      marker: {
        radius: 4 + val.count * 2,
      },
      custom: {
        fullDates: val.fullDates,
        titles: val.titles,
      },
      dataLabels: val.count > 1
        ? {
            enabled: true,
            format: String(val.count),
            style: {
              fontWeight: "bold",
              color: "#000",
              textOutline: "none",
            },
          }
        : { enabled: false },
    }));

    return {
      type: "scatter",
      name: eventType,
      data: scatterData,
      color: colors[index % colors.length],
    };
  });

  const options: Highcharts.Options = {
    chart: {
      type: "scatter",
      zooming: {
        type: "x",
        mouseWheel: {
          enabled: true,
          type: "x",
          sensitivity: 1,
        },
        pinchType: "x",
        singleTouch: true,
      },
      panning: {
        enabled: true,
        type: "x",
      },
      resetZoomButton: {
        position: {
          align: "right",
          verticalAlign: "top",
          x: -10,
          y: 10,
        },
      },
    },
    title: {
      text: "Events Timeline",
    },
    xAxis: {
      type: "datetime",
      title: { text: "Year" },
    },
    yAxis: {
      title: {
        text: "Event Types",
      },
      min: -1,
      max: uniqueEventTypes.length,
      tickPositions: Array.from({ length: uniqueEventTypes.length }, (_, i) => i),
      labels: {
        formatter: function () {
          const idx = this.value as number;
          return uniqueEventTypes[idx] || "";
        },
      },
      plotLines: uniqueEventTypes.map((_, i) => ({
        color: colors[i % colors.length],
        value: i,
        width: 1,
        zIndex: 3,
        label: {
          text: uniqueEventTypes[i],
          align: "left",
          style: {
            color: "#000",
            fontWeight: "bold",
            background: "#eee",
          },
        },
      })),
    },
    tooltip: {
      useHTML: true,
      formatter: function () {
        const point = this.point;
        const fullDates = point.custom?.fullDates || [];
        const titles = point.custom?.titles || [];
        const date = Highcharts.dateFormat("%Y-%m-%d", point.x);

        let tooltipHtml = `<strong>${point.series.name}</strong><br/><strong>Main Date:</strong> ${date}<br/><strong>Total Events:</strong> ${fullDates.length}<br/><ul>`;
        fullDates.forEach((d: string, i: number) => {
          tooltipHtml += `<li><strong>${d}</strong>: ${titles[i]}</li>`;
        });
        tooltipHtml += `</ul>`;
        return tooltipHtml;
      },
    },
    plotOptions: {
      scatter: {
        animation: true,
        cursor: "pointer",
        marker: {
          symbol: "circle",
        },
        dataLabels: {
          inside: true,
          align: "center",
          verticalAlign: "middle",
          enabled: false, // default overridden per point
        },
        point: {
          events: {
            click: function () {
              const dateStr = new Date(this.x).toLocaleDateString();
              const point = this as Highcharts.Point & { custom?: { titles: string[] } };
              const titles = point.custom?.titles || [];
              setSelectedPoint({
                seriesName: this.series.name,
                date: dateStr,
                titles,
              });
            },
          },
        },
      },
    },
    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
    },
    series: series as Highcharts.SeriesOptionsType[],
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <HighchartsReact highcharts={Highcharts} options={options} />
      {selectedPoint && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <strong>Event Type:</strong> {selectedPoint.seriesName} <br />
          <strong>Date:</strong> {selectedPoint.date} <br />
          <strong>Titles:</strong>
          <ul>
            {selectedPoint.titles.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HighTimelineChart;
