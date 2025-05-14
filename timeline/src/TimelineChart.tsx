import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

interface EventData {
  eventType: string;
  dates: { date: string; title: string }[];
}

interface TimelineChartProps {
  data: EventData[];
}

const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  const [selectedPoint, setSelectedPoint] = useState<{
    seriesName: string;
    date: string;
    titles: string[];
  } | null>(null);

  const uniqueEventTypes = data.map((d) => d.eventType);
  const colors = ["#FF4560", "#00E396", "#008FFB", "#FEB019", "#775DD0"];

  const series = uniqueEventTypes.map((eventType, index) => {
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

    return {
      name: eventType,
      data: Object.entries(dateMap).map(([timestamp, value]) => ({
        x: Number(timestamp),
        y: index,
        count: value.count,
        fullDates: value.fullDates,
        titles: value.titles,
      })),
    };
  });

  const yAnnotations = uniqueEventTypes.map((eventType, index) => ({
    y: index,
    borderColor: colors[index % colors.length],
    strokeDashArray: 0,
    label: {
      text: eventType,
      position: "left",
      style: {
        color: "#000",
        background: "#dcdcdc",
        fontWeight: 600,
      },
    },
  }));

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "scatter",
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      zoom: {
        enabled: true,
        type: "x",
      },
      toolbar: {
        autoSelected: "zoom",
        tools: {
          zoomin: true,
          zoomout: true,
          reset: true,
        },
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const seriesIndex = config.seriesIndex;
          const dataPointIndex = config.dataPointIndex;
          const point = series[seriesIndex].data[dataPointIndex];

          if (point.x && typeof point.x === "number") {
            const dateStr = new Date(point.x).toLocaleDateString();
            setSelectedPoint({
              seriesName: series[seriesIndex].name,
              date: dateStr,
              titles: point.titles || [],
            });
          }
        },
      },
    },
    annotations: {
      yaxis: yAnnotations,
    },
    stroke: {
      width: 2,
      curve: "straight",
    },
    dataLabels: {
      enabled: true,
      textAnchor: "middle",
      formatter: function (_: any, { seriesIndex, dataPointIndex, w }) {
        const point = w.config.series[seriesIndex].data[dataPointIndex];
        return point.count > 1 ? point.count : "";
      },
      
      style: {
        colors: ["#43434e"], // or dark color if marker is light
        fontSize: "10px",
        fontWeight: "bold",
        fontFamily: 'Helvetica, Arial, sans-serif',
      },
      background: {
        enabled: false,
      },
    },
    markers: {
      size: 4,
      discrete: series.flatMap((s, seriesIdx) =>
        s.data.map((point, idx) => ({
          seriesIndex: seriesIdx,
          dataPointIndex: idx,
          size: 4 + (point.count ? point.count * 2 : 0),
        }))
      ),
      hover: {
        sizeOffset: 2,
      },
    },
    theme: {
      mode: "light",
    },
    xaxis: {
      type: "datetime",
      title: {
        text: "Year",
        style: { fontWeight: 600 },
      },
    },
    yaxis: {
      tickAmount: uniqueEventTypes.length,
      min: -1,
      max: uniqueEventTypes.length,
      labels: {
        formatter: (val: number) => {
          const index = Math.round(val);
          return index >= 0 && index < uniqueEventTypes.length
            ? uniqueEventTypes[index]
            : "";
        },
        style: {
          fontWeight: 600,
        },
      },
      title: {
        text: "Event Types",
        style: { fontWeight: 600 },
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    title: {
      text: "Events Timeline",
      align: "center",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
    legend: {
      position: "bottom",
    },
    tooltip: {
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const point = w.config.series[seriesIndex].data[dataPointIndex];
        const title = w.config.series[seriesIndex].name;
        const date = new Date(point.x).toLocaleDateString();
        const fullDates = point.fullDates || [];
        const titles = point.titles || [];

        return `
          <div style="padding: 10px;">
            <div><strong>${title}</strong></div>
            <div><strong>Main Date:</strong> ${date}</div>
            <div><strong>Total Events:</strong> ${fullDates.length}</div>
            <ul style="padding-left: 18px; margin-top: 5px;">
              ${fullDates
                .map(
                  (d: string, i: number) =>
                    `<li><strong>${d}</strong>: ${titles[i]}</li>`
                )
                .join("")}
            </ul>
          </div>
        `;
      },
      onDatasetHover: {
        highlightDataSeries: true,
    },
    },
    colors,
  };

  return (
    <div id="chart">
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="scatter"
        height={400}
      />
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

export default TimelineChart;
