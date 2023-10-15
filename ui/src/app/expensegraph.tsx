"use client";
import Plot from 'react-plotly.js';
import { twMerge } from "tailwind-merge";
import styles from "./page.module.css";
import type { Data } from 'plotly.js';

const data: Data = {
  "type": "sankey",
  "orientation": "v",
  "node": {
    "pad": 15,
    "thickness": 30,
    "line": {
      "width": 0.0
    },
    "label": ["Income", "Housing", "Utilities", "Transportation", "Groceries", "Entertainment"],
    "color": ["#50c878", "blue", "blue", "blue", "blue", "blue"]
  },
  "link": {
    "source": [0, 0, 0, 0, 0],
    "target": [1, 2, 3, 4, 5],
    "value": [60, 20, 10, 5, 5]
  }
}

export default function ExpenseGraph() {
  return (
      <section className={twMerge("snap-start flex w-screen h-screen p-4", styles.background)}>
      <div className="z-10 mt-8 w-full rounded-xl bg-black/80">
        <h2 className="text-3xl text-center mt-4 font-extrabold tracking-tight sm:text-[3rem] text-white">
          How You Spend
        </h2>
        <Plot
          className="w-full h-full"
          data={[data]}
          layout={{
            width: 428,
            height: 800,
            plot_bgcolor: "transparent",
            paper_bgcolor: "transparent",
          }}
          config={{
            displayModeBar: false,
          }}
        />
      </div>
    </section>
  );
}
