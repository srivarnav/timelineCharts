import TimelineChart from "./TimelineChart";
import { events } from "../events"; // Adjust the import path as necessary
import HighTimelineChart from "./RechartTimeline";

// const events = [
//   {
//     id: "50",
//     date: "08-04-2024",
//     title: "Account Statement Generated",
//     category: "Account Maintenance",
//   },
//   {
//     id: "51",
//     date: "10-04-2024",
//     title: "Trade Cancelled",
//     category: "Trading Events",
//   },
//   {
//     id: "52",
//     date: "11-07-2024",
//     title: "Dividend Reinvested",
//     category: "Trading Events",
//   },
//   {
//     id: "53",
//     date: "27-08-2024",
//     title: "KYC Verified",
//     category: "Account Maintenance",
//   },
//   {
//     id: "54",
//     date: "11-11-2024",
//     title: "Funds Withdrawn",
//     category: "Trading Events",
//   },
//   {
//     id: "55",
//     date: "30-11-2024",
//     title: "Account Created",
//     category: "Account Maintenance",
//   },
//   {
//     id: "56",
//     date: "25-04-2025",
//     title: "Capital Loss Realized",
//     category: "Tax Loss Harvesting",
//   },
//   {
//     id: "57",
//     date: "25-04-2025",
//     title: "Cash Withdrawal Processed",
//     category: "Tax Loss Harvesting",
//   },
//   {
//     id: "58",
//     date: "27-10-2025",
//     title: "Position Opened",
//     category: "Trading Events",
//   },
//   {
//     id: "59",
//     date: "01-11-2025",
//     title: "Account Closed",
//     category: "Account Maintenance",
//   },
//   {
//     id: "60",
//     date: "30-12-2025",
//     title: "Stock Split Occurred",
//     category: "Trading Events",
//   },
//   {
//     id: "60",
//     date: "30-12-2025",
//     title: "Stock Split Occurred",
//     category: "Trading Events",
//   },
//   {
//     id: "60",
//     date: "30-12-2025",
//     title: "Stock Split Occurred",
//     category: "Trading Events",
//   },
//   {
//     id: "60",
//     date: "30-12-2025",
//     title: "Stock Split Occurred",
//     category: "Trading Events",
//   },
// ];

interface IEvent {
  id: string;
  date: string; // Format: DD-MM-YYYY
  title: string;
  category: string;
}

function transformEvents(events: IEvent[]) {
  const result: Record<string, { date: string; title: string }[]> = {};

  events.forEach(({ date, title, category }) => {
    // Convert DD-MM-YYYY to YYYY-MM-DD
    const [day, month, year] = date.split("-");
    const formattedDate = `${year}-${month}-${day}`;

    if (!result[category]) {
      result[category] = [];
    }

    result[category].push({ date: formattedDate, title });
  });

  // Convert the result object into the desired array format
  const eventData = Object.entries(result).map(([eventType, entries]) => ({
    eventType,
    dates: entries, // now array of objects with date and title
  }));

  return eventData;
}
export default function App() {
  return (
    <div className="App">
      <h1>Timeline Chart (Apex Charts)</h1>
      <TimelineChart data={transformEvents(events)} />
      <h1 style={{marginTop: '10px'}}>Timeline Chart (HighCharts)</h1>
      <HighTimelineChart data={transformEvents(events)} />
    </div>
  );
}
