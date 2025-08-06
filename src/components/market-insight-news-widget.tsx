// MarketInsightNewsWidget.jsx
import React, { useEffect, useRef, memo } from "react";

function MarketInsightNewsWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any existing content to prevent duplication
    if (container.current) {
      container.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "displayMode": "regular",
          "feedMode": "all_symbols",
          "colorTheme": "dark",
          "isTransparent": false,
          "locale": "en",
          "width": "100%",
          "height": 550
        }`;

    if (container.current) {
      container.current.appendChild(script);
    }

    // Cleanup function to remove script when component unmounts
    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container w-full" ref={container}>
      <div className="tradingview-widget-container__widget w-full"></div>
    </div>
  );
}

export default memo(MarketInsightNewsWidget);
